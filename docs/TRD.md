# AutoWhatsApp AI — Technical Requirements Document (TRD)
**Version:** 2.0.0  
**Status:** Approved  
**Author:** AI Architecture Team  
**Last Updated:** September 2026  

---

## 1. Executive Summary
**AutoWhatsApp AI** is an enterprise-grade, multi-tenant WhatsApp Automation & AI Agent SaaS platform designed to operate strictly within Meta's WhatsApp Business Platform Terms of Service, Commerce Policies, and Cloud API guidelines. 

The platform enables businesses to:
1. Orchestrate 24/7 AI-powered conversational support with human-in-the-loop takeover.
2. Broadcast targeted, segmented marketing and utility campaigns with automatic frequency-capping and tier limit monitoring.
3. Build visual workflow automations (abandoned cart, order updates, lead qualification).
4. Strictly manage subscriber opt-ins and opt-outs (STOP keywords) with verifiable audit logs.
5. Create, validate, and submit WhatsApp interactive message templates with pre-submission compliance linting against Meta's 9 common rejection patterns.

---

## 2. System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │             Meta WhatsApp Cloud API           │
                               └──────▲───────────────────────────────┬───────┘
                                      │ Send Messages (POST)          │ Webhook Events
                                      │                               ▼
┌─────────────────────────────────────┴───────────────────────────────────────────────────────┐
│ AutoWhatsApp AI Platform                                                                    │
│                                                                                             │
│  ┌──────────────────────┐    ┌───────────────────────────────────┐    ┌──────────────────┐ │
│  │   React + Vite SPA   │    │      Supabase Edge Functions      │    │  Supabase Postg. │ │
│  │  - Tailwind Green UI │    │  - /whatsapp-webhook              │    │  - 19 Tables     │ │
│  │  - Lucide Icons      ├───►│  - /broadcast-worker              ├───►│  - RLS Security  │ │
│  │  - Recharts / DND    │    │  - /ai-agent-engine (Gemini)      │    │  - Realtime Pub  │ │
│  │  - Meta Compliance   │    │  - /compliance-guard              │    │  - Cron Triggers │ │
│  └──────────────────────┘    └───────────────────────────────────┘    └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Modules & Specifications

### 3.1 Workspace & WhatsApp Onboarding
- **Multi-tenancy:** Isolated schemas/RLS per workspace.
- **Embedded Signup / Cloud API Setup:** Tenant supplies Meta App ID, Phone Number ID, WABA ID, and Permanent System User Access Token.
- **Health Verification:** Live connection check querying `GET /{phone-number-id}?fields=display_phone_number,name_status,quality_rating,messaging_limit_tier`.

### 3.2 Live Inbox & 24-Hour Service Window
- **Customer Care Window:** Meta grants a 24-hour window from the customer's last incoming message for free-form two-way messaging.
- **Timer & Safety Interlock:** Dynamic countdown timer on each active chat. When expired, free-form text input is disabled and replaced by a "Send Utility / Re-engagement Template" prompt.
- **AI / Human Co-pilot:** AI can auto-respond based on confidence threshold (>0.85). If confidence is low or sentiment is negative, conversation escalates to `waiting_agent` with audio/visual notification.

### 3.3 Template Builder & Pre-Submission Compliance Linter
- **Categories:** MARKETING, UTILITY, AUTHENTICATION.
- **Components:** Header (Text/Image/Document/Video), Body (with `{{1}}`, `{{2}}` variables), Footer (includes opt-out disclaimer), Buttons (Quick Reply, Call-to-Action URL, Phone Call).
- **Rule Engine:** Pre-submission validator tests against:
  - Missing sample parameters
  - Non-sequential or malformed placeholders (e.g. `{1}` or `{{1}}` followed by `{{3}}`)
  - Aggressive promotional words in Utility templates
  - Shortened URLs (bit.ly, tinyurl) prohibited by Meta
  - Missing explicit unsubscribe option in Marketing templates

### 3.4 Broadcast Engine & Frequency Capping
- **Tier Limiting:** Automatically blocks sending if batch size exceeds current 24-hour limit (Tier 0: 250, Tier 1: 2k, Tier 2: 10k, Tier 3: 100k, Tier 4: Unlimited).
- **Pacing & Queueing:** Leaky bucket rate limiter (80 msgs/sec for Tier 1+, 20 msgs/sec for Tier 0) to avoid Meta 429 rate limit exceptions.
- **Frequency Capping:** Max 1 marketing message per 72 hours per contact unless contact interacted.
- **Error Code Resolution:** Gracefully maps Meta codes (131049 Frequency Cap, 131026 Message Undeliverable, 130429 Rate Limit) to user-friendly resolution advice.

### 3.5 Opt-In / Consent Management
- **Audit Log:** Captures source (Website Form, WhatsApp Keyword, Checkout, QR Code), IP address, timestamp, and terms version.
- **Mandatory Opt-Out:** Instant processing of STOP, UNSUBSCRIBE, CANCEL keywords. Updates contact `opt_in_status` to `false` and disallows outbound marketing messages.

---

## 4. Non-Functional Requirements
- **Security:** AES-256 encrypted storage of Meta access tokens in vault/Postgres columns with pgcrypto.
- **Latency:** Webhook acknowledgment within 3,000ms (`HTTP 200 OK`) before background processing to prevent Meta webhook retries.
- **High Availability:** Supabase edge functions scale horizontally with automatic database read replication.
- **Compliance:** GDPR/CCPA consent tracking, WhatsApp Business Terms of Service compliance, TCPA compliance.
