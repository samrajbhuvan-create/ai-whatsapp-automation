# AutoWhatsApp AI — Complete Implementation Plan
**Version:** 2.0 | **Status:** Ready to Execute | **Date:** September 2026

---

## PART A — What Is Done vs. What Is Missing

### ✅ Done (Prototype-Quality, Needs Data Wiring)

| Module | File | Done |
|---|---|---|
| All 10 UI Views | `src/components/**` | Fully built with mock state |
| Database Schema (19 tables) | `supabase/migrations/init_schema.sql` | Fully written — needs deployment |
| RLS + Indexes + Realtime pub | Same migration | Fully written |
| Template Pre-Submit Linter | `src/lib/compliance/templateValidator.ts` | Fully functional, client-side |
| WhatsApp Error Code Catalog | `src/lib/utils/errorCodes.ts` | Complete — 12 error codes |
| Prohibited Industry Checker | `templateValidator.ts` | Functional |
| Supabase Client Setup | `src/lib/supabase.ts` | Connected, not used |
| Webhook Handshake (GET) | `whatsapp-webhook/index.ts` | Handles `hub.challenge` correctly |
| Edge Function Scaffolds | 3 edge functions | Exist, all logic is placeholder comments |

### ❌ Missing (No Real Code Yet)

| Missing Work | Priority | Complexity |
|---|---|---|
| Supabase data hooks replacing mock states | 🔴 Critical | Medium |
| Webhook POST → save messages to DB | 🔴 Critical | Medium |
| Update `window_expires_at` on each inbound message | 🔴 Critical | Low |
| STOP keyword opt-out writing to DB | 🔴 Critical | Low |
| `/ai-agent-engine` Gemini edge function | 🔴 Critical | High |
| Meta Graph API: send messages (outbound dispatch) | 🔴 Critical | High |
| Meta Graph API: template submission | 🟠 High | Medium |
| Broadcast rate-limiting / leaky bucket queue | 🟠 High | High |
| 72-hour frequency cap enforcement in DB query | 🟠 High | Medium |
| Supabase Realtime subscriptions for live inbox | 🟠 High | Medium |
| Phone quality polling from Meta (compliance-guard) | 🟡 Medium | Medium |
| Analytics rollup cron (analytics_daily table) | 🟡 Medium | Low |
| Gemini AI file upload (RAG / knowledge base) | 🟡 Medium | High |

---

## PART B — Complete Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AutoWhatsApp AI — Full System                         │
└─────────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────────────┐
                         │   META WHATSAPP CLOUD API │
                         │  graph.facebook.com/v20.0 │
                         └───────────▲──────────┬───┘
                                     │          │
                         POST /messages        Webhook Events
                         Template Submit       (inbound msgs,
                         Quality Poll          delivery receipts)
                                     │          │
┌──────────────────────────────────────────────────────────────────────────┐
│  SUPABASE EDGE FUNCTIONS  (Deno / TypeScript)                             │
│                                                                           │
│  ┌─────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐ │
│  │  whatsapp-webhook    │  │  broadcast-worker     │  │ compliance-guard│ │
│  │  (INBOUND)          │  │  (OUTBOUND ENGINE)    │  │ (CRON / DAILY) │ │
│  │                     │  │                       │  │                │ │
│  │ 1. Verify 200ms     │  │ 1. Check tier limit   │  │ 1. Poll Meta   │ │
│  │ 2. Parse event      │  │ 2. Filter 72h cap     │  │    quality API │ │
│  │ 3. Write message    │  │ 3. Leaky bucket queue │  │ 2. Save to     │ │
│  │ 4. Update window    │  │ 4. POST Meta Graph    │  │    quality_    │ │
│  │ 5. STOP keyword     │  │ 5. Update counters    │  │    history     │ │
│  │ 6. Trigger AI agent │  │                       │  │ 3. Alert on    │ │
│  └─────────────────────┘  └──────────────────────┘  │    RED quality │ │
│                                                       └─────────────────┘ │
│  ┌──────────────────────────────────────────────────┐                    │
│  │  ai-agent-engine  [NEW - TO BUILD]               │                    │
│  │                                                   │                    │
│  │  1. Load ai_agent_configs for workspace          │                    │
│  │  2. Load knowledge base chunks from storage      │                    │
│  │  3. Build RAG context (embeddings or file search)│                    │
│  │  4. Call Gemini 1.5 Flash with system prompt     │                    │
│  │  5. Confidence check → auto-reply OR escalate    │                    │
│  │  6. POST reply to Meta Graph API                 │                    │
│  │  7. Save reply to messages table                 │                    │
│  └──────────────────────────────────────────────────┘                    │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  SUPABASE POSTGRESQL (19 Tables + RLS + Realtime)                         │
│                                                                           │
│  workspaces ──► profiles                                                  │
│            ──► contacts ──► opt_in_events                                │
│            ──► conversations ──► messages                                 │
│            ──► templates                                                  │
│            ──► broadcasts ──► broadcast_recipients                        │
│            ──► automations                                                │
│            ──► ai_agent_configs                                           │
│            ──► webhook_logs + compliance_logs + tier/quality history      │
│            ──► frequency_cap_logs                                         │
│            ──► analytics_daily (cron rollup)                              │
│            ──► credentials_vault (encrypted tokens)                       │
│            ──► quick_replies                                              │
│                                                                           │
│  Realtime publications: conversations, messages, broadcasts               │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  REACT + VITE FRONTEND  (src/)                                            │
│                                                                           │
│  App.tsx                                                                  │
│    ├── AppShell (Navigation)                                              │
│    ├── DashboardView ──────────────── reads: workspaces, analytics_daily │
│    ├── InboxView ──────────────────── reads: conversations + messages     │
│    │      └── Realtime subscription (supabase.channel)                   │
│    ├── TemplateBuilderView ────────── reads/writes: templates             │
│    ├── ContactsView ───────────────── reads/writes: contacts, opt_in_events│
│    ├── BroadcastsView ─────────────── reads/writes: broadcasts            │
│    │      └── Calls: broadcast-worker edge function                       │
│    ├── AutomationsView ────────────── reads/writes: automations           │
│    ├── AIAgentStudioView ──────────── reads/writes: ai_agent_configs      │
│    ├── AnalyticsView ──────────────── reads: analytics_daily              │
│    └── SettingsView ───────────────── reads/writes: workspaces            │
│                                                                           │
│  src/lib/                                                                 │
│    ├── supabase.ts           ← Supabase client (connected, needs use)    │
│    ├── compliance/templateValidator.ts  ← DONE                           │
│    └── utils/errorCodes.ts             ← DONE                            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## PART C — Execution Phases (What To Do Now)

---

### PHASE 1: Wire Supabase Data Layer
**Goal:** Replace all `useState([...mockData])` with real Supabase queries.

#### Step 1.1 — Deploy the migration to Supabase
```bash
npx supabase db push
# OR run the SQL file directly in Supabase Dashboard > SQL Editor
```

#### Step 1.2 — Create typed hooks per view

**Pattern for every view** — replace mock state:
```typescript
// BEFORE (mock state)
const [contacts, setContacts] = useState<Contact[]>([{...hardcoded...}]);

// AFTER (Supabase real query)
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

const [contacts, setContacts] = useState<Contact[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setContacts(data ?? []);
    setLoading(false);
  }
  fetchContacts();
}, []);
```

#### Step 1.3 — InboxView: Supabase Realtime Subscription
```typescript
// Subscribe to new messages in real-time
useEffect(() => {
  const channel = supabase
    .channel('messages-live')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);
```

#### Step 1.4 — Views to wire (priority order)
1. `InboxView` → `conversations` + `messages` + Realtime
2. `ContactsView` → `contacts` + `opt_in_events`
3. `BroadcastsView` → `broadcasts` + `broadcast_recipients`
4. `TemplateBuilderView` → `templates`
5. `DashboardView` → `workspaces` + `analytics_daily`
6. `AIAgentStudioView` → `ai_agent_configs`
7. `AutomationsView` → `automations`
8. `AnalyticsView` → `analytics_daily`
9. `SettingsView` → `workspaces` (update WABA credentials)

---

### PHASE 2: Complete Webhook Ingestion
**Goal:** Make the webhook function fully process Meta events and write to DB.

#### Full `whatsapp-webhook/index.ts` Logic Flow:
```typescript
// POST handler — complete business logic

if (value?.messages) {
  for (const msg of value.messages) {
    const senderPhone = msg.from;
    const messageText = msg.text?.body?.trim() ?? '';
    const waMessageId = msg.id;

    // 1. Find or create contact by phone
    let { data: contact } = await supabase
      .from('contacts')
      .select('id, opt_in_status, workspace_id')
      .eq('phone_number', senderPhone)
      .single();

    // 2. STOP keyword — mandatory opt-out per Meta policy
    const STOP_WORDS = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'OPT-OUT', 'END'];
    if (STOP_WORDS.includes(messageText.toUpperCase())) {
      await supabase.from('contacts')
        .update({ opt_in_status: false })
        .eq('id', contact.id);
      
      await supabase.from('opt_in_events').insert({
        workspace_id: contact.workspace_id,
        contact_id: contact.id,
        event_type: 'KEYWORD_STOP',
        source: 'WhatsApp STOP keyword',
      });
      continue; // Do NOT reply to STOP messages ever
    }

    // 3. Find or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('id, window_expires_at')
      .eq('contact_id', contact.id)
      .eq('status', 'open')
      .single();

    if (!conversation) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ contact_id: contact.id, workspace_id: contact.workspace_id })
        .select('id')
        .single();
      conversation = newConv;
    }

    // 4. CRITICAL: Reset 24-hour service window on every inbound message
    await supabase.from('conversations')
      .update({
        window_expires_at: new Date(Date.now() + 86400000).toISOString(), // +24h
        last_message_preview: messageText.substring(0, 100),
        last_message_time: new Date().toISOString(),
        unread_count: supabase.rpc('increment', { x: 1 })
      })
      .eq('id', conversation.id);

    // 5. Save the inbound message to DB
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      workspace_id: contact.workspace_id,
      direction: 'inbound',
      sender_type: 'user',
      message_type: msg.type ?? 'text',
      body: messageText,
      wa_message_id: waMessageId,
      status: 'delivered',
    });

    // 6. Trigger AI agent function asynchronously (if AI is enabled)
    fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-agent-engine`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
      body: JSON.stringify({ conversation_id: conversation.id, message: messageText })
    });
  }
}

// Handle delivery receipts (sent/delivered/read status updates)
if (value?.statuses) {
  for (const status of value.statuses) {
    await supabase.from('messages')
      .update({ status: status.status })
      .eq('wa_message_id', status.id);
  }
}
```

---

### PHASE 3: Build `/ai-agent-engine` Edge Function
**Goal:** Receive an inbound message, call Gemini, and auto-reply via Meta API if confidence is high.

#### New file: `supabase/functions/ai-agent-engine/index.ts`
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { conversation_id, message } = await req.json();

  // 1. Load workspace AI config
  const { data: conv } = await supabase
    .from('conversations')
    .select('workspace_id, contact_id')
    .eq('id', conversation_id)
    .single();

  const { data: aiConfig } = await supabase
    .from('ai_agent_configs')
    .select('*')
    .eq('workspace_id', conv.workspace_id)
    .single();

  if (!aiConfig?.is_enabled) return new Response('AI disabled', { status: 200 });

  // 2. Check confidence threshold — build Gemini prompt
  const systemPrompt = `${aiConfig.system_prompt}
Business Knowledge: ${aiConfig.business_knowledge}
Rules: Never discuss ${aiConfig.prohibited_topics?.join(', ')}.
Reply ONLY with JSON: { "reply": "...", "confidence": 0.0-1.0 }`;

  // 3. Call Gemini API
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: message }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: aiConfig.temperature, maxOutputTokens: aiConfig.max_tokens }
      })
    }
  );

  const geminiData = await geminiRes.json();
  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  const parsed = JSON.parse(rawText);
  const { reply, confidence } = parsed;

  // 4. Escalation check
  const shouldEscalate = confidence < aiConfig.confidence_threshold ||
    aiConfig.escalation_keywords?.some((kw: string) => message.toLowerCase().includes(kw));

  if (shouldEscalate) {
    await supabase.from('conversations')
      .update({ status: 'waiting_agent' })
      .eq('id', conversation_id);
    return new Response('Escalated to human', { status: 200 });
  }

  // 5. Load workspace WhatsApp credentials
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('phone_number_id, access_token_encrypted')
    .eq('id', conv.workspace_id)
    .single();

  const { data: contact } = await supabase
    .from('contacts')
    .select('phone_number')
    .eq('id', conv.contact_id)
    .single();

  // 6. Send reply via Meta Graph API
  const metaRes = await fetch(
    `https://graph.facebook.com/v20.0/${workspace.phone_number_id}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${workspace.access_token_encrypted}`, // decrypt first in prod
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: contact.phone_number,
        type: 'text',
        text: { body: reply }
      })
    }
  );

  const metaData = await metaRes.json();

  // 7. Save AI reply to messages table
  await supabase.from('messages').insert({
    conversation_id,
    workspace_id: conv.workspace_id,
    direction: 'outbound',
    sender_type: 'ai',
    message_type: 'text',
    body: reply,
    wa_message_id: metaData.messages?.[0]?.id,
    status: 'sent'
  });

  return new Response(JSON.stringify({ reply, confidence }), { status: 200 });
});
```

---

### PHASE 4: Connect Meta Graph API
**Goal:** Make template submission and broadcast dispatch hit the real Meta Cloud API.

#### 4A — Template Submission (TemplateBuilderView.tsx)
```typescript
// Replace the alert() with a real API call to Supabase Edge Function
async function submitTemplateToMeta() {
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('phone_number_id, waba_id, access_token_encrypted')
    .single();

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${workspace.waba_id}/message_templates`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${workspace.access_token_encrypted}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: templateName,
        language: 'en_US',
        category: category,
        components: buildComponentsFromForm() // build from form state
      })
    }
  );
  const result = await response.json();
  // Save template with meta_template_id to DB
  await supabase.from('templates').insert({ ...formData, meta_template_id: result.id, status: 'PENDING' });
}
```

#### 4B — Broadcast Worker (broadcast-worker/index.ts)
```typescript
// Complete leaky bucket implementation
const RATE_LIMITS = { TIER_250: 20, TIER_1K: 80, TIER_10K: 80, TIER_100K: 80 };

async function sendWithRateLimiting(recipients, template, workspace) {
  const ratePerSec = RATE_LIMITS[workspace.messaging_limit] ?? 20;
  const intervalMs = 1000 / ratePerSec;

  for (const recipient of recipients) {
    // 1. Frequency cap check — skip if marketed in last 72h
    const { data: lastSent } = await supabase
      .from('messages')
      .select('created_at')
      .eq('conversation_id', recipient.conversation_id)
      .eq('direction', 'outbound')
      .gte('created_at', new Date(Date.now() - 72 * 3600 * 1000).toISOString())
      .limit(1);

    if (lastSent?.length > 0 && template.category === 'MARKETING') {
      await supabase.from('frequency_cap_logs').insert({ 
        workspace_id: workspace.id, contact_id: recipient.id,
        prevented_campaign_name: broadcast.name, last_sent_at: lastSent[0].created_at
      });
      continue; // SKIP — frequency capped
    }

    // 2. Only send to opted-in contacts
    if (!recipient.opt_in_status) continue;

    // 3. Send via Meta Graph API
    const res = await fetch(`https://graph.facebook.com/v20.0/${workspace.phone_number_id}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${workspace.access_token_encrypted}` },
      body: JSON.stringify({
        messaging_product: 'whatsapp', to: recipient.phone_number,
        type: 'template',
        template: { name: template.name, language: { code: template.language } }
      })
    });

    // 4. Update recipient status
    const data = await res.json();
    await supabase.from('broadcast_recipients')
      .update({ status: res.ok ? 'sent' : 'failed', error_code: data.error?.code })
      .eq('id', recipient.broadcast_recipient_id);

    // 5. Leaky bucket — wait between sends
    await new Promise(r => setTimeout(r, intervalMs));
  }
}
```

---

## PART D — Meta WhatsApp Compliance Safety System

> [!CAUTION]
> This section is CRITICAL. Getting a phone number flagged or banned by Meta is permanent. Every single outbound action must pass through these safety checks.

### D1 — Pre-Send Safety Checklist (Must Run Before EVERY Message)

```
SAFETY GATE — All 6 checks must pass before any outbound message

[CHECK 1] Contact opt_in_status = TRUE
          → If FALSE: Abort. Log to compliance_logs. NEVER send.

[CHECK 2] Quality Rating ≠ RED
          → If RED: Abort all marketing. Only respond to inbound sessions.

[CHECK 3] 24-Hour Window (for free-form messages)
          → If window_expires_at < NOW(): Must use approved UTILITY/MARKETING template only.

[CHECK 4] 72-Hour Frequency Cap (for MARKETING templates)
          → If contact received marketing template in last 72h: Skip this recipient.

[CHECK 5] Daily Tier Limit Not Exceeded
          → Tier 250: block if sent_today >= 250
          → Tier 1K: block if sent_today >= 1,000
          → Tier 10K: block if sent_today >= 10,000

[CHECK 6] Template Status = APPROVED
          → DRAFT, PENDING, REJECTED, PAUSED templates cannot be sent.
```

### D2 — Messaging Rules by Template Category

| Category | Use Case | Opt-In Required | 24h Window | Frequency |
|---|---|---|---|---|
| **Free-form text** | Customer replied < 24h ago | Yes | ✅ Must be open | None |
| **UTILITY template** | Order update, OTP, appointment | Yes | ❌ Not required | None |
| **MARKETING template** | Sale, promo, announcement | Yes | ❌ Not required | ⚠️ 72h cap |
| **AUTHENTICATION template** | Login OTP | Yes | ❌ Not required | None |

### D3 — What Will Get You Blocked by Meta

| Action | Risk | Prevention Built Into System |
|---|---|---|
| Sending to non-opted-in contacts | 🔴 Ban | `opt_in_status` check in broadcast-worker |
| Sending marketing after STOP keyword | 🔴 Immediate ban | STOP keyword handler in webhook |
| Sending free-form after 24h window expires | 🔴 Policy violation | `window_expires_at` check, UI disables input |
| Promotional content in UTILITY template | 🔴 Template rejection | Client-side linter in `templateValidator.ts` |
| Using URL shorteners in templates | 🟠 Auto-rejection | URL shortener check in linter |
| High block rate (> 0.2%) | 🔴 Tier downgrade | Frequency capping, quality rating alerts |
| Sending too fast (rate limit) | 🟠 429 errors | Leaky bucket rate limiter |
| Requesting sensitive data (CC, passwords) | 🔴 Permanent ban | Prohibited topics in AI agent config |

### D4 — Phone Number Quality Monitoring (compliance-guard cron)

```typescript
// compliance-guard/index.ts — complete this daily check
const qualityRes = await fetch(
  `https://graph.facebook.com/v20.0/${workspace.phone_number_id}?fields=quality_rating,messaging_limit_tier,display_phone_number,name_status`,
  { headers: { 'Authorization': `Bearer ${workspace.access_token_encrypted}` } }
);
const quality = await qualityRes.json();

// Save to quality history
await supabase.from('quality_history').insert({
  workspace_id: workspace.id,
  quality_rating: quality.quality_rating,
});

// CRITICAL: If RED, pause all MARKETING broadcasts immediately
if (quality.quality_rating === 'RED') {
  await supabase.from('broadcasts')
    .update({ status: 'cancelled' })
    .eq('workspace_id', workspace.id)
    .eq('status', 'scheduled');

  await supabase.from('compliance_logs').insert({
    workspace_id: workspace.id,
    event_category: 'QUALITY_RATING_RED',
    severity: 'critical',
    description: 'Phone number quality dropped to RED. All scheduled marketing broadcasts have been paused.'
  });
}
```

### D5 — Opt-In Compliance Architecture

```
INBOUND CONTACT FLOW:
─────────────────────────────────────────────────────────────────────
Contact fills website form
    │
    ▼
EXPLICIT consent checkbox (pre-checked = ILLEGAL per Meta)
    "I agree to receive WhatsApp messages from [Business Name]"
    │
    ▼
opt_in_events table: { event_type: 'OPT_IN', source: 'Website Form',
                        ip_address, user_agent, timestamp }
    │
    ▼
contacts.opt_in_status = TRUE
    │
    ▼
Contact can now receive MARKETING templates

─────────────────────────────────────────────────────────────────────
Contact sends "STOP" keyword
    │
    ▼
whatsapp-webhook detects STOP/UNSUBSCRIBE/CANCEL/END
    │
    ▼
contacts.opt_in_status = FALSE  ← Immediate, no delay allowed
opt_in_events: { event_type: 'KEYWORD_STOP' }
    │
    ▼
All future marketing sends BLOCKED (broadcast-worker skips them)
System NEVER sends reply to a STOP message (Meta requirement)
─────────────────────────────────────────────────────────────────────
```

### D6 — Template Safety Rules Before Submission

Run all these checks in `templateValidator.ts` (already built) AND enforce via edge function before calling Meta API:

- ✅ Body ≤ 1,024 characters
- ✅ Footer ≤ 60 characters
- ✅ No URL shorteners (bit.ly, tinyurl, etc.)
- ✅ Variables `{{1}}` must NOT be at start or end of sentence
- ✅ Variables must NOT be adjacent (`{{1}}{{2}}`)
- ✅ No more than 2 consecutive blank lines
- ✅ No promotional language in UTILITY or AUTHENTICATION templates
- ✅ Button URLs must use `https://` (not `http://`)
- ✅ Sample values must be provided for ALL variables before submission
- ✅ Marketing templates MUST include unsubscribe option in footer

---

## PART E — Execution Order & Priority

```
SPRINT 1 (Week 1) — Foundation
────────────────────────────────
[1] Deploy SQL migration to Supabase (30 min)
[2] Wire ContactsView to real Supabase data (2h)
[3] Wire TemplateBuilderView to real Supabase data (2h)
[4] Complete webhook POST handler — save messages + window reset (3h)

SPRINT 2 (Week 2) — Live Inbox
────────────────────────────────
[5] Wire InboxView with Realtime subscription (3h)
[6] Wire BroadcastsView to real data (2h)
[7] Complete broadcast-worker with rate limiter + freq cap (4h)
[8] Wire DashboardView to real workspace + analytics data (2h)

SPRINT 3 (Week 3) — AI + Meta API
────────────────────────────────────
[9]  Create ai-agent-engine edge function (4h)
[10] Hook Gemini API calls with confidence thresholding (3h)
[11] Connect template submission to Meta Graph API (3h)
[12] Complete compliance-guard cron for quality polling (2h)

SPRINT 4 (Week 4) — Safety & Polish
─────────────────────────────────────
[13] Full end-to-end test with a real Meta sandbox number
[14] Verify opt-out STOP flow works end-to-end
[15] Test 24-hour window expiration UI + DB enforcement
[16] Test frequency capping with a scheduled broadcast
[17] Set up Supabase secrets for GEMINI_API_KEY, env vars
[18] Wire Auth (Supabase Auth) to workspace assignment
```

---

## PART F — Required Environment Variables

```bash
# Supabase Edge Function secrets (set via Supabase Dashboard > Project Settings > Secrets)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key

# Frontend (.env file)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

```bash
# Set edge function secrets
npx supabase secrets set GEMINI_API_KEY=your-key
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

---

## PART G — Meta WhatsApp Eligibility Verification Checklist

Before going live, verify ALL of these with Meta Business Manager:

| Step | What to Check | Where |
|---|---|---|
| 1 | Business Verification approved | Meta Business Manager → Business Info |
| 2 | WABA (WhatsApp Business Account) created | Meta Business Manager → Accounts |
| 3 | Phone number added and verified | Meta Business Manager → Phone Numbers |
| 4 | Display name approved by Meta | WhatsApp Manager → Phone Numbers |
| 5 | Industry is NOT in prohibited list | `templateValidator.ts` → PROHIBITED_INDUSTRIES |
| 6 | System User with permanent access token created | Meta Business Manager → System Users |
| 7 | All templates in APPROVED status before broadcast | WhatsApp Manager → Message Templates |
| 8 | Webhook URL configured and verified | Meta App Dashboard → Webhooks |
| 9 | Quality Rating is GREEN or YELLOW | WhatsApp Manager → Phone Numbers |
| 10 | App is in Live mode (not Development mode) | Meta App Dashboard → App Mode |
