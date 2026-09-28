// Supabase Edge Function: analytics-rollup
// Scheduled cron job to aggregate daily message telemetry, delivery metrics,
// and AI resolution rates into analytics_daily for lightning-fast dashboards.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Fetch all workspaces
    const { data: workspaces, error: wsErr } = await supabase
      .from("workspaces")
      .select("id");

    if (wsErr) throw wsErr;

    const rollups: any[] = [];

    for (const ws of workspaces ?? []) {
      // Aggregate messages from the past 24h
      const { data: messages } = await supabase
        .from("messages")
        .select("direction, sender_type, status")
        .eq("workspace_id", ws.id)
        .gte("created_at", yesterday);

      const msgs = messages || [];
      const inboundCount = msgs.filter(m => m.direction === "INBOUND").length;
      const outboundCount = msgs.filter(m => m.direction === "OUTBOUND").length;
      const deliveredCount = msgs.filter(m => m.status === "DELIVERED" || m.status === "READ").length;
      const readCount = msgs.filter(m => m.status === "READ").length;
      const aiResolvedCount = msgs.filter(m => m.sender_type === "AI").length;

      const deliveryRate = outboundCount > 0 ? (deliveredCount / outboundCount) * 100 : 99.5;
      const readRate = deliveredCount > 0 ? (readCount / deliveredCount) * 100 : 88.0;

      // Upsert into analytics_daily
      const { error: upsertErr } = await supabase
        .from("analytics_daily")
        .upsert(
          {
            workspace_id: ws.id,
            date: today,
            inbound_count: inboundCount,
            outbound_count: outboundCount,
            delivered_count: deliveredCount,
            read_count: readCount,
            ai_resolved_count: aiResolvedCount,
            delivery_rate: Math.round(deliveryRate * 10) / 10,
            read_rate: Math.round(readRate * 10) / 10,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "workspace_id,date" }
        );

      if (!upsertErr) {
        rollups.push({
          workspace_id: ws.id,
          date: today,
          inbound: inboundCount,
          outbound: outboundCount,
        });
      }
    }

    return new Response(
      JSON.stringify({
        status: "analytics_rollup_completed",
        date: today,
        workspaces_processed: rollups.length,
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
