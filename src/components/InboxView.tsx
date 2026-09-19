import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Bot, 
  Tag, 
  CheckCheck,
  Search,
  ChevronRight,
  Shield,
  FileText,
  Paperclip
} from 'lucide-react';
import { Conversation, Message } from '../types';

export const InboxView: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState('c1');
  const [messageInput, setMessageInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'ai' | 'mine'>('all');

  const conversations: Conversation[] = [
    {
      id: 'c1',
      contact_name: 'Amy Lee',
      contact_phone: '+1 (555) 382-9912',
      handler: 'ai',
      window_expires_in: '14h 32m',
      window_active: true,
      unread_count: 0,
      tags: ['VIP Customer', 'Online Store'],
      last_message: 'Does this silk dress shrink after washing?',
      last_message_time: '2m ago',
      notes: 'Customer asked about washing guidelines for Item #992.'
    },
    {
      id: 'c2',
      contact_name: 'Rajesh Patel',
      contact_phone: '+91 98201 44521',
      handler: 'human',
      assigned_to: 'John Doe',
      window_expires_in: '3h 15m',
      window_active: true,
      unread_count: 2,
      tags: ['Wholesale', 'Urgent Inquiry'],
      last_message: 'Can I get a bulk discount for 50 pieces?',
      last_message_time: '18m ago',
      notes: 'Interested in volume orders for Mumbai store.'
    },
    {
      id: 'c3',
      contact_name: 'Carlos Mendez',
      contact_phone: '+52 55 4912 3019',
      handler: 'bot',
      window_expires_in: 'Expired',
      window_active: false,
      unread_count: 0,
      tags: ['Lead Generated'],
      last_message: 'Selected: Request Callback',
      last_message_time: 'Yesterday',
      notes: 'Came through Instagram Click-to-WhatsApp ad.'
    }
  ];

  const messages: Message[] = [
    {
      id: 'm1',
      conversation_id: 'c1',
      direction: 'inbound',
      sender_type: 'customer',
      body: 'Hi! I saw the latest summer collection dress.',
      timestamp: '11:42 AM',
      status: 'read'
    },
    {
      id: 'm2',
      conversation_id: 'c1',
      direction: 'outbound',
      sender_type: 'ai',
      body: 'Hello Amy! ✨ We are delighted you like it. The dress is 100% pure Mulberry silk, crafted for breathable summer comfort. How can I assist you with sizing or care instructions?',
      timestamp: '11:42 AM',
      status: 'read'
    },
    {
      id: 'm3',
      conversation_id: 'c1',
      direction: 'inbound',
      sender_type: 'customer',
      body: 'Does this silk dress shrink after washing?',
      timestamp: '11:45 AM',
      status: 'read'
    },
    {
      id: 'm4',
      conversation_id: 'c1',
      direction: 'outbound',
      sender_type: 'ai',
      body: 'Our Mulberry silk is pre-shrunk, but we strongly recommend dry cleaning or cold hand washing with mild pH-neutral detergent to preserve the luster. Never tumble dry!',
      timestamp: '11:45 AM',
      status: 'delivered'
    }
  ];

  const activeChat = conversations.find(c => c.id === activeChatId) || conversations[0];

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-200/80 shadow-sm flex overflow-hidden">
      
      {/* 1. Left Chat List Pane (320px) */}
      <div className="w-80 border-r border-slate-200 flex flex-col shrink-0">
        
        {/* Search & Filters */}
        <div className="p-3 border-b border-slate-200 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-brand-500 outline-none transition-all"
            />
          </div>

          <div className="flex space-x-1">
            {(['all', 'ai', 'mine'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                  filter === tab
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab === 'ai' ? '🤖 AI Handled' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`p-3 cursor-pointer transition-colors relative ${
                activeChatId === chat.id ? 'bg-slate-50' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {chat.contact_name.substring(0, 1)}
                  </div>
                  <span className="font-semibold text-slate-800 text-xs">{chat.contact_name}</span>
                </div>
                <span className="text-[10px] text-slate-400">{chat.last_message_time}</span>
              </div>

              <p className="text-xs text-slate-500 truncate pl-9 mb-1.5">{chat.last_message}</p>

              <div className="flex items-center justify-between pl-9 text-[10px]">
                <div className="flex items-center space-x-1">
                  {chat.handler === 'ai' && (
                    <span className="bg-ai-50 text-ai-700 px-1.5 py-0.5 rounded border border-ai-200 font-mono font-bold flex items-center space-x-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>AI Active</span>
                    </span>
                  )}
                  {chat.handler === 'human' && (
                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                      Human Agent
                    </span>
                  )}
                </div>

                {chat.window_active ? (
                  <span className="text-slate-400 font-mono">⏳ {chat.window_expires_in}</span>
                ) : (
                  <span className="text-amber-600 font-medium bg-amber-50 px-1 rounded">Window Closed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Center Chat Thread View */}
      <div className="flex-1 flex flex-col">
        
        {/* Header Bar with 24h Countdown & Takeover Toggle */}
        <div className="h-14 border-b border-slate-200 px-4 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
              {activeChat.contact_name.substring(0, 1)}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <span>{activeChat.contact_name}</span>
                <span className="text-slate-400 font-normal">({activeChat.contact_phone})</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                <span className="flex items-center text-emerald-600 font-medium">
                  <Clock className="w-3 h-3 mr-1" />
                  24h Care Window: {activeChat.window_expires_in} remaining
                </span>
              </div>
            </div>
          </div>

          {/* AI vs Human Takeover Button */}
          <div className="flex items-center space-x-2">
            {activeChat.handler === 'ai' ? (
              <button 
                onClick={() => alert("Taking over conversation from AI Agent.")}
                className="bg-ai-50 border border-ai-200 text-ai-700 hover:bg-ai-100 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Take Over from AI</span>
              </button>
            ) : (
              <button 
                onClick={() => alert("Re-enabling AI Agent on this chat.")}
                className="bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Hand back to AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 bg-[#E5DDD5]/30 p-4 overflow-y-auto space-y-3">
          {messages.map((msg) => {
            const isInbound = msg.direction === 'inbound';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-3 shadow-sm text-xs leading-relaxed ${
                    isInbound
                      ? 'bg-white text-slate-800 border border-slate-200/60'
                      : msg.sender_type === 'ai'
                      ? 'bg-gradient-to-br from-ai-50 to-white border border-ai-200 text-slate-800'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {/* Sender Header for AI */}
                  {msg.sender_type === 'ai' && (
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-ai-600 mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Agent (Amy) • RAG Grounded</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.body}</p>

                  <div className={`mt-1 flex items-center justify-end space-x-1 text-[9px] ${
                    isInbound || msg.sender_type === 'ai' ? 'text-slate-400' : 'text-emerald-200'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {!isInbound && <CheckCheck className="w-3 h-3 text-sky-500" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          {activeChat.window_active ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message as agent (or type '/' for templates & canned answers)..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-brand-500 outline-none"
              />
              <button 
                onClick={() => setMessageInput('')}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Customer service window has expired (&gt; 24 hours). Meta requires an approved template message to re-engage.</span>
              </div>
              <button className="bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700 text-xs shrink-0">
                Send Template
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Right Contact Metadata Pane (280px) */}
      <div className="w-72 border-l border-slate-200 p-4 space-y-4 shrink-0 bg-slate-50/50">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Customer Profile</h3>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-2">
            <div>
              <span className="text-slate-400 text-[10px] block">Full Name</span>
              <span className="font-semibold text-slate-800">{activeChat.contact_name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">WhatsApp ID</span>
              <span className="font-mono text-slate-700">{activeChat.contact_phone}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Consent Status</span>
              <span className="inline-flex items-center text-emerald-600 font-semibold text-[11px]">
                <Shield className="w-3 h-3 mr-1" /> Opted-in (CSV Import)
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Assigned Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {activeChat.tags.map((t, idx) => (
              <span key={idx} className="bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-md text-[10px] font-medium">
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Agent Notes */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Internal Notes</h3>
          <textarea
            defaultValue={activeChat.notes}
            rows={4}
            className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-brand-500 outline-none text-slate-600"
            placeholder="Add internal notes visible only to team members..."
          />
        </div>
      </div>

    </div>
  );
};
