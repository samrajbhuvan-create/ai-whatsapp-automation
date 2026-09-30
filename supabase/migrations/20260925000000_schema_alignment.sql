-- ==============================================================================
-- AutoWhatsApp AI — Schema Alignment & Compatibility Patch
-- Harmonizes live database schema with all Edge Functions & Frontend hooks:
-- 1. Adds missing columns (content, meta_message_id, capped_count, category, etc.)
-- 2. Relaxes/expands CHECK constraints (case-insensitive & additional valid states)
-- 3. Adds automatic data-normalization trigger for messages
-- 4. Secures saas_plans with Row Level Security (RLS) and public read policy
-- ==============================================================================

-- ── 1. WORKSPACES: Add convenience columns ──────────────────────────────────
ALTER TABLE public.workspaces 
  ADD COLUMN IF NOT EXISTS meta_access_token TEXT,
  ADD COLUMN IF NOT EXISTS wa_connected BOOLEAN DEFAULT FALSE;

-- ── 2. CONVERSATIONS: Expand status constraint ──────────────────────────────
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_status_check;
ALTER TABLE public.conversations 
  ADD CONSTRAINT conversations_status_check 
  CHECK (lower(status) IN ('open', 'resolved', 'waiting_agent', 'needs_agent', 'ai_active', 'closed'));

-- ── 3. MESSAGES: Add missing columns and relax check constraints ─────────────
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS meta_message_id VARCHAR(150);

-- Make body nullable so content can be provided instead (trigger will sync them)
ALTER TABLE public.messages ALTER COLUMN body DROP NOT NULL;

-- Make workspace_id nullable on insert (trigger will look it up from conversation)
ALTER TABLE public.messages ALTER COLUMN workspace_id DROP NOT NULL;

-- Update constraints
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_direction_check;
ALTER TABLE public.messages 
  ADD CONSTRAINT messages_direction_check 
  CHECK (lower(direction) IN ('inbound', 'outbound'));

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_type_check;
ALTER TABLE public.messages 
  ADD CONSTRAINT messages_sender_type_check 
  CHECK (lower(sender_type) IN ('user', 'customer', 'agent', 'human', 'human_agent', 'ai', 'bot', 'system'));

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_status_check;
ALTER TABLE public.messages 
  ADD CONSTRAINT messages_status_check 
  CHECK (lower(status) IN ('queued', 'sent', 'delivered', 'read', 'failed', 'frequency_capped'));

-- ── 4. BROADCASTS: Add missing columns and expand status constraint ──────────
ALTER TABLE public.broadcasts
  ADD COLUMN IF NOT EXISTS capped_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'MARKETING';

ALTER TABLE public.broadcasts DROP CONSTRAINT IF EXISTS broadcasts_status_check;
ALTER TABLE public.broadcasts
  ADD CONSTRAINT broadcasts_status_check
  CHECK (lower(status) IN ('draft', 'scheduled', 'processing', 'sending', 'completed', 'cancelled', 'paused_compliance_alert'));

-- ── 5. TEMPLATES: Expand status constraint ──────────────────────────────────
ALTER TABLE public.templates DROP CONSTRAINT IF EXISTS templates_status_check;
ALTER TABLE public.templates
  ADD CONSTRAINT templates_status_check
  CHECK (upper(status) IN ('DRAFT', 'PENDING', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED'));

-- ── 6. OPT_IN_EVENTS: Add missing columns & default workspace fallback ───────
ALTER TABLE public.opt_in_events
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS method VARCHAR(100),
  ADD COLUMN IF NOT EXISTS compliance_confirmed BOOLEAN DEFAULT TRUE;

ALTER TABLE public.opt_in_events ALTER COLUMN workspace_id DROP NOT NULL;

-- ── 7. CREDENTIALS_VAULT: Add key_type column ────────────────────────────────
ALTER TABLE public.credentials_vault
  ADD COLUMN IF NOT EXISTS key_type VARCHAR(100);

ALTER TABLE public.credentials_vault ALTER COLUMN service_name DROP NOT NULL;

-- ── 8. ANALYTICS_DAILY: Add telemetry rate columns ───────────────────────────
ALTER TABLE public.analytics_daily
  ADD COLUMN IF NOT EXISTS delivery_rate NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS read_rate NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ── 9. SAAS_PLANS: Enable RLS & add public read policy ───────────────────────
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for saas_plans" ON public.saas_plans;
CREATE POLICY "Public read access for saas_plans" ON public.saas_plans
  FOR SELECT USING (true);

-- ── 10. MESSAGES NORMALIZATION TRIGGER ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.normalize_messages_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync body and content
  IF NEW.body IS NULL AND NEW.content IS NOT NULL THEN
    NEW.body := NEW.content;
  ELSIF NEW.content IS NULL AND NEW.body IS NOT NULL THEN
    NEW.content := NEW.body;
  END IF;

  -- Default empty body if both null
  IF NEW.body IS NULL THEN
    NEW.body := '';
    NEW.content := '';
  END IF;

  -- Sync wa_message_id and meta_message_id
  IF NEW.wa_message_id IS NULL AND NEW.meta_message_id IS NOT NULL THEN
    NEW.wa_message_id := NEW.meta_message_id;
  ELSIF NEW.meta_message_id IS NULL AND NEW.wa_message_id IS NOT NULL THEN
    NEW.meta_message_id := NEW.wa_message_id;
  END IF;

  -- Lookup workspace_id from conversation if missing
  IF NEW.workspace_id IS NULL AND NEW.conversation_id IS NOT NULL THEN
    SELECT workspace_id INTO NEW.workspace_id
    FROM public.conversations
    WHERE id = NEW.conversation_id;
  END IF;

  -- Fallback sender_type
  IF NEW.sender_type IS NULL THEN
    NEW.sender_type := 'user';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_normalize_messages ON public.messages;
CREATE TRIGGER trg_normalize_messages
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_messages_record();
