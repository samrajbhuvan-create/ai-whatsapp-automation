import React from 'react';
import { 
  MessageSquare, ShieldCheck, Zap, Bot, Send, 
  CheckCircle2, ArrowRight, Star, Lock, Sparkles, BarChart2, Globe
} from 'lucide-react';

interface LandingPageViewProps {
  onEnterApp: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <MessageSquare className="w-5 h-5 fill-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">AutoWhatsApp AI</span>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              Meta Cloud API v20.0
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#compliance" className="hover:text-brand-600 transition-colors">Meta Compliance</a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
            <a href="#demo" className="hover:text-brand-600 transition-colors">Live Demo</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterApp}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Subtle Ambient Green Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-100/60 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>The Only 100% WhatsApp Policy-Compliant AI Automation Suite</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
          Automate WhatsApp Sales & Support with <span className="text-brand-600">Zero Ban Risk</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Scale to 100,000+ daily conversations with autonomous Gemini agents, automated 72h frequency capping, 24-hour service window guards, and pre-linted Meta templates.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-2xl shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <span>Start Free 14-Day Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#compliance"
            className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-2xl shadow-2xs transition-colors text-sm"
          >
            Explore WhatsApp Compliance
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Official Cloud API
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 72h Frequency Capping
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 24h Window Safety Guard
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automatic STOP Opt-Out
          </span>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for High-Volume WhatsApp Teams
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Every feature is built around Meta's official API constraints so your business number maintains a GREEN quality rating forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-8 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Autonomous AI Support Agent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by Google Gemini with strict guardrails. Resolves 74%+ of customer inquiries in under 2 seconds without human agent fatigue.
            </p>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-8 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-6">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Tier Broadcasts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dispatches mass campaigns with automated 72h frequency capping and leaky-bucket pacing to eliminate HTTP 429 rate-limiting.
            </p>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-8 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Template Compliance Linter</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Validates your templates against Meta's 9 common rejection rules before submission, ensuring 99.8% first-pass approval.
            </p>
          </div>
        </div>
      </section>

      {/* Compliance Guarantee Banner */}
      <section id="compliance" className="py-16 bg-slate-900 text-white px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Meta Trust & Commerce Policy Certified</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Protect Your Phone Quality Rating. Always.
          </h2>

          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            WhatsApp actively monitors phone block rates. Our system automatically throttles campaigns if health drops to YELLOW, prevents unapproved template spam, and handles STOP unsubscribes instantly.
          </p>

          <div className="pt-4">
            <button
              onClick={onEnterApp}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all text-xs cursor-pointer"
            >
              Open Live Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-100 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span className="font-bold text-slate-700">AutoWhatsApp AI</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600">Terms of Service</a>
            <a href="#" className="hover:text-slate-600">WhatsApp Commerce Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
