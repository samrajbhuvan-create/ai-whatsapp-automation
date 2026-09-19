import React from 'react';
import { Check, CheckCheck, Phone, Video, MoreVertical, Paperclip, Send, Smile, ArrowLeft } from 'lucide-react';

interface PhonePreviewProps {
  businessName?: string;
  headerType?: 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  headerText?: string;
  headerImageUrl?: string;
  bodyText: string;
  footerText?: string;
  buttons?: {
    type: string;
    text: string;
  }[];
  sampleVariables?: Record<string, string>;
  timeString?: string;
}

export const WhatsAppPhonePreview: React.FC<PhonePreviewProps> = ({
  businessName = "Dressed Delights",
  headerType = "IMAGE",
  headerText,
  headerImageUrl = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
  bodyText,
  footerText = "Sent via your verified business",
  buttons = [
    { type: "URL", text: "Visit Website" },
    { type: "QUICK_REPLY", text: "Stop Promotions" }
  ],
  sampleVariables = { "1": "Felix", "2": "20% OFF" },
  timeString = "12:45 PM"
}) => {
  // Replace {{1}}, {{2}} with sample variables
  let renderedBody = bodyText || "Hello {{1}},\n\nYour special offer {{2}} is ready! Check out our new catalogue and place your order today.";
  Object.entries(sampleVariables).forEach(([key, val]) => {
    renderedBody = renderedBody.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || `{{${key}}}`);
  });

  return (
    <div className="w-[340px] h-[680px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col relative shrink-0">
      {/* Phone Notch & Speaker */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
        <div className="w-12 h-1 bg-slate-700 rounded-full" />
      </div>

      {/* Screen Container */}
      <div className="w-full h-full bg-[#E5DDD5] rounded-[34px] overflow-hidden flex flex-col relative text-xs">
        
        {/* WhatsApp Header */}
        <div className="bg-[#075E54] text-white pt-7 pb-2.5 px-3 flex items-center justify-between shadow z-10">
          <div className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4 cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs border border-white/20">
              {businessName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-[13px] leading-tight flex items-center space-x-1">
                <span>{businessName}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="Official Account" />
              </div>
              <div className="text-[10px] text-emerald-200">Business Account</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-white/90">
            <Video className="w-4 h-4 cursor-pointer" />
            <Phone className="w-4 h-4 cursor-pointer" />
            <MoreVertical className="w-4 h-4 cursor-pointer" />
          </div>
        </div>

        {/* Chat Background Pattern & Messages */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 relative">
          
          {/* Official Business Notice */}
          <div className="bg-[#FDF7E7] text-slate-700 p-2 rounded-lg text-[10px] text-center shadow-sm border border-amber-200/60 leading-relaxed">
            🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
          </div>

          {/* Date separator */}
          <div className="flex justify-center">
            <span className="bg-white/80 backdrop-blur-sm text-slate-600 px-2.5 py-0.5 rounded-md text-[10px] shadow-sm font-medium">
              TODAY
            </span>
          </div>

          {/* WhatsApp Message Card / Bubble */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200/70 overflow-hidden max-w-[92%] ml-auto">
            {/* Header Rendering */}
            {headerType === 'IMAGE' && headerImageUrl && (
              <div className="w-full h-32 bg-slate-200 overflow-hidden relative">
                <img src={headerImageUrl} alt="Header" className="w-full h-full object-cover" />
              </div>
            )}
            {headerType === 'TEXT' && headerText && (
              <div className="p-2.5 pb-0 font-bold text-slate-800 text-[13px]">
                {headerText}
              </div>
            )}

            {/* Body */}
            <div className="p-2.5 text-slate-800 whitespace-pre-wrap leading-relaxed text-[11px]">
              {renderedBody}
            </div>

            {/* Footer & Meta */}
            <div className="px-2.5 pb-1.5 flex items-center justify-between text-[9px] text-slate-400">
              <span>{footerText}</span>
              <div className="flex items-center space-x-1">
                <span>{timeString}</span>
                <CheckCheck className="w-3 h-3 text-sky-500" />
              </div>
            </div>

            {/* Action Buttons */}
            {buttons && buttons.length > 0 && (
              <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/50">
                {buttons.map((btn, idx) => (
                  <div
                    key={idx}
                    className="py-2 px-3 text-center font-medium text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer text-[11px] flex items-center justify-center space-x-1"
                  >
                    <span>{btn.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Fake Composer Footer */}
        <div className="p-2 bg-slate-100 flex items-center space-x-2 border-t border-slate-200">
          <Smile className="w-5 h-5 text-slate-500 cursor-pointer" />
          <div className="flex-1 bg-white h-7 rounded-full px-3 text-slate-400 text-[10px] flex items-center">
            Type a message
          </div>
          <Paperclip className="w-4 h-4 text-slate-500 cursor-pointer" />
          <div className="w-7 h-7 rounded-full bg-[#128C7E] flex items-center justify-center text-white cursor-pointer shadow-sm">
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>

      </div>
    </div>
  );
};
