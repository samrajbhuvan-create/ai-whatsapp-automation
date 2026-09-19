import React, { useState } from 'react';
import { ShieldCheck, X, CheckSquare, AlertCircle, FileText } from 'lucide-react';

interface OptInConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { source: string; notes: string; proofProvided: boolean }) => void;
  contactCount: number;
}

export const OptInConsentModal: React.FC<OptInConsentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contactCount
}) => {
  const [source, setSource] = useState('Website Checkout Checkbox');
  const [notes, setNotes] = useState('');
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Meta Opt-In Attestation</h3>
              <p className="text-xs text-slate-500">Legal requirement per WhatsApp Business Policy</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs text-slate-600">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 text-emerald-900 leading-relaxed">
            <strong>Mandatory WhatsApp Consent:</strong> You are adding or broadcasting to <strong>{contactCount}</strong> contacts. Meta Terms require that each individual affirmatively opted in to receive messages via WhatsApp from your business.
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 block">Opt-In Source Method</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Website Checkout Checkbox">Website Checkout Checkbox (Unbundled)</option>
              <option value="Landing Page Form">Landing Page Specific Opt-In Form</option>
              <option value="Inbound WhatsApp Keyword">Inbound WhatsApp Keyword (Customer Sent 'START')</option>
              <option value="In-Store QR Code">In-Store QR Code Scan & Verification</option>
              <option value="Customer Support Interaction">Customer Support Interaction Verbal/Written Consent</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 block">Consent Verification URL or Reference (Optional)</label>
            <input
              type="text"
              placeholder="e.g. https://yourbrand.com/opt-in-terms"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
            <span className="text-[11px] text-slate-600 leading-normal">
              I certify under penalty of account suspension that all {contactCount} contacts provided verifiable consent to receive WhatsApp messages. I understand purchased or third-party lists violate Meta policies and will lead to an immediate ban.
            </span>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!agreed}
            onClick={() => onConfirm({ source, notes, proofProvided: true })}
            className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 ${
              agreed
                ? 'bg-brand-600 hover:bg-brand-700 text-white cursor-pointer shadow'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Confirm & Record Opt-In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
