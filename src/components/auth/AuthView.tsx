import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Bot,
  ShieldCheck,
  Zap,
  Loader2,
  Building,
  User,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  Ripple,
  TechOrbitDisplay,
  BoxReveal,
  Input,
  Label,
  BottomGradient,
  Image,
} from '../ui/modern-animated-sign-in';
import { iconsArray } from '../ui/demo';

interface AuthViewProps {
  onLoginSuccess: () => void;
  onDemoLogin: () => void;
  onBackToLanding?: () => void;
}

type AuthMode = 'login' | 'signup';

// Additional icons specifically for WhatsApp & AI automation
const orbitIcons = [
  ...iconsArray,
  {
    component: () => (
      <div className="size-full flex items-center justify-center bg-emerald-500/20 rounded-full border border-emerald-500/40">
        <MessageSquare className="size-5 text-emerald-400" />
      </div>
    ),
    className: 'size-[42px] border-none bg-transparent',
    radius: 160,
    duration: 25,
    delay: 15,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <div className="size-full flex items-center justify-center bg-purple-500/20 rounded-full border border-purple-500/40">
        <Sparkles className="size-5 text-purple-400" />
      </div>
    ),
    className: 'size-[42px] border-none bg-transparent',
    radius: 240,
    duration: 22,
    delay: 5,
    path: false,
    reverse: true,
  },
];

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onDemoLogin,
  onBackToLanding,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
      }
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              business_name: formData.businessName || 'My Business',
            },
          },
        });

        if (authError) {
          const isEmailLimitError =
            authError.message.toLowerCase().includes('rate limit') ||
            (authError.message.toLowerCase().includes('email') &&
              authError.message.toLowerCase().includes('limit')) ||
            authError.message.toLowerCase().includes('quota') ||
            authError.message.toLowerCase().includes('too many');

          if (isEmailLimitError) {
            setError(
              'Email rate limit reached. Please use "Launch Instant Test Workspace" below, or configure custom SMTP in Supabase.'
            );
          } else {
            setError(authError.message);
          }
          setLoading(false);
          return;
        }

        if (data?.user) {
          onLoginSuccess();
        }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (authError) {
          const isEmailLimitError =
            authError.message.toLowerCase().includes('rate limit') ||
            (authError.message.toLowerCase().includes('email') &&
              authError.message.toLowerCase().includes('limit')) ||
            authError.message.toLowerCase().includes('quota') ||
            authError.message.toLowerCase().includes('too many');

          if (isEmailLimitError) {
            setError('Email sending limit reached. Try again later or use the Demo mode.');
          } else {
            setError(authError.message);
          }
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
    setDemoNotice('Starting demo workspace...');
    setTimeout(() => {
      setLoading(false);
      onDemoLogin();
    }, 600);
  };

  return (
    <div className="dark min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden relative">
      {/* Top Header Navigation */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 transition duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MessageSquare className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white">AutoWhatsApp</span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider ml-1.5 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                AI Cloud
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstantDemoLogin}
          className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-500/50 px-3 py-1.5 rounded-lg transition shadow-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Instant Demo</span>
        </button>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex max-lg:flex-col items-center justify-center relative w-full">
        {/* Left Side: Animated Tech Orbit & Brand Visuals */}
        <section className="relative w-full lg:w-1/2 min-h-[460px] lg:min-h-[85vh] flex flex-col items-center justify-center overflow-hidden max-lg:hidden select-none">
          <Ripple mainCircleSize={120} numCircles={10} mainCircleOpacity={0.18} />
          
          <div className="relative z-10 w-full h-[600px] flex items-center justify-center">
            <TechOrbitDisplay
              iconsArray={orbitIcons}
              text="AutoWhatsApp AI"
            />
          </div>

          <div className="absolute bottom-10 left-12 right-12 z-20 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 backdrop-blur-md px-5 py-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Meta Tech Provider Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Gemini 2.5 Multi-turn AI Agent</span>
            </div>
          </div>
        </section>

        {/* Right Side: Modern Animated Form */}
        <section className="w-full lg:w-1/2 min-h-[85vh] flex flex-col justify-center items-center px-4 sm:px-8 py-8 relative z-10">
          <div className="w-full max-w-md mx-auto">
            {/* Mode Switcher Pill */}
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex p-1 rounded-xl bg-slate-900/80 border border-white/10 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    mode === 'login'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    mode === 'signup'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
              <BoxReveal boxColor="#10b981" duration={0.3}>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {mode === 'login' ? 'Welcome back' : 'Start your free trial'}
                </h1>
              </BoxReveal>

              <BoxReveal boxColor="#10b981" duration={0.3} className="pb-4">
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  {mode === 'login'
                    ? 'Sign in to access your WhatsApp AI campaigns & agent'
                    : 'Get started with official WhatsApp Business API & AI automation'}
                </p>
              </BoxReveal>

              {/* Google Social Login */}
              <BoxReveal boxColor="#10b981" duration={0.3} width="100%">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="g-button group/btn w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-lg h-10 font-medium text-xs sm:text-sm text-slate-200 transition duration-200 flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  <Image
                    src="https://cdn.21st.dev/assets/mirror/89/8948eafec4a9c68b2b3a78a756b4474c05e53431f208149556fb669e3c429be2.png"
                    width={20}
                    height={20}
                    alt="Google"
                  />
                  <span>Continue with Google</span>
                  <BottomGradient />
                </button>
              </BoxReveal>

              <div className="flex items-center gap-3 my-5">
                <hr className="flex-1 border-t border-slate-800" />
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                  or with email
                </span>
                <hr className="flex-1 border-t border-slate-800" />
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="fullName" className="text-xs text-slate-300">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Sarah Connor"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        required
                        className="bg-slate-800/90 text-white placeholder:text-slate-500 border border-slate-700 focus-visible:ring-emerald-500 h-9 text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="businessName" className="text-xs text-slate-300">
                        Business Name
                      </Label>
                      <Input
                        id="businessName"
                        type="text"
                        placeholder="Acme Commerce"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        required
                        className="bg-slate-800/90 text-white placeholder:text-slate-500 border border-slate-700 focus-visible:ring-emerald-500 h-9 text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-xs text-slate-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="bg-slate-800/90 text-white placeholder:text-slate-500 border border-slate-700 focus-visible:ring-emerald-500 h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs text-slate-300">
                      Password
                    </Label>
                    {mode === 'login' && (
                      <span className="text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer">
                        Forgot?
                      </span>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="bg-slate-800/90 text-white placeholder:text-slate-500 border border-slate-700 focus-visible:ring-emerald-500 h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Demo Notice */}
                {demoNotice && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{demoNotice}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group/btn relative w-full h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Free Workspace'}</span>
                      <span className="transition-transform group-hover/btn:translate-x-1">&rarr;</span>
                    </>
                  )}
                  <BottomGradient />
                </button>
              </form>

              {/* Instant Test Mode Alternative */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-dashed border-emerald-500/40 hover:border-emerald-500/70 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Launch Instant Test Workspace (No Email Required)</span>
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setError(null);
                    }}
                    className="text-emerald-400 hover:underline font-medium"
                  >
                    {mode === 'login' ? 'Create one now' : 'Sign in here'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-3 px-6 text-center text-[11px] text-slate-500 border-t border-white/5 bg-slate-950/40">
        © 2026 AutoWhatsApp AI. Enterprise WhatsApp Business API automation platform.
      </footer>
    </div>
  );
};

export default AuthView;
