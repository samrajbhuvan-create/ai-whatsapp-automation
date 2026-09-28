import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Users, 
  Send, 
  Workflow, 
  Bot, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Sparkles,
  ChevronDown,
  PhoneCall,
  Globe,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Workspace } from '../types';

interface AppShellProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  workspace: Workspace;
  onViewLanding?: () => void;
  onViewAuth?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  workspace,
  onViewLanding,
  onViewAuth,
  children
}) => {
  const qualityColor =
    workspace.quality_rating === 'GREEN' ? 'text-emerald-400' :
    workspace.quality_rating === 'YELLOW' ? 'text-amber-400' : 'text-red-400';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Live Inbox & 24h Window', icon: MessageSquare, badge: '3' },
    { id: 'templates', label: 'Template Builder', icon: FileText },
    { id: 'contacts', label: 'Contacts & Opt-In', icon: Users },
    { id: 'broadcasts', label: 'Campaign Broadcasts', icon: Send },
    { id: 'automations', label: 'Visual Automations', icon: Workflow },
    { id: 'ai-agent', label: 'AI Agent Brain', icon: Bot, isAI: true },
    { id: 'analytics', label: 'Analytics & Quality', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Meta Cloud', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none">
        
        {/* Top: Logo & Workspace Switcher */}
        <div>
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
                <MessageSquare className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="font-extrabold text-white tracking-tight text-sm block">
                  AutoWhatsApp <span className="text-emerald-400 text-xs font-mono uppercase bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 block">Cloud API v20.0</span>
              </div>
            </div>
          </div>

          {/* Workspace Switcher Card */}
          <div className="p-3">
            <div className="bg-slate-800/80 hover:bg-slate-800 cursor-pointer transition-colors p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-brand-600/30 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 border border-brand-500/20">
                  {workspace.name.substring(0, 1)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate">{workspace.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span className="truncate">{workspace.phone_number}</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-2 py-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.isAI ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-brand-500/30 text-brand-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                  {item.isAI && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-emerald-500/30">
                      RAG
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Quick Page Switchers & Usage */}
        <div className="p-3 border-t border-slate-800 space-y-2.5">
          {/* Landing & Auth Preview links */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold">
            {onViewLanding && (
              <button
                onClick={onViewLanding}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-700/60"
              >
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>Landing</span>
              </button>
            )}
            {onViewAuth && (
              <button
                onClick={onViewAuth}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-700/60"
              >
                <Lock className="w-3 h-3 text-blue-400" />
                <span>Auth UI</span>
              </button>
            )}
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{workspace.plan} Plan</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md font-mono border border-emerald-500/30">
                Tier {workspace.messaging_limit}
              </span>
            </div>

            {/* Contacts Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Audience</span>
                <span>{workspace.usage_contacts.toLocaleString()} / {workspace.max_contacts.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-500 h-full rounded-full transition-all" 
                  style={{ width: `${(workspace.usage_contacts / workspace.max_contacts) * 100}%` }}
                />
              </div>
            </div>

            {/* AI Replies Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>AI Replies</span>
                <span>{workspace.usage_ai_replies.toLocaleString()} / {workspace.max_ai_replies.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all" 
                  style={{ width: `${(workspace.usage_ai_replies / workspace.max_ai_replies) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-bold text-slate-900 capitalize tracking-tight font-display">
              {currentTab.replace('-', ' ')}
            </h1>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Meta Cloud API v20.0
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">Phone Quality: HIGH (Green)</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-sm">
              DD
            </div>
          </div>
        </header>

        {/* Dynamic Page Component Render */}
        <div className="flex-1 overflow-y-auto bg-slate-50/80 p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
