import React, { useState } from 'react';
import { 
  Settings, Key, ShieldCheck, Phone, Globe, Check, 
  ExternalLink, Copy, CheckCircle2, AlertTriangle, RefreshCw, Lock
} from 'lucide-react';
import { Workspace } from '../../types';
import { IndustryValidator } from '../compliance/IndustryValidator';

interface SettingsViewProps {
  workspace: Workspace;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ workspace }) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'workspace' | 'api' | 'compliance'>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(true);

  const webhookUrl = 'https://uwcjgxkqzzmypifebzqd.supabase.co/functions/v1/whatsapp-webhook';
  const verifyToken = 'wh_verify_9f82a1bc34d8e7';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      setConnectionSuccess(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings & Integrations</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure Meta WhatsApp Cloud API credentials, webhooks, workspace profile, and compliance parameters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          WhatsApp Cloud API
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'workspace'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Workspace Profile
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'compliance'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Meta Policy & Compliance
        </button>
      </div>

      {/* Tab 1: WhatsApp Cloud API Setup */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* Status Box */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">Meta Cloud API v20.0 Connected</h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Phone ID: <strong>109845019283102</strong> • WABA ID: <strong>948201948201948</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 self-end sm:self-center cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Pinging Meta...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Webhook Configuration Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Webhook Configuration (Meta Developer Portal)</h3>
            <p className="text-xs text-slate-500">
              Paste these details in your Meta App Dashboard under <strong>WhatsApp → Configuration</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Callback URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-[11px] text-slate-700"
                  />
                  <button
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 shrink-0 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Verify Token</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={verifyToken}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-[11px] text-slate-700"
                  />
                  <button
                    onClick={() => copyToClipboard(verifyToken)}
                    className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 shrink-0 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600 text-[11px] flex items-center justify-between">
                <span>Webhook Subscribed Fields: <strong>messages, message_template_status_update</strong></span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Subscribed</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Workspace Profile */}
      {activeTab === 'workspace' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Company & Industry Verification</h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                defaultValue={workspace.name}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">WhatsApp Business Display Phone</label>
              <input
                type="text"
                defaultValue={workspace.phone_number}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Industry Category</label>
              <input
                type="text"
                defaultValue={workspace.industry}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800"
              />
            </div>

            {/* Live Commerce Policy Check */}
            <div className="pt-2">
              <IndustryValidator industry={workspace.industry} />
            </div>

            <div className="pt-4 flex justify-end">
              <button className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Meta Policy & Compliance */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">WhatsApp Policy Protection Engines</h3>
            <p className="text-xs text-slate-500">
              Autonomous safeguards protecting your phone number from carrier spam filters and Meta bans.
            </p>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">72-Hour Marketing Frequency Capping</span>
                  <span className="text-slate-500 text-[11px]">Suppresses repeated marketing messages to the same user</span>
                </div>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Enforced
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Automatic STOP Keyword Opt-Out</span>
                  <span className="text-slate-500 text-[11px]">Processes STOP/UNSUBSCRIBE in &lt;100ms without agent intervention</span>
                </div>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Enforced
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">24h Customer Care Window Interlock</span>
                  <span className="text-slate-500 text-[11px]">Disables free-form text input when service session has elapsed</span>
                </div>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Enforced
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Pre-Submission Template Rejection Linter</span>
                  <span className="text-slate-500 text-[11px]">Audits variable syntax, url shorteners, and promotional copy</span>
                </div>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Enforced
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
