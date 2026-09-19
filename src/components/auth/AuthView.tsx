import React, { useState } from 'react';
import { 
  MessageSquare, ShieldCheck, Check, ArrowRight, 
  Lock, Mail, Building, Phone, Sparkles, AlertCircle
} from 'lucide-react';
import { IndustryValidator } from '../compliance/IndustryValidator';

interface AuthViewProps {
  onLoginSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'onboarding'>('login');
  const [email, setEmail] = useState('demo@dresseddelights.com');
  const [password, setPassword] = useState('password123');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [industry, setIndustry] = useState('Retail & E-commerce');
  const [companyName, setCompanyName] = useState('Dressed Delights Ltd');
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 902-1144');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      setMode('onboarding');
    } else {
      onLoginSuccess();
    }
  };

  const handleNextStep = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(prev => prev + 1);
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-xl border border-slate-100 animate-in fade-in duration-300">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <MessageSquare className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">AutoWhatsApp AI</h2>
            <p className="text-xs text-slate-500">Official Meta WhatsApp Cloud API Platform</p>
          </div>
        </div>

        {/* Login & Signup Forms */}
        {mode !== 'onboarding' ? (
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
            <div className="flex border-b border-slate-100 pb-3 mb-4">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 font-bold text-center transition-all ${
                  mode === 'login' ? 'text-brand-600 border-b-2 border-brand-500' : 'text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 font-bold text-center transition-all ${
                  mode === 'signup' ? 'text-brand-600 border-b-2 border-brand-500' : 'text-slate-400'
                }`}
              >
                Create Workspace
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Business Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{mode === 'login' ? 'Enter Workspace' : 'Start WhatsApp Onboarding'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enterprise AES-256 Vault Encrypted</span>
            </div>
          </form>
        ) : (
          /* Onboarding Wizard */
          <div className="space-y-5 text-xs">
            {/* Step Progress Pills */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">WhatsApp Onboarding Wizard</span>
              <span className="text-slate-400 font-medium">Step {onboardingStep} of 3</span>
            </div>

            {onboardingStep === 1 && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs">Step 1: Business Profile & Industry Check</h4>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Legal Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white"
                  >
                    <option value="Retail & E-commerce">Retail & E-commerce</option>
                    <option value="Financial Services">Financial Services (Regulated)</option>
                    <option value="Healthcare Appointments">Healthcare & Clinics</option>
                    <option value="Hospitality & Travel">Hospitality & Travel</option>
                    <option value="Gambling & Casino">Gambling & Casino (Restricted)</option>
                  </select>
                </div>

                <IndustryValidator industry={industry} />
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs">Step 2: Connect Phone Number & WABA</h4>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">WhatsApp Business Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 text-[11px] space-y-1">
                  <p>✓ Meta Embedded Signup enabled</p>
                  <p>✓ Tier 1 messaging limit pre-allocated</p>
                  <p>✓ Webhook verification ready</p>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-4 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h4 className="font-extrabold text-base text-slate-900">Workspace Ready to Launch!</h4>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  Your WhatsApp Cloud API account has been provisioned with <strong>Tier 2 (10,000/24h)</strong> and GREEN quality rating status.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {onboardingStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(prev => prev - 1)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Back
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <span>{onboardingStep === 3 ? 'Go to Dashboard' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
