// ─────────────────────────────────────────────────────────
// Auth & User
// ─────────────────────────────────────────────────────────
export type UserRole = 'owner' | 'admin' | 'agent' | 'viewer';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

// ─────────────────────────────────────────────────────────
// Workspace (Multi-tenant)
// ─────────────────────────────────────────────────────────
export type QualityRating = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
export type MessagingTier = '250' | '2000' | '10000' | '100000' | 'UNLIMITED' | '10,000';
export type PlanName = 'Free' | 'Starter' | 'Pro' | 'Business';
export type Industry = string;

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  industry: Industry;
  country: string;
  plan: PlanName;
  // WhatsApp
  phone_number: string;
  phone_number_id?: string;
  waba_id?: string;
  quality_rating: QualityRating;
  messaging_limit: MessagingTier;
  meta_verified?: boolean;
  // Usage
  usage_contacts: number;
  max_contacts: number;
  usage_ai_replies: number;
  max_ai_replies: number;
  usage_messages_today?: number;
  // Meta
  wa_connected?: boolean;
}

// ─────────────────────────────────────────────────────────
// Contacts
// ─────────────────────────────────────────────────────────
export type OptInStatus = 'OPTED_IN' | 'OPTED_OUT' | 'UNKNOWN' | boolean;
export type OptInChannel = 'WEBSITE_FORM' | 'SMS' | 'EMAIL' | 'IN_PERSON' | 'API' | 'WA_INBOUND';

export interface Contact {
  id: string;
  workspace_id?: string;
  phone?: string;
  phone_number?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  opt_in_status: OptInStatus;
  opt_in_source?: string;
  opt_in_timestamp?: string;
  opt_in_channel?: OptInChannel;
  opt_in_at?: string;
  opt_out_at?: string;
  tags: string[];
  custom_attrs?: Record<string, string | number | boolean>;
  last_seen?: string;
  last_message_at?: string;
  unread_count?: number;
  created_at?: string;
}

export interface OptInEvent {
  id: string;
  contact_id: string;
  workspace_id: string;
  action: 'OPT_IN' | 'OPT_OUT' | 'RE_OPT_IN';
  channel: OptInChannel;
  ip_address?: string;
  form_version?: string;
  proof_url?: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────
// Conversations & Messages
// ─────────────────────────────────────────────────────────
export type ConversationHandler = 'none' | 'bot' | 'ai' | 'human';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'frequency_capped';
export type PricingCategory = 'service' | 'marketing' | 'utility' | 'authentication';
export type SenderType = 'customer' | 'agent' | 'ai' | 'bot' | 'human';

export interface Conversation {
  id: string;
  workspace_id?: string;
  contact_id?: string;
  contact_name: string;
  contact_phone: string;
  avatar?: string;
  handler: ConversationHandler;
  status?: string;
  assigned_to?: string;
  window_expires_at?: string;   // ISO timestamp — 24h service window
  window_expires_in?: string;
  window_active?: boolean;
  unread_count: number;
  tags: string[];
  last_message: string;
  last_message_time: string;
  notes?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  workspace_id?: string;
  direction: MessageDirection;
  sender_type: SenderType;
  body: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio' | 'document';
  timestamp: string;
  status: MessageStatus;
  wa_message_id?: string;       // Meta's msgid
  wa_error_code?: number;       // e.g. 131049
  wa_error_title?: string;
  frequency_capped?: boolean;
  pricing_category?: PricingCategory;
}

// ─────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────
export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type TemplateStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'DISABLED';
export type HeaderType = 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
export type ButtonType = 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';

export interface TemplateButton {
  type: ButtonType;
  text: string;
  url_or_phone?: string;
  example_value?: string;
}

export interface Template {
  id: string;
  workspace_id?: string;
  name: string;
  category: TemplateCategory;
  language: string;
  status: TemplateStatus;
  meta_template_id?: string;
  // Content
  header_type: HeaderType;
  header_text?: string;
  header_media_url?: string;
  body_text: string;
  footer_text?: string;
  buttons: TemplateButton[];
  // Compliance & rejection
  rejection_reason?: string;
  compliance_checked_at?: string;
  compliance_passed?: boolean;
  compliance_warnings?: string[];
  // Metrics
  total_sent?: number;
  read_rate?: number;
  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────────────────
// Broadcasts (Campaigns)
// ─────────────────────────────────────────────────────────
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'paused';

export interface Broadcast {
  id: string;
  workspace_id?: string;
  name: string;
  template_id?: string;
  template_name?: string;
  category?: string;
  status: BroadcastStatus | string;
  scheduled_for?: string;
  scheduled_at?: string;
  target_tags?: string[];
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  capped_count?: number;
  frequency_capped_count?: number;  // Error 131049 tracking
  created_at?: string;
}

// ─────────────────────────────────────────────────────────
// Quality Rating & Tier
// ─────────────────────────────────────────────────────────
export interface QualityEvent {
  id: string;
  workspace_id: string;
  previous_rating: QualityRating;
  new_rating: QualityRating;
  event_type: 'QUALITY_UPDATE' | 'TIER_UPGRADE' | 'TIER_DOWNGRADE';
  messaging_limit?: number;
  created_at: string;
}

export const TIER_LIMITS: Record<string, number> = {
  '250':       250,
  '2000':      2000,
  '10000':     10000,
  '10,000':    10000,
  '100000':    100000,
  'UNLIMITED': Infinity,
};

export const TIER_LADDER: MessagingTier[] = ['250', '2000', '10000', '100000', 'UNLIMITED'];

// ─────────────────────────────────────────────────────────
// AI Agent
// ─────────────────────────────────────────────────────────
export interface AIAgentConfig {
  id?: string;
  workspace_id?: string;
  name: string;
  status: 'ACTIVE' | 'DRAFT' | 'DISABLED';
  persona: string;
  scope: string;
  languages: string[];
  banned_topics: string[];
  confidence_threshold: number;
  max_unclear_turns: number;
  hand_off_to: string;
  operating_hours: string;
  knowledge_files_count: number;
  scope_tests_passed: boolean;
}
