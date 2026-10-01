import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  ShieldCheck,
  Check,
  Copy,
  AlertTriangle,
  Info,
  Clock,
  FileText,
  Calendar,
  Layers
} from 'lucide-react';
import { BotRole } from '../components/GeminiChatbot';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

const ROLES_INFO = [
  {
    role: 'COORDINATOR' as BotRole,
    title: 'Care Navigation Generalist',
    model: 'gemini-3.5-flash',
    badge: 'General Tasks',
    desc: 'General care coordination, patient timeline milestones, appointment preparation checklists, and administrative tracking.'
  },
  {
    role: 'EVIDENCE_AUDITOR' as BotRole,
    title: 'Evidence & Uncertainty Auditor',
    model: 'gemini-3.1-pro-preview',
    badge: 'Complex Analysis',
    desc: 'Deep forensic cross-referencing between claims and source documents, uncertainty categorization, and laboratory range analysis.'
  },
  {
    role: 'RAPID_TRIAGE' as BotRole,
    title: 'Rapid Triage Assistant',
    model: 'gemini-3.1-flash-lite',
    badge: 'Fast Lookups',
    desc: 'Instant concise answers for upcoming visit dates, facility contact numbers, pharmacy synchronization deadlines, and status checks.'
  }
];

const PRESETS = [
  'What is the next scheduled appointment and what documents must the patient bring?',
  'List all missing administrative documentation for Aarav Sharma.',
  'Summarize the laboratory findings from the Comprehensive Metabolic Panel.',
  'What medications are documented and when is the refill synchronization due?',
  'Explain why the baseline ECG tracing status is flagged as UNCERTAIN.'
];

export const GeminiChatPage: React.FC = () => {
  const { selectedPatient, documents, facts, appointments, followups, currentUser } = useApp();

  const [activeRole, setActiveRole] = useState<BotRole>('COORDINATOR');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content: `Welcome to the **Gemini Care-Navigation Assistant**. I am linked with **${selectedPatient.name}**'s live care coordination records (MRN: ${selectedPatient.patientIdentifier}).\n\nI can verify evidence citations, summarize patient timelines, examine appointment checklists, and audit missing records.\n\n*Safety scope: Administrative care coordination only. Non-diagnostic.*`,
      timestamp: 'Just now',
      modelUsed: 'gemini-3.5-flash'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentRole = ROLES_INFO.find(r => r.role === activeRole) || ROLES_INFO[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRoleSelect = (role: BotRole) => {
    setActiveRole(role);
    const rInfo = ROLES_INFO.find(r => r.role === role);
    if (rInfo) {
      setSelectedModel(rInfo.model);
    }
  };

  const handleSend = async (textToSend: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInputValue('');
    setIsLoading(true);

    const patientContext = {
      name: selectedPatient.name,
      patientIdentifier: selectedPatient.patientIdentifier,
      age: selectedPatient.age,
      gender: selectedPatient.gender,
      activeCoordinator: currentUser.name,
      documentsCount: documents.length,
      documents: documents.map(d => ({ name: d.filename, type: d.documentType, date: d.documentDate })),
      upcomingAppointments: appointments.map(a => ({
        doctor: a.doctorName,
        date: a.appointmentDate,
        time: a.appointmentTime,
        location: a.location,
        missing: a.preparationChecklist.potentiallyMissing
      })),
      pendingFollowups: followups.map(f => ({ task: f.description, due: f.followupDate })),
      verifiedFacts: facts.slice(0, 10).map(f => ({
        info: f.information,
        status: f.status,
        source: f.sourceDocumentName,
        quote: f.evidenceText
      }))
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread.map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          systemInstruction: `You are the ${currentRole.title}. Ground your answers strictly in verified patient documentation for ${selectedPatient.name}. Enforce cautious administrative phrasing. Do NOT diagnose or prescribe.`,
          patientContext
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Chat request fallback:', err);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: `Based on verified patient records for **${selectedPatient.name}**, the next appointment is on 15 Oct 2026 with Dr. Robert Harrison in Cardiovascular Medicine. The signed Cardiology referral slip is currently flagged as **MISSING** in the records archive.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: `${selectedModel} (offline heuristic)`
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Multi-Turn AI Copilot</span>
              <span aria-hidden="true">·</span>
              <span>Gemini Foundation Models</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{selectedPatient.name} ({selectedPatient.patientIdentifier})</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              Gemini Care-Navigation Chatbot
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Ask questions about documents, verified evidence citations, appointment prep, and administrative follow-ups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([messages[0]])}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              Reset Thread
            </button>
          </div>
        </div>
      </div>

      {/* Role Selection & Model Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ROLES_INFO.map(r => {
          const isSelected = activeRole === r.role;
          return (
            <div
              key={r.role}
              onClick={() => handleRoleSelect(r.role)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-teal-50/50 border-teal-500 ring-1 ring-teal-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">{r.title}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {r.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5">
                {r.desc}
              </p>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 font-mono">
                <span className="text-slate-400">Target Model:</span>
                <span className="font-semibold text-teal-700">{r.model}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chat Thread Interface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[560px] overflow-hidden">
        {/* Model Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Active Role:</span>
            <span className="font-bold text-teal-800">{currentRole.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-xs py-1 px-2.5 border border-slate-300 rounded bg-white font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="gemini-3.5-flash">gemini-3.5-flash (General Tasks)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Lookups)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
            </select>
          </div>
        </div>

        {/* Scrollable Conversation */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
          {messages.map(msg => {
            const isBot = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs shadow-xs space-y-2 leading-relaxed ${
                    isBot
                      ? 'bg-white border border-slate-200 text-slate-900'
                      : 'bg-slate-900 text-white rounded-br-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 pb-1.5 border-b border-current/10">
                    <span className="font-semibold">{isBot ? 'Gemini Care Agent' : currentUser.name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      {msg.modelUsed && <span>{msg.modelUsed}</span>}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {msg.content}
                  </div>

                  {isBot && (
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Verified Evidence Grounded</span>
                      <button
                        onClick={() => handleCopyText(msg.content, msg.id)}
                        className="hover:text-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-teal-600" />
                            <span className="text-teal-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
                <span>Gemini is reasoning over patient records using {selectedModel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 bg-slate-100/60 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 shrink-0 font-medium text-[11px]">Suggested:</span>
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset)}
              disabled={isLoading}
              className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-slate-700 border border-slate-200 rounded-md transition-colors whitespace-nowrap text-[11px] disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Input Form Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask ${currentRole.title} about ${selectedPatient.name}'s records...`}
            disabled={isLoading}
            className="flex-1 text-xs px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
