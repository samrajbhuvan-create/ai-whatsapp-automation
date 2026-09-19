import React from 'react';
import { 
  Send, 
  CheckCircle, 
  Eye, 
  MessageSquare, 
  Bot, 
  ShieldCheck, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { Workspace } from '../types';

interface DashboardViewProps {
  workspace: Workspace;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ workspace, onNavigate }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Meta Health & Setup Checklist Alert */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-brand-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800 text-sm">Meta Account Health: High (Tier {workspace.messaging_limit})</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
            </div>
            <p className="text-xs text-slate-500">Connected to phone number {workspace.phone_number} with zero delivery policy warnings.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onNavigate('templates')}
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow transition-colors"
          >
            Create New Template
          </button>
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Messages Sent</span>
            <Send className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-display">14,289</div>
          <div className="flex items-center text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>+18.4% from last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivery Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-display">99.4%</div>
          <div className="text-[11px] text-slate-500">14,203 delivered successfully</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Read / Open Rate</span>
            <Eye className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-display">74.2%</div>
          <div className="text-[11px] text-slate-500">10,541 read within 15 min</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Autonomous Res.</span>
            <Bot className="w-4 h-4 text-ai-600" />
          </div>
          <div className="text-2xl font-bold text-ai-600 font-display">68.5%</div>
          <div className="text-[11px] text-ai-700 font-medium">Resolved without human agent</div>
        </div>

      </div>

      {/* 3. Setup Checklist & Quick Actions */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Setup Progress */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Launch Readiness Checklist</h3>
              <p className="text-xs text-slate-500">Steps completed to start broadcast campaigns</p>
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md">3 of 4 Done</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-700">Connect Meta Cloud API & Verified Phone</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-mono font-bold">COMPLETED</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-700">Import Opted-in Contacts with Consent Proof</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-mono font-bold">COMPLETED</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-700">Configure AI Agent RAG Brain & Pass Scope Test</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-mono font-bold">COMPLETED</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-brand-50/50 rounded-xl border border-brand-200">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold text-brand-900">Submit First Marketing Campaign Template</span>
              </div>
              <button 
                onClick={() => onNavigate('templates')}
                className="text-xs text-white bg-brand-600 hover:bg-brand-700 px-3 py-1 rounded-lg font-semibold shadow-sm"
              >
                Start
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Live Activity Stream</h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex items-start space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-slate-800 font-medium">Inbound message from Amy Lee</p>
                <span className="text-[10px] text-slate-400">Handled by AI Agent Amy • 2m ago</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-slate-800 font-medium">Broadcast completed: VIP Preview</p>
                <span className="text-[10px] text-slate-400">1,250 delivered • 1h ago</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-slate-800 font-medium">New contact opted-in via Website</p>
                <span className="text-[10px] text-slate-400">Consent recorded in ledger • 3h ago</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
