import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  HelpCircle,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { WhatsAppPhonePreview } from './WhatsAppPhonePreview';

export const TemplateBuilderView: React.FC = () => {
  const [templateName, setTemplateName] = useState('summer_sale_vip');
  const [category, setCategory] = useState<'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('MARKETING');
  const [language, setLanguage] = useState('English (US)');
  const [headerType, setHeaderType] = useState<'NONE' | 'TEXT' | 'IMAGE'>('IMAGE');
  const [headerText, setHeaderText] = useState('Exclusive Summer Preview');
  const [headerImageUrl, setHeaderImageUrl] = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80');
  const [bodyText, setBodyText] = useState('Hello {{1}},\n\nOur biggest seasonal sale is here! Use VIP coupon code {{2}} at checkout to get an instant discount.\n\nHurry, sale ends this Sunday.');
  const [footerText, setFooterText] = useState('Reply STOP to unsubscribe');
  const [sampleVars, setSampleVars] = useState<Record<string, string>>({
    '1': 'Felix',
    '2': 'SUMMER30'
  });
  const [buttons, setButtons] = useState([
    { type: 'URL', text: 'Shop Collection' },
    { type: 'QUICK_REPLY', text: 'Talk to Stylist' }
  ]);

  // Proactive Meta compliance check
  const isUtilitySuspicious = category === 'UTILITY' && (
    bodyText.toLowerCase().includes('sale') || 
    bodyText.toLowerCase().includes('discount') || 
    bodyText.toLowerCase().includes('offer')
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      
      {/* 1. Left Form Editor (60%) */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 overflow-y-auto space-y-6">
        
        {/* Title & Status */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">WhatsApp Template Builder</h2>
            <p className="text-xs text-slate-500">Design message templates and submit directly for Meta Cloud API approval.</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono border">
              Status: Draft
            </span>
          </div>
        </div>

        {/* Name, Category, Language */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Template Name</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="e.g. order_update_v1"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-brand-500 outline-none font-mono"
            />
            <span className="text-[10px] text-slate-400">Lowercase & underscores only</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-brand-500 outline-none bg-white"
            >
              <option value="MARKETING">Marketing (Promotional)</option>
              <option value="UTILITY">Utility (Account / Order updates)</option>
              <option value="AUTHENTICATION">Authentication (OTPs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-brand-500 outline-none bg-white"
            >
              <option value="English (US)">English (US)</option>
              <option value="Spanish">Spanish</option>
              <option value="Portuguese (BR)">Portuguese (BR)</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>

        {/* Compliance Warning if Utility is chosen with promotional copy */}
        {isUtilitySuspicious && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-amber-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Warning:</strong> Template text appears promotional. Meta will reject templates marked as <strong>Utility</strong> if they contain discount/promotional wording.
            </span>
          </div>
        )}

        {/* Header Options */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Header (Optional)</label>
          <div className="flex space-x-2">
            {(['NONE', 'TEXT', 'IMAGE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setHeaderType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  headerType === type
                    ? 'bg-brand-50 border-brand-500 text-brand-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {headerType === 'TEXT' && (
            <input
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="Header headline..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-brand-500 outline-none mt-2"
            />
          )}

          {headerType === 'IMAGE' && (
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="text"
                value={headerImageUrl}
                onChange={(e) => setHeaderImageUrl(e.target.value)}
                placeholder="Image URL sample for Meta review..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-brand-500 outline-none font-mono"
              />
            </div>
          )}
        </div>

        {/* Body Textarea with Dynamic Variable Inserter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-slate-700">Body Content</label>
            <button
              type="button"
              onClick={() => {
                const nextVar = Object.keys(sampleVars).length + 1;
                setBodyText(prev => prev + ` {{${nextVar}}}`);
                setSampleVars(prev => ({ ...prev, [nextVar]: `Sample ${nextVar}` }));
              }}
              className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Variable</span>
            </button>
          </div>

          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={5}
            maxLength={1024}
            className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:border-brand-500 outline-none leading-relaxed"
          />
          <div className="text-right text-[10px] text-slate-400">
            {bodyText.length}/1024 characters
          </div>
        </div>

        {/* Sample Variables mapping */}
        {Object.keys(sampleVars).length > 0 && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Variable Fallbacks & Meta Review Samples</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(sampleVars).map(([vKey, vVal]) => (
                <div key={vKey} className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">
                    {`{{${vKey}}}`}
                  </span>
                  <input
                    type="text"
                    value={vVal}
                    onChange={(e) => setSampleVars({ ...sampleVars, [vKey]: e.target.value })}
                    className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                    placeholder="Sample value..."
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Footer Note (Optional)</label>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            maxLength={60}
            placeholder="e.g. Reply STOP to opt out"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-brand-500 outline-none"
          />
        </div>

        {/* Action Buttons Container */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Save as Draft
          </button>
          <button 
            onClick={() => alert("Submitting template directly to Meta Graph API...")}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-600/20 flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Meta Approval</span>
          </button>
        </div>

      </div>

      {/* 2. Right Live WhatsApp Simulator Preview (40%) */}
      <div className="w-[380px] bg-slate-100 rounded-2xl border border-slate-200/80 p-4 flex flex-col items-center justify-center shrink-0">
        <div className="text-center mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live WhatsApp Preview</span>
          <p className="text-[10px] text-slate-400">Updates synchronously with your keystrokes</p>
        </div>

        <WhatsAppPhonePreview
          businessName="Dressed Delights"
          headerType={headerType}
          headerText={headerText}
          headerImageUrl={headerImageUrl}
          bodyText={bodyText}
          footerText={footerText}
          sampleVariables={sampleVars}
          buttons={buttons}
        />
      </div>

    </div>
  );
};
