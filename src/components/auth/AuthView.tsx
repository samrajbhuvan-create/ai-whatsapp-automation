import React, { useState, useEffect } from 'react';
import {
  MessageSquare, ShieldCheck, ArrowRight, Lock, Mail, Building,
  Sparkles, CheckCircle2, Loader2, AlertCircle, Wifi, WifiOff,
  Globe, Phone, Bot, ChevronRight, Star,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { IndustryValidator } from '../compliance/IndustryValidator';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface AuthViewProps {
  onLoginSuccess: () => void;
}

const INDUSTRIES = [
  'Retail & E-commerce',
  'Food & Beverage',
  'Healthcare & Clinics',
  'Hospitality & Travel',
  'Education & Tutoring',
  'Financial Services',
  'Real Estate',
  'Beauty & Wellness',
  'Technology & SaaS',
  'Professional Services',
  'Non-Profit',
  'Gambling & Casino (Restricted)',
  'Adult Content (Prohibited)',
  'Cryptocurrency (Restricted)',
];

type AuthMode = 'login' | 'signup';
type OnboardingStep = 1 | 2 | 3 | 4;

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [onboarding, setOnboarding] = useState(false);
  const [step, setStep] = useState<OnboardingStep>(1);

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Business info
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('Retail & E-commerce');
  const [country, setCountry] = useState('PH');
  const [website, setWebsite] = useState('');

  // WABA status (returned from Meta Embedded Signup)
  const [wabaConnected, setWabaConnected] = useState(false);
  const [phoneInfo, setPhoneInfo] = useState<{
    phone_number?: string;
    quality_rating?: string;
    messaging_limit_tier?: string;
    display_name?: string;
  }>({});

  // AI setup
  const [agentName, setAgentName] = useState('WhatsApp Assistant');
  const [businessDesc, setBusinessDesc] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Auth Handlers ─────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // App.tsx listens to onAuthStateChange — no need to call onLoginSuccess here
    // It fires automatically when session is set
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
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

    // DB trigger auto-creates workspace + profile
    // Move to onboarding wizard
    setOnboarding(true);
    setStep(1);
    setLoading(false);
  };

  // ── Meta Embedded Signup ─────────────────────────────────────────────────

  useEffect(() => {
    if (!onboarding) return;

    // Load Facebook SDK for Embedded Signup
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: import.meta.env.VITE_META_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v20.0',
      });
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      document.body.appendChild(script);
    }
  }, [onboarding]);

  const handleConnectMeta = () => {
    if (!window.FB) {
      setError('Facebook SDK not loaded. Please refresh and try again.');
      return;
    }

    window.FB.login(
      async (response: any) => {
        if (response.authResponse) {
          setLoading(true);
          const { accessToken } = response.authResponse;

          try {
            // Get current user's workspace_id
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase
              .from('profiles')
              .select('workspace_id')
              .eq('id', user!.id)
              .single();

            // Call our setup-workspace edge function
            const res = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/setup-workspace`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                },
                body: JSON.stringify({
                  workspace_id: profile?.workspace_id,
                  access_token: accessToken,
                }),
              }
            );

            const result = await res.json();
            if (res.ok) {
              setPhoneInfo({
                phone_number: result.phone_number,
                quality_rating: result.quality_rating,
                messaging_limit_tier: result.messaging_limit_tier,
                display_name: result.display_name,
              });
              setWabaConnected(true);
            } else {
              setError(result.error ?? 'Failed to connect WABA. Please try again.');
            }
          } catch (e: any) {
            setError(e.message);
          }
          setLoading(false);
        } else {
          setError('Meta login was cancelled. Please try again.');
        }
      },
      {
        config_id: import.meta.env.VITE_META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
      }
    );
  };

  // ── Step Navigation ───────────────────────────────────────────────────────

  const canProceed = () => {
    if (step === 1) return industry && !industry.includes('Prohibited');
    if (step === 2) return wabaConnected;
    if (step === 3) return businessDesc.length > 10;
    return true;
  };

  const handleNextStep = async () => {
    setError(null);

    if (step === 1) {
      // Save business details to workspace
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('workspace_id')
        .eq('id', user!.id)
        .single();

      await supabase.from('workspaces')
        .update({ name: businessName, industry, country, website })
        .eq('id', profile?.workspace_id);

      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Save AI agent initial config
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('workspace_id')
        .eq('id', user!.id)
        .single();

      await supabase.from('ai_agent_configs')
        .update({
          agent_name: agentName,
          business_knowledge: businessDesc,
          is_enabled: true,
        })
        .eq('workspace_id', profile?.workspace_id);

      setStep(4);
    } else {
      // Step 4 complete — go to dashboard
      onLoginSuccess();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
            <MessageSquare className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">AutoWhatsApp AI</h1>
            <p className="text-xs text-slate-400">WhatsApp Cloud API — Enterprise SaaS Platform</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-black/40 p-8 border border-white/10">
          {!onboarding ? (
            // ── AUTH FORM ──────────────────────────────────────────────────
            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4 text-xs">
              {/* Tabs */}
              <div className="flex border-b border-slate-100 mb-5">
                {(['login', 'signup'] as AuthMode[]).map(m => (
                  <button key={m} type="button" onClick={() => { setMode(m); setError(null); }}
                    className={`flex-1 py-2 font-bold text-center transition-all text-sm ${
                      mode === m ? 'text-brand-600 border-b-2 border-brand-500' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                    {m === 'login' ? 'Sign In' : 'Create Workspace'}
                  </button>
                ))}
              </div>

              {mode === 'signup' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Your Full Name</label>
                    <input
                      type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Jane Dela Cruz" required
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Business Name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                        placeholder="Dressed Delights Ltd" required
                        className="w-full pl-9 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Business Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com" required
                    className="w-full pl-9 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters" required minLength={8}
                    className="w-full pl-9 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 mt-2">
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <>
                    <span>{mode === 'login' ? 'Enter Workspace' : 'Create Account & Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>}
              </button>

              <div className="pt-1 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>AES-256 Encrypted · GDPR Compliant · Meta Verified Platform</span>
              </div>
            </form>
          ) : (
            // ── ONBOARDING WIZARD ────────────────────────────────────────────
            <div className="space-y-5 text-xs">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-900 text-sm">WhatsApp Setup Wizard</span>
                  <span className="text-slate-400 text-xs">Step {step} of 4</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 font-medium">
                  {['Business', 'Connect Meta', 'AI Agent', 'Launch'].map((label, i) => (
                    <span key={label} className={i + 1 <= step ? 'text-brand-600 font-bold' : ''}>{label}</span>
                  ))}
                </div>
              </div>

              {/* ── STEP 1: Business Details ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800">Business Profile & Industry Check</h4>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Legal Company Name</label>
                    <input
                      type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Industry</label>
                    <select
                      value={industry} onChange={e => setIndustry(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-brand-400 focus:outline-none">
                      {INDUSTRIES.map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Country</label>
                      <select value={country} onChange={e => setCountry(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-white">
                        <option value="PH">Philippines</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="IN">India</option>
                        <option value="SG">Singapore</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Website</label>
                      <div className="relative">
                        <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                          placeholder="https://..." className="w-full pl-7 border border-slate-200 rounded-xl p-2.5" />
                      </div>
                    </div>
                  </div>
                  <IndustryValidator industry={industry} />
                </div>
              )}

              {/* ── STEP 2: Connect Meta WABA ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800">Connect Your WhatsApp Business Account</h4>
                  <p className="text-slate-500">
                    Click below to securely connect your Meta WhatsApp Business Account (WABA).
                    You'll log in with your Facebook Business account and select your phone number.
                  </p>

                  {!wabaConnected ? (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={handleConnectMeta}
                        disabled={loading}
                        className="w-full py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md">
                        {loading
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <>
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span>Connect with Meta / Facebook</span>
                          </>}
                      </button>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 space-y-1">
                        <p className="font-semibold">Before connecting, make sure:</p>
                        <ul className="space-y-0.5 list-none">
                          {[
                            'You have a Facebook Business account',
                            'Your WhatsApp Business number is verified',
                            'Your Meta Business is verified (or use a test number)',
                          ].map(item => (
                            <li key={item} className="flex items-start gap-1.5">
                              <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>WhatsApp Account Connected!</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {[
                            { label: 'Phone Number', value: phoneInfo.phone_number ?? '—' },
                            { label: 'Display Name', value: phoneInfo.display_name ?? '—' },
                            { label: 'Quality Rating', value: phoneInfo.quality_rating ?? '—' },
                            { label: 'Messaging Tier', value: phoneInfo.messaging_limit_tier ?? '—' },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <span className="text-slate-500">{label}: </span>
                              <span className="font-semibold text-slate-800">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 text-[11px]">
                        <Wifi className="w-3.5 h-3.5" />
                        <span>Webhook auto-registered with Meta</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3: AI Agent Setup ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800">Configure Your AI Assistant</h4>
                  <div className="flex items-center gap-2 p-3 bg-brand-50 border border-brand-100 rounded-xl text-brand-700">
                    <Bot className="w-5 h-5 shrink-0" />
                    <p className="text-[11px]">Your AI will use this information to answer customer inquiries automatically.</p>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Agent Name</label>
                    <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Tell the AI about your business{' '}
                      <span className="text-slate-400 font-normal">(products, hours, FAQs)</span>
                    </label>
                    <textarea
                      value={businessDesc} onChange={e => setBusinessDesc(e.target.value)}
                      rows={5} placeholder="e.g. We are a fashion boutique open Mon-Sat 9am-9pm. We sell dresses, accessories and bags. Free delivery for orders above ₱1,500..."
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none resize-none"
                    />
                    <p className="text-slate-400 mt-1">{businessDesc.length} chars — aim for 200+</p>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Launch ── */}
              {step === 4 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xl text-slate-900">You're Ready to Launch!</h4>
                    <p className="text-slate-500 text-xs mt-2 max-w-xs mx-auto">
                      Your WhatsApp AI workspace is fully configured and connected to Meta.
                      Start automating customer conversations.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-left">
                    {[
                      '✅ Workspace created',
                      '✅ WABA connected',
                      '✅ Webhook registered',
                      '✅ AI agent configured',
                      '✅ 14-day free trial active',
                      '✅ Compliance gates enabled',
                    ].map(item => (
                      <div key={item} className="bg-slate-50 rounded-lg px-2 py-1.5 font-medium text-slate-700">{item}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                {step > 1 && step < 4 ? (
                  <button type="button" onClick={() => setStep(prev => (prev - 1) as OnboardingStep)}
                    className="px-3 py-1.5 text-slate-500 hover:text-slate-800 font-semibold">
                    Back
                  </button>
                ) : <div />}

                <button
                  type="button"
                  onClick={step < 4 ? handleNextStep : onLoginSuccess}
                  disabled={loading || !canProceed()}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all">
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <>
                      <span>{step === 4 ? '🚀 Go to Dashboard' : 'Continue'}</span>
                      {step < 4 && <ArrowRight className="w-3.5 h-3.5" />}
                    </>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 mt-4">
          By registering, you agree to our Terms of Service and Meta's
          <a href="https://www.whatsapp.com/legal/business-policy/" target="_blank" rel="noreferrer"
            className="text-brand-400 hover:underline ml-1">WhatsApp Business Policy</a>.
        </p>
      </div>
    </div>
  );
};
