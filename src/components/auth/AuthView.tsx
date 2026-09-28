import React, { useState } from 'react';
import {
  MessageSquare, ShieldCheck, ArrowRight, Lock, Mail, Building,
  Sparkles, CheckCircle2, Loader2, AlertCircle, Globe, Phone, Bot,
  ChevronRight, ArrowLeft, KeyRound, Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthViewProps {
  onLoginSuccess: () => void;
  onBackToLanding?: () => void;
}

type AuthMode = 'signup' | 'login';

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              business_name: businessName || 'My Business',
            },
          },
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        // If user created, onAuthStateChange in App.tsx or onLoginSuccess will route to OnboardingWizard
        if (data?.user) {
          onLoginSuccess();
        }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (data?.user) {
          onLoginSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = () => {
    setLoading(true);
    setDemoNotice('Starting demo workspace session...');
    setTimeout(() => {
      onLoginSuccess();
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-between p-4 sm:p-6 text-slate-100">
      
      {/* Top Navbar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-800/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>Meta WhatsApp Cloud API v20.0 Ready</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        
        {/* Step Indicator Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/30">
            <MessageSquare className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AutoWhatsApp AI</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise AI-Powered WhatsApp Automation SaaS</p>

          {/* 2-Step Journey Pills */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/40">
              <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>{mode === 'signup' ? 'Create SaaS Account' : 'Sign In'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">
              <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Connect Meta WhatsApp API</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                mode === 'signup'
                  ? 'border-brand-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Free Workspace
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                mode === 'login'
                  ? 'border-brand-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Dela Cruz"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Company / Brand Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Dressed Delights Ltd"
                      className="w-full pl-9 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-9 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {demoNotice && (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs">
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-emerald-400" />
                <span>{demoNotice}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Continue to WhatsApp Connection' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Or Instant Evaluation
            </span>
          </div>

          {/* 1-Click Instant Demo Login */}
          <button
            type="button"
            onClick={handleInstantDemoLogin}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Launch Instant Test Workspace (Skip Sign-Up)</span>
          </button>

          {/* Features check */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>14-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero-Ban Architecture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Meta Embedded OAuth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Gemini AI Auto-replies</span>
            </div>
          </div>

        </div>

        {/* Security badge footer */}
        <div className="text-center mt-4 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Official Meta Cloud API Partner Integration · AES-256 Encrypted</span>
        </div>

      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-2 text-[11px] text-slate-500">
        By continuing, you agree to our Terms of Service and Meta's{' '}
        <a
          href="https://www.whatsapp.com/legal/business-policy/"
          target="_blank"
          rel="noreferrer"
          className="text-brand-400 hover:underline"
        >
          WhatsApp Business Policy
        </a>.
      </footer>
    </div>
  );
};
