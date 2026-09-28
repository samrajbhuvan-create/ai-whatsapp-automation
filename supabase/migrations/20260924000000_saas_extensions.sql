-- ==============================================================================
-- AutoWhatsApp AI — SaaS Extension Migration
-- Adds: saas_plans, saas_subscriptions, auto-workspace trigger, pgcrypto vault
-- ==============================================================================

-- ── 20. SAAS PLAN DEFINITIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saas_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    price_monthly NUMERIC(10,2) DEFAULT 0.00,
    max_contacts INT DEFAULT 500,
    max_ai_replies INT DEFAULT 500,
    max_broadcasts_monthly INT DEFAULT 5,
    max_templates INT DEFAULT 10,
    max_team_members INT DEFAULT 1,
    features JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the default plans
INSERT INTO public.saas_plans (name, price_monthly, max_contacts, max_ai_replies, max_broadcasts_monthly, max_templates, max_team_members)
VALUES
  ('Free',       0.00,   500,    500,   5,   10,  1),
  ('Pro',        49.00,  10000,  5000,  50,  50,  5),
  ('Business',   99.00,  50000,  25000, 200, 200, 15),
  ('Enterprise', 199.00, 100000, 50000, 500, 500, 25)
ON CONFLICT (name) DO NOTHING;

-- ── 21. SAAS SUBSCRIPTIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saas_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.saas_plans(id),
    status VARCHAR(30) DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'cancelled', 'past_due')),
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month'),
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saas_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription" ON public.saas_subscriptions
    FOR SELECT USING (user_belongs_to_workspace(workspace_id));

-- ── PGCRYPTO TOKEN VAULT FUNCTIONS ─────────────────────────────────────────
-- Encrypts a Meta access token using AES-256 before saving to DB.
-- The encryption key is stored ONLY in Supabase Secrets, never in the DB.

CREATE OR REPLACE FUNCTION public.encrypt_meta_token(plain_token TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        pgp_sym_encrypt(plain_token, encryption_key),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrypt_meta_token(encrypted_token TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(
        decode(encrypted_token, 'base64'),
        encryption_key
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── INCREMENT HELPER FUNCTIONS ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_usage_contacts(ws_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.workspaces
    SET usage_contacts = usage_contacts + 1
    WHERE id = ws_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_usage_ai_replies(ws_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.workspaces
    SET usage_ai_replies = usage_ai_replies + 1
    WHERE id = ws_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── AUTO WORKSPACE PROVISIONING TRIGGER ───────────────────────────────────
-- Fires when a new user registers via Supabase Auth.
-- Automatically creates:
--   1. A new workspace row (with unique slug)
--   2. A profile row linking the user to their workspace as 'owner'
--   3. A free trial subscription

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    v_workspace_id UUID;
    v_full_name TEXT;
    v_business_name TEXT;
    v_slug TEXT;
    v_free_plan_id UUID;
BEGIN
    -- Extract metadata passed during signUp({ data: { full_name, business_name } })
    v_full_name     := NEW.raw_user_meta_data->>'full_name';
    v_business_name := COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business');
    v_slug          := lower(regexp_replace(v_business_name, '[^a-zA-Z0-9]', '-', 'g'))
                       || '-' || substr(gen_random_uuid()::text, 1, 8);

    -- 1. Create workspace
    INSERT INTO public.workspaces (name, slug)
    VALUES (v_business_name, v_slug)
    RETURNING id INTO v_workspace_id;

    -- 2. Create owner profile
    INSERT INTO public.profiles (id, workspace_id, full_name, email, role)
    VALUES (NEW.id, v_workspace_id, v_full_name, NEW.email, 'owner');

    -- 3. Attach free trial subscription
    SELECT id INTO v_free_plan_id FROM public.saas_plans WHERE name = 'Free' LIMIT 1;
    INSERT INTO public.saas_subscriptions (workspace_id, plan_id, status)
    VALUES (v_workspace_id, v_free_plan_id, 'trial');

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Don't block user creation if provisioning fails — log and continue
    RAISE WARNING 'Workspace provisioning failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to Supabase auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_signup();

-- ── PLAN LIMIT CHECK FUNCTION ──────────────────────────────────────────────
-- Returns whether a workspace can perform an action given their plan limits.
CREATE OR REPLACE FUNCTION public.check_plan_limit(
    ws_id UUID,
    resource_type TEXT  -- 'contacts' | 'ai_replies' | 'broadcasts'
)
RETURNS JSONB AS $$
DECLARE
    v_usage INT;
    v_max INT;
    v_plan_name TEXT;
BEGIN
    SELECT
        CASE resource_type
            WHEN 'contacts'   THEN w.usage_contacts
            WHEN 'ai_replies' THEN w.usage_ai_replies
            ELSE 0
        END,
        CASE resource_type
            WHEN 'contacts'   THEN w.max_contacts
            WHEN 'ai_replies' THEN w.max_ai_replies
            ELSE 999999
        END,
        w.plan
    INTO v_usage, v_max, v_plan_name
    FROM public.workspaces w
    WHERE w.id = ws_id;

    IF v_usage >= v_max THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', format('Limit reached: %s/%s %s used on %s plan.', v_usage, v_max, resource_type, v_plan_name),
            'usage', v_usage,
            'max', v_max
        );
    END IF;

    RETURN jsonb_build_object('allowed', true, 'usage', v_usage, 'max', v_max);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── ADDITIONAL INDEXES FOR SAAS PERFORMANCE ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_saas_subscriptions_workspace ON public.saas_subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_profiles_workspace ON public.profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_phone_number_id ON public.workspaces(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_contacts_opt_in ON public.contacts(workspace_id, opt_in_status);
CREATE INDEX IF NOT EXISTS idx_messages_wa_message_id ON public.messages(wa_message_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON public.broadcasts(workspace_id, status);

-- Enable Realtime for dashboard live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_daily;
ALTER PUBLICATION supabase_realtime ADD TABLE public.compliance_logs;
