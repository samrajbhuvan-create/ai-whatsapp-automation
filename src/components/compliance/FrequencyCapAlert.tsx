import React from 'react';
import { ShieldAlert, Info, Clock, Check } from 'lucide-react';

interface FrequencyCapAlertProps {
  cappedContactsCount: number;
  totalSelected: number;
  cooldownHours?: number;
  onProceedAnyway?: () => void;
}

export const FrequencyCapAlert: React.FC<FrequencyCapAlertProps> = ({
  cappedContactsCount,
  totalSelected,
  cooldownHours = 72,
  onProceedAnyway
}) => {
  if (cappedContactsCount === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center gap-2">
        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>All <strong>{totalSelected}</strong> recipients comply with the {cooldownHours}-hour marketing frequency cap policy.</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 shadow-2xs space-y-2">
      <div className="flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <h5 className="font-bold text-slate-900">
            WhatsApp Policy Protection: {cappedContactsCount} recipient(s) Frequency Capped
          </h5>
          <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
            To prevent spam reports and safeguard your <strong>Phone Quality Rating</strong>, our compliance engine automatically suppresses contacts who received a marketing campaign within the last {cooldownHours} hours.
          </p>
        </div>
      </div>

      <div className="bg-white/80 rounded border border-amber-200/60 p-2 flex items-center justify-between text-[11px]">
        <span className="text-slate-600">
          Sending to remaining <strong>{totalSelected - cappedContactsCount}</strong> eligible contacts.
        </span>
        <span className="text-amber-700 font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Auto-skipped: {cappedContactsCount}
        </span>
      </div>
    </div>
  );
};
