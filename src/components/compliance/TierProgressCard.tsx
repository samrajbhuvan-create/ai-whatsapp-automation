import React from 'react';
import { ArrowUpRight, TrendingUp, HelpCircle, CheckCircle2 } from 'lucide-react';

interface TierProgressCardProps {
  currentTier: string;
  nextTier: string;
  usedToday: number;
  totalLimit: number;
  qualityRating: string;
}

export const TierProgressCard: React.FC<TierProgressCardProps> = ({
  currentTier,
  nextTier,
  usedToday,
  totalLimit,
  qualityRating
}) => {
  const percentage = Math.min(Math.round((usedToday / totalLimit) * 100), 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-100">
            {currentTier.replace('Tier ', 'T')}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              WhatsApp Messaging Tier
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {currentTier}
              </span>
            </h4>
            <p className="text-xs text-slate-500">24-hour unique recipient limit</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-extrabold text-slate-900">{usedToday.toLocaleString()}</span>
          <span className="text-xs text-slate-400 font-medium"> / {totalLimit.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 my-3">
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              percentage > 85 ? 'bg-amber-500' : 'bg-brand-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
          <span>{percentage}% utilized</span>
          <span>{(totalLimit - usedToday).toLocaleString()} available today</span>
        </div>
      </div>

      {/* Auto-Upgrade Status */}
      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Next tier: <strong>{nextTier}</strong></span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-medium">
          <CheckCircle2 className="w-3 h-3" />
          <span>Quality GREEN for 6d (On track)</span>
        </div>
      </div>
    </div>
  );
};
