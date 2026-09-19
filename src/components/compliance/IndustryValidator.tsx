import React from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { isIndustryProhibited, PROHIBITED_INDUSTRIES } from '../../lib/compliance/templateValidator';

interface IndustryValidatorProps {
  industry: string;
  onSelectIndustry?: (industry: string) => void;
}

export const IndustryValidator: React.FC<IndustryValidatorProps> = ({
  industry
}) => {
  const isProhibited = isIndustryProhibited(industry);

  if (isProhibited) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
          <h4 className="font-bold text-sm">Industry Restricted by Meta Commerce Policy</h4>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          Meta WhatsApp strictly forbids commercial messaging or automation for <strong>{industry}</strong>. Using this phone number for prohibited goods will lead to immediate WhatsApp Business Account (WABA) termination.
        </p>
        <div className="text-[11px] bg-white/70 p-2.5 rounded border border-rose-100 text-slate-700">
          <strong>Restricted categories:</strong> {PROHIBITED_INDUSTRIES.slice(0, 4).join(', ')}...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 text-xs text-emerald-900 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <div>
          <span className="font-semibold">{industry}</span>
          <span className="text-emerald-700 block text-[11px]">
            Compliant with Meta Commerce & Business Terms
          </span>
        </div>
      </div>
      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
        Eligible
      </span>
    </div>
  );
};
