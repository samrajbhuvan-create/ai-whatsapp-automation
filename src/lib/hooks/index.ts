/**
 * Universal Supabase Data Hooks
 * Each hook manages fetch, loading, error, and mutation for one entity.
 * All reads are automatically scoped to the current user's workspace via RLS.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import type {
  Contact, Conversation, Message, Template,
  Broadcast, Workspace, AIAgentConfig,
} from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE
// ─────────────────────────────────────────────────────────────────────────────

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('*, workspaces(*)')
      .eq('id', user.id)
      .single();

    if (profErr) { setError(profErr.message); setLoading(false); return; }
    setProfile(prof);
    setWorkspace(prof.workspaces as Workspace);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateWorkspace = async (updates: Partial<Workspace>) => {
    if (!workspace?.id) return { error: 'No workspace' };
    const { error } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', workspace.id);
    if (!error) setWorkspace(prev => prev ? { ...prev, ...updates } : prev);
    return { error };
  };

  return { workspace, profile, loading, error, refetch: fetch, updateWorkspace };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACTS
// ─────────────────────────────────────────────────────────────────────────────

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setContacts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addContact = async (contact: Partial<Contact>) => {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();
    if (!error && data) setContacts(prev => [data, ...prev]);
    return { data, error };
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const { error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id);
    if (!error) setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    return { error };
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (!error) setContacts(prev => prev.filter(c => c.id !== id));
    return { error };
  };

  return { contacts, loading, error, refetch: fetch, addContact, updateContact, deleteContact };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATIONS + REALTIME
// ─────────────────────────────────────────────────────────────────────────────

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        contacts(name, phone_number)
      `)
      .order('last_message_time', { ascending: false });

    if (data) {
      const mapped = data.map((c: any) => ({
        ...c,
        contact_name: c.contacts?.name ?? c.contacts?.phone_number ?? 'Unknown',
        contact_phone: c.contacts?.phone_number ?? '',
        last_message: c.last_message_preview ?? '',
        last_message_time: c.last_message_time ?? c.updated_at,
        window_active: new Date(c.window_expires_at) > new Date(),
        handler: c.assigned_agent_id ? 'human' : 'ai',
        tags: [],
      }));
      setConversations(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();

    // Realtime subscription for live inbox updates
    channelRef.current = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setConversations(prev => [payload.new as Conversation, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setConversations(prev =>
            prev.map(c => c.id === (payload.new as any).id
              ? { ...c, ...(payload.new as any) }
              : c
            )
          );
        }
      })
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [fetch]);

  const markRead = async (conversationId: string) => {
    await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c)
    );
  };

  const resolveConversation = async (conversationId: string) => {
    await supabase
      .from('conversations')
      .update({ status: 'resolved' })
      .eq('id', conversationId);
    setConversations(prev => prev.filter(c => c.id !== conversationId));
  };

  return { conversations, loading, refetch: fetch, markRead, resolveConversation };
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES (for a single conversation) + REALTIME
// ─────────────────────────────────────────────────────────────────────────────

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages((data ?? []).map((m: any) => ({
          ...m,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })));
        setLoading(false);
      });

    // Subscribe to new messages in this conversation
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as any;
        setMessages(prev => [...prev, {
          ...msg,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev =>
          prev.map(m => m.id === (payload.new as any).id ? { ...m, ...(payload.new as any) } : m)
        );
      })
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [conversationId]);

  return { messages, loading };
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });
    setTemplates(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const saveTemplate = async (template: Partial<Template>) => {
    if (template.id) {
      const { error } = await supabase
        .from('templates')
        .update({ ...template, updated_at: new Date().toISOString() })
        .eq('id', template.id);
      if (!error) setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, ...template } : t));
      return { error };
    } else {
      const { data, error } = await supabase
        .from('templates')
        .insert({ ...template, status: 'DRAFT' })
        .select()
        .single();
      if (!error && data) setTemplates(prev => [data, ...prev]);
      return { data, error };
    }
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (!error) setTemplates(prev => prev.filter(t => t.id !== id));
    return { error };
  };

  return { templates, loading, refetch: fetch, saveTemplate, deleteTemplate };
}

// ─────────────────────────────────────────────────────────────────────────────
// BROADCASTS
// ─────────────────────────────────────────────────────────────────────────────

export function useBroadcasts() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('broadcasts')
      .select('*, templates(name, category)')
      .order('created_at', { ascending: false });

    setBroadcasts((data ?? []).map((b: any) => ({
      ...b,
      template_name: b.templates?.name,
      total_recipients: b.sent_count + b.failed_count,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createBroadcast = async (broadcast: Partial<Broadcast>) => {
    const { data, error } = await supabase
      .from('broadcasts')
      .insert({ ...broadcast, status: 'draft', sent_count: 0, delivered_count: 0, read_count: 0, failed_count: 0 })
      .select()
      .single();
    if (!error && data) setBroadcasts(prev => [data, ...prev]);
    return { data, error };
  };

  const updateBroadcast = async (id: string, updates: Partial<Broadcast>) => {
    const { error } = await supabase.from('broadcasts').update(updates).eq('id', id);
    if (!error) setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    return { error };
  };

  return { broadcasts, loading, refetch: fetch, createBroadcast, updateBroadcast };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI AGENT CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export function useAIAgentConfig() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('ai_agent_configs')
      .select('*')
      .single();
    setConfig(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateConfig = async (updates: Partial<AIAgentConfig>) => {
    if (!config?.id) {
      // Resolve workspace_id for initial config creation
      let wsId = (updates as any).workspace_id;
      if (!wsId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('workspace_id')
            .eq('id', user.id)
            .single();
          wsId = prof?.workspace_id || user.id;
        }
      }

      // Create initial config
      const { data, error } = await supabase
        .from('ai_agent_configs')
        .insert({
          workspace_id: wsId,
          agent_name: 'WhatsApp Assistant',
          system_prompt: 'You are a helpful WhatsApp business assistant.',
          confidence_threshold: 0.85,
          is_enabled: true,
          ...updates,
        })
        .select()
        .single();
      if (!error) setConfig(data);
      return { error };
    }
    const { error } = await supabase
      .from('ai_agent_configs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', config.id);
    if (!error) setConfig((prev: any) => ({ ...prev, ...updates }));
    return { error };
  };

  return { config, loading, refetch: fetch, updateConfig };
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

export function useAnalytics(days = 7) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    supabase
      .from('analytics_daily')
      .select('*')
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: true })
      .then(({ data: rows }) => {
        setData(rows ?? []);
        setLoading(false);
      });
  }, [days]);

  return { data, loading };
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTOMATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useAutomations() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('automations')
      .select('*')
      .order('created_at', { ascending: false });
    setAutomations(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleAutomation = async (id: string, is_active: boolean) => {
    const { error } = await supabase
      .from('automations')
      .update({ is_active })
      .eq('id', id);
    if (!error) setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active } : a));
    return { error };
  };

  return { automations, loading, refetch: fetch, toggleAutomation };
}
