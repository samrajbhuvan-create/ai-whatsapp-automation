// Supabase Edge Function: compliance-guard
// Daily/hourly cron to monitor Meta Phone Number quality ratings,
// auto-pause broadcasts on degradation, and alert admins of policy violations.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  try {
    // 1. Fetch all active workspaces
    const { data: workspaces, error } = await supabase
      .from("workspaces")
      .select("id, name, phone_number_id, meta_access_token, quality_rating, messaging_limit");

    if (error) throw error;

    const auditResults: any[] = [];

    for (const ws of workspaces ?? []) {
      let currentQuality = ws.quality_rating || "GREEN";
      let currentLimit = ws.messaging_limit || "1,000";

      // If connected with live Meta token
      if (ws.phone_number_id && ws.meta_access_token && ws.meta_access_token.startsWith("EA")) {
        try {
          const res = await fetch(
            `https://graph.facebook.com/v20.0/${ws.phone_number_id}?fields=quality_rating,messaging_limit_tier,verified_name`,
            { headers: { Authorization: `Bearer ${ws.meta_access_token}` } }
          );

          if (res.ok) {
            const data = await res.json();
            currentQuality = data.quality_rating || currentQuality;
            currentLimit = data.messaging_limit_tier === "TIER_10K" ? "10,000" : (data.messaging_limit_tier === "TIER_100K" ? "100,000" : "1,000");

            // Update workspace status
            await supabase
              .from("workspaces")
              .update({
                quality_rating: currentQuality,
                messaging_limit: currentLimit,
                updated_at: new Date().toISOString(),
              })
              .eq("id", ws.id);
          }
        } catch (fetchErr) {
          console.warn(`Quality check warning for workspace ${ws.id}:`, fetchErr);
        }
      }

      // Check for degradation
      if (currentQuality === "RED") {
        // Auto-pause active broadcasts to prevent Meta phone number ban
        await supabase
          .from("broadcasts")
          .update({ status: "PAUSED_COMPLIANCE_ALERT" })
          .eq("workspace_id", ws.id)
          .eq("status", "SENDING");

        console.warn(`[EMERGENCY BAN GUARD] Auto-paused marketing broadcasts for workspace ${ws.name} due to RED quality rating.`);
      }

      auditResults.push({
        workspace_id: ws.id,
        name: ws.name,
        quality: currentQuality,
        tier: currentLimit,
      });
    }

    return new Response(
      JSON.stringify({
        status: "compliance_audit_completed",
        timestamp: new Date().toISOString(),
        audited_count: auditResults.length,
        results: auditResults,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
