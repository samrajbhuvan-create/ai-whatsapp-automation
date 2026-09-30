// Supabase Edge Function: send-message
// Sends outbound WhatsApp text/media messages via Meta Cloud API
// within the active 24-hour customer service window.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      conversation_id,
      content,
      workspace_id,
      media_url,
      media_type,
    } = await req.json();

    if (!conversation_id || !content) {
      return new Response(JSON.stringify({ error: "Missing conversation_id or content" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch conversation details & check 24-hour window
    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .select("*, contacts(phone_number, name, opt_in_status)")
      .eq("id", conversation_id)
      .single();

    if (convErr || !conv) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetPhone = conv.contacts?.phone_number;
    if (!targetPhone) {
      return new Response(JSON.stringify({ error: "Contact phone number is missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check 24h window expiration
    const isExpired = conv.window_expires_at && new Date(conv.window_expires_at) < new Date();
    if (isExpired) {
      return new Response(
        JSON.stringify({
          error: "The 24-hour customer service window has expired. Meta policy requires an approved Template message to re-open the conversation.",
          code: "WINDOW_EXPIRED",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch workspace credentials
    const targetWsId = workspace_id || conv.workspace_id;
    const { data: ws } = await supabase
      .from("workspaces")
      .select("phone_number_id, meta_access_token")
      .eq("id", targetWsId)
      .single();

    let metaMsgId = `wamid_${Date.now()}`;
    let messageStatus = "SENT";

    // 3. Dispatch to Meta Cloud API if live token present
    if (ws?.phone_number_id && ws?.meta_access_token && ws.meta_access_token.startsWith("EA")) {
      try {
        const payload: any = {
          messaging_product: "whatsapp",
          to: targetPhone.replace(/[^0-9]/g, ""),
        };

        if (media_url && media_type) {
          payload.type = media_type;
          payload[media_type] = { link: media_url, caption: content };
        } else {
          payload.type = "text";
          payload.text = { body: content };
        }

        const metaRes = await fetch(
          `https://graph.facebook.com/v20.0/${ws.phone_number_id}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${ws.meta_access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const metaData = await metaRes.json();
        if (metaData.messages && metaData.messages[0]) {
          metaMsgId = metaData.messages[0].id;
        } else if (metaData.error) {
          messageStatus = "FAILED";
        }
      } catch (err) {
        console.warn("Meta Cloud API send warning:", err);
      }
    }

    // 4. Save to messages table
    const { data: insertedMsg, error: insertErr } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        workspace_id: targetWsId,
        meta_message_id: metaMsgId,
        wa_message_id: metaMsgId,
        direction: "outbound",
        sender_type: "agent",
        content,
        body: content,
        status: messageStatus.toLowerCase(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Update conversation state
    await supabase
      .from("conversations")
      .update({
        last_message_preview: content,
        last_message_time: new Date().toISOString(),
        unread_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversation_id);

    return new Response(
      JSON.stringify({ success: true, message: insertedMsg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
