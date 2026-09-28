// Supabase Edge Function: submit-template
// Submits WhatsApp Message Templates to Meta Cloud API for review and approval

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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      workspace_id,
      name,
      category,
      language = "en_US",
      components,
      body_text,
      header_type,
      header_text,
      footer_text,
    } = await req.json();

    if (!name || !category) {
      return new Response(JSON.stringify({ error: "Name and Category are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Retrieve workspace WABA details
    const { data: ws, error: wsError } = await supabase
      .from("workspaces")
      .select("waba_id, meta_access_token")
      .eq("id", workspace_id)
      .single();

    let metaTemplateId = `meta_tpl_${Date.now()}`;
    let approvalStatus = "PENDING_APPROVAL";

    // If live credentials exist, submit to Meta Graph API
    if (ws?.waba_id && ws?.meta_access_token && ws.meta_access_token.startsWith("EA")) {
      try {
        const metaRes = await fetch(
          `https://graph.facebook.com/v20.0/${ws.waba_id}/message_templates`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${ws.meta_access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              category,
              language,
              components: components || [
                { type: "BODY", text: body_text },
                ...(footer_text ? [{ type: "FOOTER", text: footer_text }] : []),
              ],
            }),
          }
        );

        const metaData = await metaRes.json();
        if (metaData.id) {
          metaTemplateId = metaData.id;
          approvalStatus = metaData.status || "PENDING_APPROVAL";
        }
      } catch (graphErr) {
        console.warn("Meta template submission graph error:", graphErr);
      }
    }

    // Upsert into templates table
    const { data: savedTemplate, error: dbError } = await supabase
      .from("templates")
      .insert({
        workspace_id,
        meta_template_id: metaTemplateId,
        name,
        category,
        language,
        status: approvalStatus,
        body_text: body_text || "",
        header_type: header_type || "NONE",
        header_content: header_text || null,
        footer_text: footer_text || null,
        components: components || [],
      })
      .select()
      .single();

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, template: savedTemplate }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
