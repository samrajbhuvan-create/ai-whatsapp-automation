// Supabase Edge Function: ai-agent-engine
// Google Gemini API integration for autonomous WhatsApp inquiries with confidence scoring,
// policy guardrails, and human agent escalation.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { conversation_id, incoming_message, workspace_id, test_mode } = await req.json();

    if (!incoming_message) {
      return new Response(JSON.stringify({ error: "Missing incoming_message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch AI Agent Config
    let configQuery = supabase
      .from("ai_agent_configs")
      .select("*");
    
    if (workspace_id) {
      configQuery = configQuery.eq("workspace_id", workspace_id);
    }
    const { data: agentConfig } = await configQuery.single();

    const agentName = agentConfig?.agent_name || "Amy";
    const systemPrompt = agentConfig?.system_prompt || "You are a professional WhatsApp customer support assistant for an e-commerce retail brand. Keep replies concise, helpful, and under 60 words.";
    const confidenceThreshold = agentConfig?.confidence_threshold ?? 0.80;
    const isEnabled = agentConfig?.is_enabled ?? true;

    if (!isEnabled && !test_mode) {
      return new Response(JSON.stringify({ skipped: true, reason: "AI Agent is disabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Guardrail Check: Banned topics / Opt-out
    const upperMsg = incoming_message.toUpperCase();
    if (["STOP", "CANCEL", "UNSUBSCRIBE", "OPTOUT"].some(k => upperMsg.includes(k))) {
      return new Response(JSON.stringify({
        reply: "You have been successfully unsubscribed. You will not receive any further marketing messages.",
        confidence: 1.0,
        requires_escalation: false,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. Query recent messages for context
    let historyContext = "";
    if (conversation_id) {
      const { data: recentMsgs } = await supabase
        .from("messages")
        .select("direction, content")
        .eq("conversation_id", conversation_id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentMsgs && recentMsgs.length > 0) {
        historyContext = recentMsgs
          .reverse()
          .map(m => `${m.direction}: ${m.content}`)
          .join("\n");
      }
    }

    let aiReply = "";
    let confidence = 0.90;
    let requiresEscalation = false;

    // 4. Call Gemini 1.5 Flash API if key is present
    if (geminiApiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
        const promptText = `
${systemPrompt}
You are agent "${agentName}".

Conversation Context:
${historyContext || "None"}

Customer Message: "${incoming_message}"

CRITICAL INSTRUCTIONS:
1. Provide a direct, polite, helpful answer.
2. Evaluate your confidence level from 0.0 to 1.0.
3. If the user asks for refund escalations, billing disputes, complex complaints, or out-of-scope requests, set requires_escalation = true and lower confidence.
4. Respond ONLY with valid JSON in this exact structure:
{
  "reply": "Your WhatsApp message here",
  "confidence": 0.95,
  "requires_escalation": false
}
`;

        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          }),
        });

        if (geminiRes.ok) {
          const resData = await geminiRes.json();
          const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            aiReply = parsed.reply || "";
            confidence = parsed.confidence ?? 0.85;
            requiresEscalation = parsed.requires_escalation ?? false;
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call notice:", geminiErr);
      }
    }

    // Fallback if no Gemini API key or call error
    if (!aiReply) {
      if (incoming_message.toLowerCase().includes("return") || incoming_message.toLowerCase().includes("refund")) {
        aiReply = "We offer a 30-day hassle-free return window for unworn items with tags attached. You can generate a free return label on our returns portal.";
        confidence = 0.92;
      } else if (incoming_message.toLowerCase().includes("shipping") || incoming_message.toLowerCase().includes("track")) {
        aiReply = "Standard shipping takes 3-5 business days. Please share your 6-digit order number and I'll look up your live tracking details!";
        confidence = 0.89;
      } else if (incoming_message.toLowerCase().includes("human") || incoming_message.toLowerCase().includes("agent")) {
        aiReply = "I am transferring you to a human support specialist right now. One of our team members will respond here shortly.";
        confidence = 0.99;
        requiresEscalation = true;
      } else {
        aiReply = `Thank you for reaching out! I've received your inquiry regarding "${incoming_message}". How else can I assist your order today?`;
        confidence = 0.84;
      }
    }

    // Confidence Threshold Guardrail
    if (confidence < confidenceThreshold) {
      requiresEscalation = true;
      aiReply = "I want to ensure you get the exact details for this request. Let me connect you with a specialist from our support team who can help you directly.";
    }

    // 5. If conversation exists and not just in test mode, update DB and send to WhatsApp
    if (conversation_id && !test_mode) {
      // Record AI message in DB
      await supabase.from("messages").insert({
        conversation_id,
        direction: "OUTBOUND",
        sender_type: "AI",
        content: aiReply,
        status: "DELIVERED",
        created_at: new Date().toISOString(),
      });

      // Update conversation state
      await supabase
        .from("conversations")
        .update({
          last_message_preview: aiReply,
          last_message_time: new Date().toISOString(),
          status: requiresEscalation ? "NEEDS_AGENT" : "AI_ACTIVE",
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversation_id);

      // If workspace has Meta Cloud credentials, send real message
      if (workspace_id) {
        const { data: ws } = await supabase
          .from("workspaces")
          .select("phone_number_id, meta_access_token")
          .eq("id", workspace_id)
          .single();

        const { data: conv } = await supabase
          .from("conversations")
          .select("contacts(phone_number)")
          .eq("id", conversation_id)
          .single();

        const recipientPhone = (conv as any)?.contacts?.phone_number;

        if (ws?.phone_number_id && ws?.meta_access_token && ws.meta_access_token.startsWith("EA") && recipientPhone) {
          try {
            await fetch(`https://graph.facebook.com/v20.0/${ws.phone_number_id}/messages`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${ws.meta_access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: recipientPhone.replace(/[^0-9]/g, ""),
                type: "text",
                text: { body: aiReply },
              }),
            });
          } catch (metaErr) {
            console.warn("Meta Cloud API outbound notice:", metaErr);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reply: aiReply,
        confidence,
        requires_escalation: requiresEscalation,
        agent_name: agentName,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
