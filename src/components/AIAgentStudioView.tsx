import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  FileText, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Play, 
  ShieldAlert, 
  Sliders, 
  Plus, 
  Trash2,
  Lock,
  FileCheck
} from 'lucide-react';
import { AIAgentConfig } from '../types';

export const AIAgentStudioView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'knowledge' | 'playground'>('playground');
  
  const [agentConfig, setAgentConfig] = useState<AIAgentConfig>({
    name: 'Amy',
    status: 'ACTIVE',
    persona: 'Helpful, courteous, short replies, fashion & apparel specialist',
    scope: 'Answer questions about product sizing, shipping timeframes, returns, and order status for Dressed Delights store.',
    languages: ['English', 'Spanish', 'Hindi'],
    banned_topics: ['Direct credit card numbers', 'Medical advice', 'Competitor product links', 'Political commentary'],
    confidence_threshold: 0.65,
    max_unclear_turns: 3,
    hand_off_to: 'Support Queue (John Doe)',
    operating_hours: '24/7 Automation',
    knowledge_files_count: 3,
    scope_tests_passed: true
  });

  // Simulator state
  const [testInput, setTestInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'user', text: 'Can I return a dress if it does not fit?' },
    { 
      sender: 'ai', 
      text: 'Yes, absolutely! We offer a 30-day hassle-free return window for unworn items with tags attached. You can generate a free return label via our portal.',
      confidence: 0.94,
      source: 'return_policy_v2.pdf (Chunk #3)'
    }
  ]);

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userMsg = testInput;
    setTestInput('');
    
    // Simulate RAG response
    const newAiMsg = {
      sender: 'ai',
      text: `Based on your Dressed Delights catalog, "${userMsg}" is handled according to your standard business policy. Standard shipping arrives within 3-5 business days across the continental US.`,
      confidence: 0.88,
      source: 'shipping_faq_2026.docx (Chunk #1)'
    };

    setChatLog(prev => [...prev, { sender: 'user', text: userMsg }, newAiMsg]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Subnav Tabs */}
      <div className="border-b border-slate-200 px-6 pt-4 flex items-center justify-between">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveSubTab('playground')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'playground'
                ? 'border-ai-600 text-ai-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Playground & Evaluation</span>
          </button>

          <button
            onClick={() => setActiveSubTab('config')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'config'
                ? 'border-ai-600 text-ai-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Persona & Guardrail Settings</span>
          </button>

          <button
            onClick={() => setActiveSubTab('knowledge')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'knowledge'
                ? 'border-ai-600 text-ai-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Knowledge Base & Vectors ({agentConfig.knowledge_files_count} documents)</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 pb-3">
          <span className="text-xs font-medium text-slate-500">Agent Status:</span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active on WhatsApp</span>
          </span>
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        
        {/* PLAYGROUND TAB */}
        {activeSubTab === 'playground' && (
          <div className="flex gap-6 h-full">
            {/* Left Simulator Chat */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-ai-600" />
                  <span className="text-xs font-bold text-slate-700">Simulate WhatsApp Customer Session</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Model: Gemini Flash / Claude Haiku Tier 1</span>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#E5DDD5]/20">
                {chatLog.map((c, i) => (
                  <div key={i} className={`flex flex-col ${c.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                      c.sender === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                    }`}>
                      <p>{c.text}</p>
                      {c.source && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-ai-600">
                          <span className="font-mono">Grounded: {c.source}</span>
                          <span className="font-bold">Confidence: {c.confidence}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Test Input Form */}
              <form onSubmit={handleTestSubmit} className="p-3 border-t border-slate-200 bg-white flex space-x-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Ask a customer question to test RAG grounding and guardrails..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-ai-500 outline-none"
                />
                <button
                  type="submit"
                  className="bg-ai-600 hover:bg-ai-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-colors flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Test</span>
                </button>
              </form>
            </div>

            {/* Right Evaluation & Scope Gate Panel */}
            <div className="w-80 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-sm shrink-0">
              <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold">Go-Live Gate Passed</div>
                  <div className="text-[10px] text-emerald-600">10 / 10 compliance scope tests verified</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Guardrail Verification</h4>
                
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg border flex items-center justify-between">
                    <span className="text-slate-600">PII Credit Card Block</span>
                    <span className="text-emerald-600 font-bold text-[10px]">ENFORCED</span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border flex items-center justify-between">
                    <span className="text-slate-600">Min Confidence Threshold</span>
                    <span className="font-mono text-slate-700 font-bold text-[10px]">≥ 0.65</span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border flex items-center justify-between">
                    <span className="text-slate-600">Max Unclear Turns</span>
                    <span className="font-mono text-slate-700 font-bold text-[10px]">3 turns</span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border flex items-center justify-between">
                    <span className="text-slate-600">Cross-Tenant Training</span>
                    <span className="text-emerald-600 font-bold text-[10px]">0% (BLOCKED)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors">
                  Run Full Evaluation Suite
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KNOWLEDGE TAB */}
        {activeSubTab === 'knowledge' && (
          <div className="space-y-6 max-w-4xl">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-white hover:border-ai-500 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-700">Drop PDF, DOCX, FAQ files or enter website URLs</div>
              <div className="text-[10px] text-slate-400 mt-1">Chunked at 600 tokens with pgvector embeddings</div>
            </div>

            {/* Ingested Documents List */}
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              <div className="p-3 bg-slate-50 text-xs font-bold text-slate-600 flex justify-between">
                <span>Document Source</span>
                <span>Vector Chunks</span>
              </div>

              <div className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-brand-600" />
                  <span className="font-medium text-slate-800">return_policy_v2.pdf</span>
                </div>
                <span className="font-mono text-slate-500">12 chunks • Synced</span>
              </div>

              <div className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-brand-600" />
                  <span className="font-medium text-slate-800">shipping_faq_2026.docx</span>
                </div>
                <span className="font-mono text-slate-500">8 chunks • Synced</span>
              </div>

              <div className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-brand-600" />
                  <span className="font-medium text-slate-800">catalogue_pricing_summer.csv</span>
                </div>
                <span className="font-mono text-slate-500">45 chunks • Synced</span>
              </div>
            </div>
          </div>
        )}

        {/* CONFIG TAB */}
        {activeSubTab === 'config' && (
          <div className="max-w-3xl space-y-4 bg-white p-6 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Agent Persona & Tone</label>
              <input
                type="text"
                value={agentConfig.persona}
                onChange={(e) => setAgentConfig({ ...agentConfig, persona: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-ai-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scope Definition (Strict Boundaries)</label>
              <textarea
                value={agentConfig.scope}
                onChange={(e) => setAgentConfig({ ...agentConfig, scope: e.target.value })}
                rows={3}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:border-ai-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prohibited Topics (Instant Hand-off or Refusal)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {agentConfig.banned_topics.map((t, idx) => (
                  <span key={idx} className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-md text-xs font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
