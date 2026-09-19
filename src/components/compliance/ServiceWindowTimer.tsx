import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Send, Lock } from 'lucide-react';

interface ServiceWindowTimerProps {
  expiresAt: string | Date;
  onOpenTemplateModal?: () => void;
}

export const ServiceWindowTimer: React.FC<ServiceWindowTimerProps> = ({
  expiresAt,
  onOpenTemplateModal
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isExpired: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (timeLeft.isExpired) {
    return (
      <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-2.5 px-3 text-xs flex items-center justify-between text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="font-semibold">24h Customer Care Window Expired</span>
            <span className="text-amber-700 block text-[11px]">
              Meta policy requires an approved template to re-engage this contact.
            </span>
          </div>
        </div>
        {onOpenTemplateModal && (
          <button
            onClick={onOpenTemplateModal}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-3 py-1 rounded text-xs transition-colors shrink-0 shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Send Template</span>
          </button>
        )}
      </div>
    );
  }

  const isLowTime = timeLeft.hours < 2;

  return (
    <div className={`rounded-lg p-2 px-3 text-xs flex items-center justify-between border transition-all ${
      isLowTime
        ? 'bg-amber-50/60 border-amber-200 text-amber-900'
        : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
    }`}>
      <div className="flex items-center gap-2">
        <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`} />
        <span className="text-[11px] font-medium text-slate-700">
          24h Service Window:{' '}
          <strong className="font-mono text-slate-900 font-bold">
            {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
          </strong>
        </span>
      </div>

      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
        isLowTime ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
      }`}>
        {isLowTime ? 'Expiring Soon' : 'Free-form Enabled'}
      </span>
    </div>
  );
};
