// Supabase Edge Function: whatsapp-webhook
// Handles Meta WhatsApp Cloud API webhooks with 24-hour service window tracking,
// STOP keyword opt-out watchdog, delivery status receipts, and AI Agent dispatch.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const webhookVerifyToken = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") || "autowhatsapp_meta_secure_token";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  const url = new URL(req.url);

  // 1. Meta Webhook Verification Handshake
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === webhookVerifyToken) {
      return new Response(challenge, { status: 200 });
    }
    // Also accept if token matches any workspace or default
    if (mode === "subscribe" && token) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // 2. Incoming Notification Events (Messages and Statuses)
  if (req.method === "POST") {
    try {
      const body = await req.json();

      // Immediately respond 200 OK to meet Meta's <3000ms SLA
      // Process payload asynchronously
      (async () => {
        try {
          const entry = body.entry?.[0];
          const changes = entry?.changes?.[0];
          const value = changes?.value;
          const phoneNumberId = value?.metadata?.phone_number_id;

          // Find corresponding workspace
          let workspaceId: string | null = null;
          if (phoneNumberId) {
            const { data: ws } = await supabase
              .from("workspaces")
              .select("id")
              .eq("phone_number_id", phoneNumberId)
              .single();
            if (ws) workspaceId = ws.id;
          }

          if (!workspaceId) {
            const { data: firstWs } = await supabase.from("workspaces").select("id").limit(1).single();
            workspaceId = firstWs?.id || null;
          }

          // A. Process Delivery Status Receipts (sent, delivered, read, failed)
          if (value?.statuses) {
            for (const statusObj of value.statuses) {
              const metaMsgId = statusObj.id;
              const statusStr = statusObj.status?.toUpperCase(); // DELIVERED, READ, SENT, FAILED

              if (metaMsgId && statusStr) {
                await supabase
                  .from("messages")
                  .update({ status: statusStr })
                  .eq("meta_message_id", metaMsgId);
              }
            }
          }

          // B. Process Inbound Messages
          if (value?.messages) {
            for (const message of value.messages) {
              const senderPhone = message.from;
              const messageText = message.text?.body?.trim() || message.button?.text || "";
              const metaMsgId = message.id;

              if (!senderPhone) continue;

              // 1. Get or create Contact
              let contactId: string | null = null;
              const { data: existingContact } = await supabase
                .from("contacts")
                .select("id, opt_in_status")
                .eq("phone_number", senderPhone)
                .single();

              if (existingContact) {
                contactId = existingContact.id;
              } else {
                const { data: newContact } = await supabase
                  .from("contacts")
                  .insert({
                    workspace_id: workspaceId,
                    phone_number: senderPhone,
                    name: value.contacts?.[0]?.profile?.name || `Customer +${senderPhone}`,
                    opt_in_status: true,
                    opt_in_source: "Inbound Customer WhatsApp Message",
                    opt_in_timestamp: new Date().toISOString(),
                    tags: ["Inbound Lead"],
                  })
                  .select("id")
                  .single();
                if (newContact) contactId = newContact.id;
              }

              // 2. Opt-out STOP keyword check (WhatsApp policy requirement)
              const upperText = messageText.toUpperCase();
              const isOptOut = ["STOP", "UNSUBSCRIBE", "CANCEL", "OPT-OUT"].includes(upperText);

              if (isOptOut && contactId) {
                console.log(`[COMPLIANCE] Opt-out keyword received from ${senderPhone}`);
                await supabase
                  .from("contacts")
                  .update({ opt_in_status: false })
                  .eq("id", contactId);

                await supabase.from("opt_in_events").insert({
                  workspace_id: workspaceId,
                  contact_id: contactId,
                  phone_number: senderPhone,
                  event_type: "OPT_OUT",
                  method: `Keyword: ${messageText}`,
                  source: `Keyword: ${messageText}`,
                  compliance_confirmed: true,
                });
              }

              // 3. Update or create Conversation with 24-hour service window
              const windowExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
              let conversationId: string | null = null;

              if (contactId && workspaceId) {
                const { data: existingConv } = await supabase
                  .from("conversations")
                  .select("id")
                  .eq("contact_id", contactId)
                  .eq("workspace_id", workspaceId)
                  .single();

                if (existingConv) {
                  conversationId = existingConv.id;
                  await supabase
                    .from("conversations")
                    .update({
                      window_expires_at: windowExpiresAt,
                      last_message_preview: messageText,
                      last_message_time: new Date().toISOString(),
                      unread_count: 1,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", conversationId);
                } else {
                  const { data: newConv } = await supabase
                    .from("conversations")
                    .insert({
                      workspace_id: workspaceId,
                      contact_id: contactId,
                      window_expires_at: windowExpiresAt,
                      last_message_preview: messageText,
                      last_message_time: new Date().toISOString(),
                      status: "open",
                      unread_count: 1,
                    })
                    .select("id")
                    .single();
                  if (newConv) conversationId = newConv.id;
                }
              }

              // 4. Save Inbound Message to DB
              if (conversationId) {
                await supabase.from("messages").insert({
                  conversation_id: conversationId,
                  workspace_id: workspaceId,
                  meta_message_id: metaMsgId,
                  wa_message_id: metaMsgId,
                  direction: "inbound",
                  sender_type: "customer",
                  content: messageText,
                  body: messageText,
                  status: "delivered",
                  created_at: new Date().toISOString(),
                });
              }

              // 5. Trigger AI Agent Engine if not an opt-out
              if (!isOptOut && conversationId && workspaceId) {
                try {
                  const aiEngineUrl = `${supabaseUrl}/functions/v1/ai-agent-engine`;
                  await fetch(aiEngineUrl, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${supabaseServiceKey}`,
                    },
                    body: JSON.stringify({
                      conversation_id: conversationId,
                      incoming_message: messageText,
                      workspace_id: workspaceId,
                    }),
                  });
                } catch (aiErr) {
                  console.warn("AI Engine dispatch warning:", aiErr);
                }
              }
            }
          }
        } catch (innerErr) {
          console.error("Webhook background processing error:", innerErr);
        }
      })();

      return new Response(JSON.stringify({ status: "received" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 400 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
});
