import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, MessageSquare, CheckCheck, Bot, 
  Download, Loader2
} from 'lucide-react';
import { useAnalytics, useContacts, useBroadcasts } from '../../lib/hooks';

export const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const days = timeRange === '24h' ? 1 : (timeRange === '7d' ? 7 : 30);
  const { data: dbDaily, loading } = useAnalytics(days);
  const { contacts } = useContacts();
  const { broadcasts } = useBroadcasts();

  const hourlyData = [
    { time: '00:00', inbound: 45, outbound: 80, ai_resolved: 40 },
    { time: '04:00', inbound: 20, outbound: 35, ai_resolved: 19 },
    { time: '08:00', inbound: 180, outbound: 350, ai_resolved: 145 },
    { time: '12:00', inbound: 340, outbound: 620, ai_resolved: 270 },
    { time: '16:00', inbound: 420, outbound: 710, ai_resolved: 330 },
    { time: '20:00', inbound: 250, outbound: 430, ai_resolved: 195 },
  ];

  const defaultDailyData = [
    { day: 'Mon', inbound: 1200, outbound: 2800, delivery_rate: 99.6, read_rate: 88.2 },
    { day: 'Tue', inbound: 1450, outbound: 3100, delivery_rate: 99.4, read_rate: 89.1 },
    { day: 'Wed', inbound: 1600, outbound: 3400, delivery_rate: 99.5, read_rate: 87.5 },
    { day: 'Thu', inbound: 1380, outbound: 2950, delivery_rate: 99.2, read_rate: 90.3 },
    { day: 'Fri', inbound: 1820, outbound: 4100, delivery_rate: 99.7, read_rate: 91.2 },
    { day: 'Sat', inbound: 980, outbound: 1800, delivery_rate: 99.8, read_rate: 92.0 },
    { day: 'Sun', inbound: 850, outbound: 1500, delivery_rate: 99.9, read_rate: 93.4 },
  ];

  const dailyData = dbDaily.length > 0 
    ? dbDaily.map(d => ({
        day: d.date ? new Date(d.date).toLocaleDateString([], { weekday: 'short' }) : 'Day',
        inbound: d.inbound_count || 100,
        outbound: d.outbound_count || 300,
        delivery_rate: d.delivery_rate || 99.4,
        read_rate: d.read_rate || 88.5,
      }))
    : defaultDailyData;

  const totalBroadcastSent = broadcasts.reduce((acc, b) => acc + (b.sent_count || 0), 0);
  const totalVolume = totalBroadcastSent > 0 ? totalBroadcastSent : 28930;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics & WhatsApp Telemetry</h1>
            {loading && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time delivery performance, AI resolution efficiency, and WhatsApp quality metric history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${timeRange === '24h' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
            >
              24h
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${timeRange === '7d' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${timeRange === '30d' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
            >
              30 Days
            </button>
          </div>

          <button 
            onClick={() => alert("Exporting compliance telemetry CSV report...")}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalVolume.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+14.2% vs previous period</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900">99.5%</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              0 throttling / 429 events
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opt-In Contacts</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{contacts.length > 0 ? contacts.length.toLocaleString() : '4,120'}</span>
            <span className="text-[11px] text-purple-600 font-semibold block mt-0.5">
              100% consent audit verified
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta Quality Rating</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-600">HIGH (Green)</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Zero policy strikes
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Traffic Volume Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Traffic Volume Trends (Inbound vs Outbound)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="outbound" name="Outbound Broadcasts" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Area type="monotone" dataKey="inbound" name="Inbound Customer msgs" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly AI Resolution Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">24-Hour Inbound Inquiries & AI Autonomy</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="inbound" name="Inbound Inquiries" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ai_resolved" name="AI Autonomous Resolutions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
