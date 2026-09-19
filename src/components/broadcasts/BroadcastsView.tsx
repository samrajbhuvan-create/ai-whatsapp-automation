import React, { useState } from 'react';
import { 
  Send, Plus, Users, Calendar, CheckCircle2, AlertTriangle, 
  Clock, ShieldCheck, Filter, ArrowRight, BarChart2, Eye, 
  XCircle, Sparkles, RefreshCw
} from 'lucide-react';
import { FrequencyCapAlert } from '../compliance/FrequencyCapAlert';
import { TierProgressCard } from '../compliance/TierProgressCard';

export const BroadcastsView: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState([
    {
      id: 'bc_01',
      name: 'Autumn Flash VIP 25% Off',
      template_name: 'weekend_vip_flash_sale',
      category: 'MARKETING',
      status: 'completed',
      total_recipients: 3420,
      sent_count: 3420,
      delivered_count: 3402,
      read_count: 3120,
      failed_count: 18,
      scheduled_at: '2026-09-18T10:00:00Z',
      capped_count: 140
    },
    {
      id: 'bc_02',
      name: 'Order Tracking System Notice',
      template_name: 'shipping_update_v1',
      category: 'UTILITY',
      status: 'completed',
      total_recipients: 1250,
      sent_count: 1250,
      delivered_count: 1248,
      read_count: 1190,
      failed_count: 2,
      scheduled_at: '2026-09-19T08:30:00Z',
      capped_count: 0
    },
    {
      id: 'bc_03',
      name: 'September Loyalty Points Statement',
      template_name: 'loyalty_summary_v2',
      category: 'MARKETING',
      status: 'scheduled',
      total_recipients: 2800,
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
      failed_count: 0,
      scheduled_at: '2026-09-22T14:00:00Z',
      capped_count: 85
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('weekend_vip_flash_sale');
  const [selectedSegment, setSelectedSegment] = useState('VIP');

  // Simulated calculations for compliance checks
  const estimatedRecipients = selectedSegment === 'VIP' ? 1420 : 3850;
  const simulatedCapped = selectedSegment === 'VIP' ? 62 : 194;

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName) return;

    setBroadcasts(prev => [
      {
        id: `bc_${Date.now()}`,
        name: campaignName,
        template_name: selectedTemplate,
        category: 'MARKETING',
        status: 'completed',
        total_recipients: estimatedRecipients - simulatedCapped,
        sent_count: estimatedRecipients - simulatedCapped,
        delivered_count: estimatedRecipients - simulatedCapped - 4,
        read_count: Math.round((estimatedRecipients - simulatedCapped) * 0.88),
        failed_count: 4,
        scheduled_at: new Date().toISOString(),
        capped_count: simulatedCapped
      },
      ...prev
    ]);

    setIsCreating(false);
    setCampaignName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campaign Broadcasts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch bulk WhatsApp template campaigns with automated rate-limiting, 72h frequency capping, and tier protection.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast Campaign</span>
        </button>
      </div>

      {/* Top Tier & Limit Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TierProgressCard
          currentTier="Tier 2"
          nextTier="Tier 3 (100,000 / 24h)"
          usedToday={4120}
          totalLimit={10000}
          qualityRating="GREEN"
        />

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Broadcast Delivery</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Optimal
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900">99.4%</span>
            <p className="text-xs text-slate-500 mt-1">3,402 of 3,420 delivered in &lt;1.8s</p>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>0 rate limit throttle events (HTTP 429)</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frequency Capping Protection</span>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
              72h Policy
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900">225</span>
            <p className="text-xs text-slate-500 mt-1">Contacts shielded this week from spam fatigue</p>
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Blocks & spam complaints minimized</span>
          </div>
        </div>
      </div>

      {/* Broadcast Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create WhatsApp Broadcast</h3>
                  <p className="text-xs text-slate-500">Only Meta-approved templates can be broadcast</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLaunchCampaign} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Fall Collection Launch"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Approved Template</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white text-slate-800"
                  >
                    <option value="weekend_vip_flash_sale">weekend_vip_flash_sale (MARKETING)</option>
                    <option value="shipping_update_v1">shipping_update_v1 (UTILITY)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Target Segment</label>
                  <select
                    value={selectedSegment}
                    onChange={(e) => setSelectedSegment(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white text-slate-800"
                  >
                    <option value="VIP">VIP Customers (1,420 contacts)</option>
                    <option value="ALL">All Opted-In (3,850 contacts)</option>
                  </select>
                </div>
              </div>

              {/* Compliance Warning Component */}
              <FrequencyCapAlert
                cappedContactsCount={simulatedCapped}
                totalSelected={estimatedRecipients}
                cooldownHours={72}
              />

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Selected Audience:</span>
                  <strong className="text-slate-800">{estimatedRecipients}</strong>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Frequency Capped (Excluded):</span>
                  <strong>-{simulatedCapped}</strong>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                  <span>Effective Outbound Batch:</span>
                  <span className="text-emerald-600">{estimatedRecipients - simulatedCapped} msgs</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcasts List Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Campaign History</h3>
          <span className="text-xs text-slate-500">Live webhook status synced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-4">Recipients</th>
                <th className="py-3 px-4">Delivery</th>
                <th className="py-3 px-4">Read Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {broadcasts.map((bc) => (
                <tr key={bc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{bc.name}</div>
                    <span className="text-[10px] text-slate-400">ID: {bc.id}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {bc.template_name}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{bc.total_recipients.toLocaleString()}</div>
                    {bc.capped_count > 0 && (
                      <span className="text-[10px] text-amber-700 font-medium">
                        {bc.capped_count} capped
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{bc.sent_count > 0 ? `${((bc.delivered_count / bc.sent_count) * 100).toFixed(1)}%` : '0%'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {bc.delivered_count} / {bc.sent_count}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-700">
                      {bc.delivered_count > 0 ? `${((bc.read_count / bc.delivered_count) * 100).toFixed(1)}%` : '0%'}
                    </div>
                    <span className="text-[10px] text-slate-400">{bc.read_count} opens</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      bc.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {bc.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-500 text-[11px]">
                    {new Date(bc.scheduled_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
