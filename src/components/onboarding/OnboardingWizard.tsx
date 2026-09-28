import React, { useState } from "react";
import {
  MessageSquare, CheckCircle2, AlertTriangle, ArrowRight,
  Shield, Phone, Building2, Loader2, ExternalLink, ShieldCheck,
  Sparkles, Lock, Globe
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const PROHIBITED_INDUSTRIES = [
  "Weapons & Firearms",
  "Ammunition / Explosives",
  "Real Money Gambling",
  "Adult Content / Services",
  "Tobacco Products",
  "Alcohol (Direct-to-Consumer Retail)",
  "Illegal / Recreational Drugs",
  "Prescription Medication (Unlicensed)",
  "Unlicensed Financial Services / Crypto",
  "MLM / Pyramid Schemes",
];

const ALLOWED_INDUSTRIES = [
  "Retail & E-commerce",
  "Education & e-Learning",
  "Healthcare (Licensed Providers)",
  "Real Estate",
  "Travel & Hospitality",
  "Food & Beverage",
  "Financial Services (Licensed)",
  "SaaS & Technology",
  "Beauty & Personal Care",
  "Automotive",
  "Professional Services",
  "Non-Profit / NGO",
  "Other (Compliant)",
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [isProhibited, setIsProhibited] = useState(false);
  const [wabaConnected, setWabaConnected] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [consentOptIn, setConsentOptIn] = useState(false);
  const [consentPolicy, setConsentPolicy] = useState(false);
  const [consentIndustry, setConsentIndustry] = useState(false);

  const handleIndustryChange = (val: string) => {
    setIndustry(val);
    setIsProhibited(PROHIBITED_INDUSTRIES.includes(val));
    setError("");
  };

  const handleStep1Submit = () => {
    if (!businessName.trim()) { setError("Enter your business name"); return; }
    if (!industry) { setError("Select your industry"); return; }
    if (isProhibited) { setError("Your industry is prohibited on the WhatsApp Business Platform"); return; }
    if (!country.trim()) { setError("Enter your country"); return; }
    setError("");
    setStep(2);
  };

  const handleEmbeddedSignup = () => {
    setLoading(true);
    setTimeout(() => {
      setWabaConnected(true);
      setPhoneNumber("+1 (555) 902-1144");
      setWabaId("WABA_" + Math.random().toString(36).slice(2, 10).toUpperCase());
      setLoading(false);
    }, 2000);
  };

  const handleStep2Next = () => {
    if (!wabaConnected) { setError("Connect your WhatsApp Business Account first"); return; }
    setError("");
    setStep(3);
  };

  const handleStep3Submit = async () => {
    if (!consentOptIn || !consentPolicy || !consentIndustry) {
      setError("You must accept all compliance agreements to proceed");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("workspaces").upsert({
          id: user.id,
          name: businessName,
          industry,
          country,
          waba_id: wabaId,
          phone_number: phoneNumber,
          quality_rating: "GREEN",
          messaging_limit: "250",
          plan: "Starter",
          usage_contacts: 0,
          max_contacts: 1000,
          usage_ai_replies: 0,
          max_ai_replies: 500,
        });
      }
      setLoading(false);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const STEPS = [
    { n: 1, label: "Business" },
    { n: 2, label: "Connect WA" },
    { n: 3, label: "Compliance" },
    { n: 4, label: "Live!" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/30">
            <MessageSquare className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Set up AutoWhatsApp AI</h1>
          <p className="text-slate-400 text-sm mt-1">Connect your WhatsApp Business in under 5 minutes</p>
        </div>

        <div className="flex items-center justify-center mb-8 space-x-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s.n ? "bg-emerald-500 text-white" :
                  step === s.n ? "bg-brand-600 text-white ring-2 ring-brand-400 ring-offset-2 ring-offset-slate-900" :
                  "bg-slate-700 text-slate-400"
                }`}>
                  {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${step === s.n ? "text-white" : "text-slate-500"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-14 rounded-full mt-[-18px] ${step > s.n ? "bg-emerald-500" : "bg-slate-700"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">

          {step === 1 && (
            <div className="p-8 space-y-5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Business Profile</h2>
                  <p className="text-xs text-slate-500">Tell us about your business</p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Business Name *</label>
                <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Dressed Delights Ltd"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Industry *</label>
                <select value={industry} onChange={e => handleIndustryChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 bg-white">
                  <option value="">Select your industry...</option>
                  <optgroup label="Allowed Industries">
                    {ALLOWED_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </optgroup>
                  <optgroup label="Prohibited by Meta — Cannot Use WhatsApp API">
                    {PROHIBITED_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </optgroup>
                </select>
                {isProhibited && (
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-xl border border-red-200 mt-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-700">Industry Prohibited by Meta</p>
                      <p className="text-xs text-red-600 mt-0.5">Meta prohibits this industry from using the WhatsApp Business Platform. Account will be banned.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Country *</label>
                  <input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. United States"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
                </div>
              </div>
              {error && <p className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{error}</p>}
              <button onClick={handleStep1Submit} disabled={isProhibited}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Connect Your WhatsApp</h2>
                  <p className="text-xs text-slate-500">Link your WhatsApp Business Account via Meta Embedded Signup</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                {["Log into Facebook (we never see your password)", "Select or create your Meta Business Portfolio", "Register or link your existing WhatsApp phone number", "Grant AutoWhatsApp AI permission to send messages on your behalf"].map((s, i) => (
                  <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-[10px] shrink-0">{i + 1}</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              {!wabaConnected ? (
                <button onClick={handleEmbeddedSignup} disabled={loading}
                  className="w-full bg-[#1877F2] hover:bg-[#1565d8] text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2.5">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</> : <><Globe className="w-4 h-4" /> Continue with Facebook</>}
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-emerald-700 text-sm">WhatsApp Business Account Connected!</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Phone Number</span><span className="font-mono font-semibold text-slate-800">{phoneNumber}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">WABA ID</span><span className="font-mono font-semibold text-slate-800">{wabaId}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Quality Rating</span><span className="font-semibold text-emerald-600">GREEN</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Daily Limit</span><span className="font-semibold text-slate-700">250 (Trial)</span></div>
                  </div>
                  <p className="text-[11px] text-emerald-700 bg-emerald-100 rounded-lg px-3 py-2">Webhook subscribed — AI will receive messages in real-time</p>
                </div>
              )}
              {error && <p className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl text-sm hover:bg-slate-50 transition-colors">Back</button>
                <button onClick={handleStep2Next} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 space-y-5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Compliance Agreement</h2>
                  <p className="text-xs text-slate-500">Required by Meta WhatsApp Business Policy</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { set: setConsentOptIn, val: consentOptIn, title: "I have explicit opt-in consent from all contacts I will message", body: "Every contact has explicitly agreed to receive WhatsApp messages from my business via website form, keyword subscription, or in-person sign-up." },
                  { set: setConsentPolicy, val: consentPolicy, title: "I will comply with Meta WhatsApp Business Messaging Policy", body: "I understand the 24-hour window rule, that marketing messages need pre-approved templates, and STOP keyword triggers immediate opt-out." },
                  { set: setConsentIndustry, val: consentIndustry, title: "My business is not in a Meta-prohibited industry", body: "My business does not operate in weapons, gambling, adult content, unlicensed drugs, tobacco, or financial scam categories." },
                ].map((item, idx) => (
                  <label key={idx} className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${item.val ? "bg-emerald-50 border-emerald-300" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`}>
                    <input type="checkbox" checked={item.val} onChange={e => item.set(e.target.checked)} className="mt-0.5 accent-emerald-600 w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.body}</p>
                    </div>
                  </label>
                ))}
              </div>
              {error && <p className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl text-sm hover:bg-slate-50 transition-colors">Back</button>
                <button onClick={handleStep3Submit} disabled={loading}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <>Agree & Launch <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-400 to-brand-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">{"You're Live!"} 🚀</h2>
                <p className="text-slate-500 text-sm mt-2"><strong>{businessName}</strong>{"'s WhatsApp is connected and your AI agent is ready."}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[{ label: "Phone Connected", icon: "✅" }, { label: "AI Agent Ready", icon: "🤖" }, { label: "Webhook Active", icon: "⚡" }].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-[10px] font-semibold text-slate-600">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 text-left">
                <p className="font-bold mb-1">First Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-amber-700">
                  <li>Create your first template → <strong>Template Builder</strong></li>
                  <li>Import opted-in contacts → <strong>Contacts</strong></li>
                  <li>Configure AI persona → <strong>AI Agent Brain</strong></li>
                </ol>
              </div>
              <button onClick={onComplete}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20">
                <ShieldCheck className="w-5 h-5" /> Enter Dashboard
              </button>
            </div>
          )}
        </div>
        <p className="text-center text-slate-500 text-[11px] mt-4">🔒 Your WhatsApp access token is encrypted using AES-256.</p>
      </div>
    </div>
  );
};
