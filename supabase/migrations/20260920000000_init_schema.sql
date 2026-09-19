-- ==============================================================================
-- AutoWhatsApp AI — Master Production Schema Migration
-- 19 Tables, Comprehensive RLS Policies, Indexes, and Realtime Configuration
-- ==============================================================================

-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. WORKSPACES (Multi-tenant root)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(100) DEFAULT 'Retail & E-commerce',
    country VARCHAR(100) DEFAULT 'United States',
    phone_number VARCHAR(50),
    phone_number_id VARCHAR(100),
    waba_id VARCHAR(100),
    meta_app_id VARCHAR(100),
    access_token_encrypted TEXT,
    webhook_verify_token VARCHAR(100) DEFAULT encode(gen_random_bytes(16), 'hex'),
    quality_rating VARCHAR(20) DEFAULT 'GREEN' CHECK (quality_rating IN ('GREEN', 'YELLOW', 'RED', 'UNKNOWN')),
    messaging_limit VARCHAR(50) DEFAULT '10,000',
    plan VARCHAR(50) DEFAULT 'Pro',
    usage_contacts INT DEFAULT 0,
    max_contacts INT DEFAULT 10000,
    usage_ai_replies INT DEFAULT 0,
    max_ai_replies INT DEFAULT 5000,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES (Workspace Team Members)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('owner', 'admin', 'agent', 'readonly')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONTACTS
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    phone_number VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    opt_in_status BOOLEAN DEFAULT TRUE,
    opt_in_timestamp TIMESTAMPTZ DEFAULT NOW(),
    opt_in_source VARCHAR(100) DEFAULT 'Website Form',
    is_blocked BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    custom_attributes JSONB DEFAULT '{}'::jsonb,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, phone_number)
);

-- 4. OPT-IN AUDIT LOG
CREATE TABLE IF NOT EXISTS public.opt_in_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('OPT_IN', 'OPT_OUT', 'KEYWORD_STOP', 'MANUAL', 'CSV_IMPORT')),
    source VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'waiting_agent')),
    assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    window_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    unread_count INT DEFAULT 0,
    last_message_preview TEXT,
    last_message_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'agent', 'ai', 'system')),
    message_type VARCHAR(30) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video', 'template', 'interactive')),
    body TEXT NOT NULL,
    media_url TEXT,
    wa_message_id VARCHAR(150),
    status VARCHAR(30) DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
    error_code INT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TEMPLATES
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
    language VARCHAR(20) DEFAULT 'en_US',
    status VARCHAR(50) DEFAULT 'APPROVED' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED')),
    header_type VARCHAR(20) DEFAULT 'NONE',
    header_content TEXT,
    body_text TEXT NOT NULL,
    footer_text TEXT,
    buttons JSONB DEFAULT '[]'::jsonb,
    variables JSONB DEFAULT '[]'::jsonb,
    meta_template_id VARCHAR(100),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BROADCASTS
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('draft', 'scheduled', 'processing', 'completed', 'cancelled')),
    scheduled_at TIMESTAMPTZ,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    read_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    target_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 9. BROADCAST RECIPIENTS
CREATE TABLE IF NOT EXISTS public.broadcast_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID NOT NULL REFERENCES public.broadcasts(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
    error_code INT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ
);

-- 10. AUTOMATIONS (Workflow Canvas)
CREATE TABLE IF NOT EXISTS public.automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    workflow_nodes JSONB DEFAULT '[]'::jsonb,
    workflow_edges JSONB DEFAULT '[]'::jsonb,
    runs_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AI AGENTS CONFIGURATION
CREATE TABLE IF NOT EXISTS public.ai_agent_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT TRUE,
    agent_name VARCHAR(100) DEFAULT 'WhatsApp Assistant',
    model_name VARCHAR(50) DEFAULT 'gemini-1.5-flash',
    system_prompt TEXT NOT NULL,
    confidence_threshold NUMERIC(3,2) DEFAULT 0.85,
    business_knowledge TEXT,
    escalation_keywords TEXT[] DEFAULT ARRAY['human', 'agent', 'representative', 'support', 'manager']::TEXT[],
    prohibited_topics TEXT[] DEFAULT ARRAY['pricing negotiation', 'credit card info', 'passwords']::TEXT[],
    max_tokens INT DEFAULT 500,
    temperature NUMERIC(3,2) DEFAULT 0.2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. WEBHOOK LOGS
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    event_type VARCHAR(100),
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. COMPLIANCE AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.compliance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    event_category VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. TIER HISTORY
CREATE TABLE IF NOT EXISTS public.tier_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    previous_tier VARCHAR(50),
    new_tier VARCHAR(50),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. QUALITY RATING HISTORY
CREATE TABLE IF NOT EXISTS public.quality_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    quality_rating VARCHAR(20),
    score NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. FREQUENCY CAP LOGS
CREATE TABLE IF NOT EXISTS public.frequency_cap_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    prevented_campaign_name VARCHAR(255),
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. QUICK REPLIES / SNIPPETS
CREATE TABLE IF NOT EXISTS public.quick_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    shortcut VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. API KEYS & CREDENTIALS VAULT
CREATE TABLE IF NOT EXISTS public.credentials_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    encrypted_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. ANALYTICS DAILY ROLLUPS
CREATE TABLE IF NOT EXISTS public.analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    inbound_count INT DEFAULT 0,
    outbound_count INT DEFAULT 0,
    ai_resolved_count INT DEFAULT 0,
    human_resolved_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    read_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    UNIQUE(workspace_id, date)
);

-- Create Essential Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_workspace ON public.contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_conversations_workspace ON public.conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_templates_workspace ON public.templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_workspace ON public.broadcasts(workspace_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_configs ENABLE ROW LEVEL SECURITY;

-- Helper RLS function to check workspace membership
CREATE OR REPLACE FUNCTION public.user_belongs_to_workspace(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.workspace_id = ws_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy declarations
CREATE POLICY "Users can access their workspace" ON public.workspaces
    FOR ALL USING (id IN (SELECT workspace_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can access profiles in same workspace" ON public.profiles
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can manage contacts in their workspace" ON public.contacts
    FOR ALL USING (user_belongs_to_workspace(workspace_id));

CREATE POLICY "Users can manage conversations in their workspace" ON public.conversations
    FOR ALL USING (user_belongs_to_workspace(workspace_id));

CREATE POLICY "Users can manage messages in their workspace" ON public.messages
    FOR ALL USING (user_belongs_to_workspace(workspace_id));

CREATE POLICY "Users can manage templates in their workspace" ON public.templates
    FOR ALL USING (user_belongs_to_workspace(workspace_id));

CREATE POLICY "Users can manage broadcasts in their workspace" ON public.broadcasts
    FOR ALL USING (user_belongs_to_workspace(workspace_id));

CREATE POLICY "Users can manage automations in their workspace" ON public.automations
    FOR ALL USING (user_belongs_to_workspace(workspace_id));

CREATE POLICY "Users can manage AI configs in their workspace" ON public.ai_agent_configs
    FOR ALL USING (user_belongs_to_workspace(workspace_id));

-- Realtime Setup for Live Chat & Dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;
