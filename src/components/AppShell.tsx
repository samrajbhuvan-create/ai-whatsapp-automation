import React, { useState } from 'react';
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
  LogOut,
  AlertCircle,
  X,
  Zap
} from 'lucide-react';
import { Workspace } from '../types';

interface AppShellProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  workspace: Workspace;
  isDemoMode?: boolean;
  onSignOut?: () => void;
  onConnectWhatsApp?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  workspace,
  isDemoMode = false,
  onSignOut,
  onConnectWhatsApp,
  children
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isWabaConnected = Boolean(workspace.waba_id && workspace.waba_id.length > 3);

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
        
        {/* Top: Logo */}
        <div className="flex flex-col overflow-hidden">
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

          {/* Demo Mode Banner */}
          {isDemoMode && (
            <div className="mx-3 mt-2 p-2 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-300 text-[10px] flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="font-semibold">Demo Mode — Sample Data</span>
            </div>
          )}

          {/* WhatsApp Connection Status */}
          {!isDemoMode && !isWabaConnected && (
            <button
              onClick={onConnectWhatsApp}
              className="mx-3 mt-2 p-2 bg-orange-950/60 border border-orange-500/40 rounded-xl text-orange-300 text-[10px] flex items-center gap-1.5 hover:bg-orange-950 transition-colors cursor-pointer text-left"
            >
              <AlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="font-semibold">Connect WhatsApp →</span>
            </button>
          )}

          {/* Workspace Card */}
          <div className="p-3">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-brand-600/30 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 border border-brand-500/20">
                  {workspace.name.substring(0, 1)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate">{workspace.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${isWabaConnected || isDemoMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="truncate">{workspace.phone_number}</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-2 py-1 space-y-1 overflow-y-auto flex-1">
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

        {/* Bottom: Plan Usage */}
        <div className="p-3 border-t border-slate-800 space-y-2.5">
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
                  style={{ width: `${Math.min((workspace.usage_contacts / workspace.max_contacts) * 100, 100)}%` }}
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
                  style={{ width: `${Math.min((workspace.usage_ai_replies / workspace.max_ai_replies) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sign Out */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isDemoMode ? 'Exit Demo' : 'Sign Out'}</span>
            </button>
          )}
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-bold text-slate-900 capitalize tracking-tight font-display">
              {currentTab.replace(/-/g, ' ')}
            </h1>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Meta Cloud API v20.0
            </span>
            {isDemoMode && (
              <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200 font-semibold">
                Demo Workspace
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isWabaConnected || isDemoMode ? (
              <div className="flex items-center space-x-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold">Phone Quality: HIGH (Green)</span>
              </div>
            ) : (
              <button
                onClick={onConnectWhatsApp}
                className="flex items-center space-x-2 text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200 shadow-2xs hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="font-semibold">Connect WhatsApp</span>
              </button>
            )}

            <div 
              className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-sm hover:bg-brand-700 transition-colors"
              title={isDemoMode ? 'Demo User' : workspace.name}
            >
              {workspace.name.substring(0, 2).toUpperCase()}
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
