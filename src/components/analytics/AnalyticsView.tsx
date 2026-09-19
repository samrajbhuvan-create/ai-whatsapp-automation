import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, MessageSquare, CheckCheck, Bot, 
  Clock, ShieldCheck, Download, Calendar, Filter
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const hourlyData = [
    { time: '00:00', inbound: 45, outbound: 80, ai_resolved: 40 },
    { time: '04:00', inbound: 20, outbound: 35, ai_resolved: 19 },
    { time: '08:00', inbound: 180, outbound: 350, ai_resolved: 145 },
    { time: '12:00', inbound: 340, outbound: 620, ai_resolved: 270 },
    { time: '16:00', inbound: 420, outbound: 710, ai_resolved: 330 },
    { time: '20:00', inbound: 250, outbound: 430, ai_resolved: 195 },
  ];

  const dailyData = [
    { day: 'Mon', inbound: 1200, outbound: 2800, delivery_rate: 99.6, read_rate: 88.2 },
    { day: 'Tue', inbound: 1450, outbound: 3100, delivery_rate: 99.4, read_rate: 89.1 },
    { day: 'Wed', inbound: 1600, outbound: 3400, delivery_rate: 99.5, read_rate: 87.5 },
    { day: 'Thu', inbound: 1380, outbound: 2950, delivery_rate: 99.2, read_rate: 90.3 },
    { day: 'Fri', inbound: 1820, outbound: 4100, delivery_rate: 99.7, read_rate: 91.2 },
    { day: 'Sat', inbound: 980, outbound: 1800, delivery_rate: 99.8, read_rate: 92.0 },
    { day: 'Sun', inbound: 850, outbound: 1500, delivery_rate: 99.9, read_rate: 93.4 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics & WhatsApp Telemetry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time delivery performance, AI resolution efficiency, and WhatsApp quality metric history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1 rounded-md transition-all ${timeRange === '24h' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
            >
              24h
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-md transition-all ${timeRange === '7d' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-md transition-all ${timeRange === '30d' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
            >
              30 Days
            </button>
          </div>

          <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors">
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
            <span className="text-2xl font-extrabold text-slate-900">28,930</span>
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
              Read Rate: <strong className="text-slate-700">89.4%</strong>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Autonomous Solves</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900">74.2%</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Avg latency: <strong className="text-slate-700">1.2 seconds</strong>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quality Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-600">GREEN</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Block rate: <strong className="text-emerald-700">&lt;0.12%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Inbound vs Outbound Area Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Conversation Throughput</h3>
              <p className="text-xs text-slate-500">Inbound customer messages vs Outbound automations</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#128C7E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#128C7E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25D366" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#25D366" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="outbound" stroke="#128C7E" fillOpacity={1} fill="url(#colorOutbound)" name="Outbound" />
                <Area type="monotone" dataKey="inbound" stroke="#25D366" fillOpacity={1} fill="url(#colorInbound)" name="Inbound" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily Delivery vs Read Rate */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Delivery & Open Health</h3>
              <p className="text-xs text-slate-500">Percentage delivered vs read over the week</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="delivery_rate" stroke="#25D366" strokeWidth={2.5} name="Delivery %" />
                <Line type="monotone" dataKey="read_rate" stroke="#0284c7" strokeWidth={2} name="Read %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
