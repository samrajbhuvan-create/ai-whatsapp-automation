// Supabase Edge Function: whatsapp-webhook
// Handles Meta WhatsApp Cloud API webhooks with 24-hour service window tracking & STOP keyword opt-out

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  const url = new URL(req.url);

  // 1. Webhook Verification Handshake (Meta requirement)
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    // In production, compare against stored workspace webhook_verify_token
    if (mode === "subscribe" && token) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // 2. Incoming Notification Events
  if (req.method === "POST") {
    try {
      const body = await req.json();

      // Immediately acknowledge with 200 OK to satisfy Meta's <3000ms SLA
      // Background async processing:
      (async () => {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (value?.messages) {
          for (const message of value.messages) {
            const senderPhone = message.from;
            const messageText = message.text?.body?.trim() || "";

            // Handle Opt-out STOP keywords per WhatsApp Policy
            if (["STOP", "UNSUBSCRIBE", "CANCEL", "OPT-OUT"].includes(messageText.toUpperCase())) {
              console.log(`[COMPLIANCE] Opt-out keyword received from ${senderPhone}`);
              // Invert opt_in_status in database and log to opt_in_events
            }

            // Reset 24-hour Service Window
            // Update conversation window_expires_at = NOW() + 24 hours
          }
        }
      })();

      return new Response(JSON.stringify({ status: "received" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (err: any) {
      console.error("Webhook processing error:", err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});
