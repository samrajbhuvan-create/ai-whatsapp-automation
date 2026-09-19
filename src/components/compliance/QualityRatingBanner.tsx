import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { QualityRating } from '../../types';

interface QualityRatingBannerProps {
  rating: QualityRating;
  messagingLimit: string;
  phone: string;
  onViewGuidelines?: () => void;
}

export const QualityRatingBanner: React.FC<QualityRatingBannerProps> = ({
  rating,
  messagingLimit,
  phone,
  onViewGuidelines
}) => {
  const getRatingConfig = () => {
    switch (rating) {
      case 'GREEN':
        return {
          bg: 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900',
          badgeBg: 'bg-emerald-500 text-white',
          pulseColor: 'bg-emerald-400',
          title: 'High Quality Phone Rating',
          desc: 'Your WhatsApp Business account is operating with optimal customer trust. Low block and report rates (<0.15%).',
          icon: ShieldCheck,
          actionText: 'Tier Progression Healthy'
        };
      case 'YELLOW':
        return {
          bg: 'bg-amber-50/90 border-amber-200 text-amber-900',
          badgeBg: 'bg-amber-500 text-white',
          pulseColor: 'bg-amber-400',
          title: 'Medium Quality Warning',
          desc: 'Customer feedback or spam reports have elevated recently. If unaddressed within 7 days, your messaging limit will downgrade.',
          icon: AlertTriangle,
          actionText: 'Review Recent Campaigns'
        };
      case 'RED':
        return {
          bg: 'bg-rose-50/90 border-rose-200 text-rose-900',
          badgeBg: 'bg-rose-600 text-white',
          pulseColor: 'bg-rose-500',
          title: 'Low Quality Critical Alert',
          desc: 'High customer block rate detected. Messaging tier is throttled to prevent suspension. Template approvals are paused.',
          icon: AlertCircle,
          actionText: 'Remediation Steps Required'
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-800',
          badgeBg: 'bg-slate-500 text-white',
          pulseColor: 'bg-slate-400',
          title: 'Quality Assessment Pending',
          desc: 'Awaiting initial conversation feedback volume from Meta Cloud API.',
          icon: Info,
          actionText: 'Check Status'
        };
    }
  };

  const config = getRatingConfig();
  const IconComponent = config.icon;

  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-all duration-200 ${config.bg} backdrop-blur-sm`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="relative mt-0.5">
            <span className={`flex h-3 w-3 absolute -top-1 -left-1`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${config.badgeBg}`}></span>
            </span>
            <div className="w-9 h-9 rounded-lg bg-white shadow-xs border border-slate-200/60 flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold tracking-tight">{config.title}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${config.badgeBg}`}>
                {rating}
              </span>
              <span className="text-xs text-slate-500 hidden md:inline">
                {phone}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
              {config.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/80 border border-slate-200/80 shadow-2xs text-slate-700">
            24h Limit: <strong className="text-slate-900">{messagingLimit}</strong>
          </span>
          {onViewGuidelines && (
            <button
              onClick={onViewGuidelines}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 bg-white/90 hover:bg-white px-3 py-1 rounded-md border border-brand-200 shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Policies</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
