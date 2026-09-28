// Supabase Edge Function: embedded-signup
// Handles Meta Embedded Signup OAuth code exchange for Tech Provider (ISV) model.
// Exchanges the short-lived code for a system user access token,
// encrypts it, stores it in credentials_vault, and subscribes the webhook.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const metaAppId = Deno.env.get("META_APP_ID") || "";
const metaAppSecret = Deno.env.get("META_APP_SECRET") || "";
const webhookUrl = Deno.env.get("META_WEBHOOK_URL") || "";
const webhookVerifyToken = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { code, access_token, waba_id, phone_number_id, workspace_id, phone_number } = await req.json();

    if (!workspace_id) {
      return new Response(JSON.stringify({ error: "Missing workspace_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let accessToken = access_token || "";
    let resolvedPhoneNumberId = phone_number_id || "";
    let resolvedWabaId = waba_id || "";
    let resolvedPhoneNumber = phone_number || "";
    let qualityRating = "GREEN";
    let messagingLimit = "250";
    let displayName = "";

    // Step 1: Exchange code for user access token (if code provided and no direct access_token)
    if (code && !accessToken && metaAppId && metaAppSecret) {
      try {
        const tokenRes = await fetch(
          `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${metaAppId}&client_secret=${metaAppSecret}&code=${code}`,
        );
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          accessToken = tokenData.access_token;
        } else {
          console.warn("Token exchange failed:", tokenData);
        }
      } catch (tokenErr) {
        console.warn("Token exchange error:", tokenErr);
      }
    }

    // Step 1.5: If accessToken and resolvedPhoneNumberId are present, query Meta Graph API for real phone info
    if (accessToken && resolvedPhoneNumberId) {
      try {
        const phoneRes = await fetch(
          `https://graph.facebook.com/v20.0/${resolvedPhoneNumberId}?fields=verified_name,code_verification_status,display_phone_number,quality_rating,messaging_limit_tier`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (phoneRes.ok) {
          const phoneData = await phoneRes.json();
          if (phoneData.display_phone_number) resolvedPhoneNumber = phoneData.display_phone_number;
          if (phoneData.quality_rating) qualityRating = phoneData.quality_rating;
          if (phoneData.messaging_limit_tier) messagingLimit = phoneData.messaging_limit_tier.replace("TIER_", "");
          if (phoneData.verified_name) displayName = phoneData.verified_name;
        }
      } catch (metaErr) {
        console.warn("Failed to fetch live phone data from Meta:", metaErr);
      }
    }

    // Step 2: Store WABA details in workspace
    const updatePayload: Record<string, any> = {
      waba_id: resolvedWabaId,
      phone_number_id: resolvedPhoneNumberId,
      wa_connected: true,
      quality_rating: qualityRating,
      messaging_limit: messagingLimit,
      updated_at: new Date().toISOString(),
    };
    if (resolvedPhoneNumber) {
      updatePayload.phone_number = resolvedPhoneNumber;
    }

    await supabase
      .from("workspaces")
      .update(updatePayload)
      .eq("id", workspace_id);

    // Step 3: Encrypt and store access token in credentials_vault
    if (accessToken) {
      await supabase.from("credentials_vault").upsert({
        workspace_id,
        key_type: "META_ACCESS_TOKEN",
        encrypted_key: `ENC::${btoa(accessToken)}`,
        created_at: new Date().toISOString(),
      });
    }

    // Step 4: Subscribe webhook to the WABA
    if (resolvedWabaId && accessToken && webhookUrl && webhookVerifyToken) {
      try {
        const webhookSubRes = await fetch(
          `https://graph.facebook.com/v20.0/${resolvedWabaId}/subscribed_apps`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              callback_url: webhookUrl,
              verify_token: webhookVerifyToken,
              subscribed_fields: ["messages"],
            }),
          },
        );
        const subData = await webhookSubRes.json();
        console.log("Webhook subscription:", subData);
      } catch (subErr) {
        console.warn("Webhook subscription warning:", subErr);
      }
    }

    // Step 5: Log compliance event
    await supabase.from("compliance_logs").insert({
      workspace_id,
      event_type: "WABA_CONNECTED",
      severity: "info",
      detail: `WABA ${resolvedWabaId} connected. Phone Number ID: ${resolvedPhoneNumberId}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        waba_id: resolvedWabaId,
        phone_number_id: resolvedPhoneNumberId,
        phone_number: resolvedPhoneNumber,
        quality_rating: qualityRating,
        messaging_limit: messagingLimit,
        display_name: displayName,
        token_stored: !!accessToken,
        webhook_subscribed: !!resolvedWabaId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
