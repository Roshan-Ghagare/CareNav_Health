import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  FileCheck2,
  Calendar,
  Clock,
  ClipboardList,
  History,
  CheckSquare,
  Settings,
  ShieldCheck,
  ChevronRight,
  Bot
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { facts, briefings, followups, documents, currentUser } = useApp();

  const pendingReviewsCount = facts.filter(f => f.requiresHumanReview && f.reviewStatus === 'PENDING').length;
  const draftBriefingsCount = briefings.filter(b => b.status === 'DRAFT').length;
  const pendingFollowupsCount = followups.filter(f => f.status === 'PENDING').length;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Gemini Copilot', icon: Bot, tag: 'AI' },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'evidence', label: 'Evidence Center', icon: FileCheck2 },
    { id: 'timeline', label: 'Patient Timeline', icon: Clock },
    { id: 'appointments', label: 'Appointments & Prep', icon: Calendar },
    { id: 'followups', label: 'Follow-ups', icon: ClipboardList, count: pendingFollowupsCount },
    { id: 'briefings', label: 'Doctor Briefings', icon: ShieldCheck, count: draftBriefingsCount },
    { id: 'reviews', label: 'Human Review Queue', icon: CheckSquare, count: pendingReviewsCount },
    { id: 'audit-logs', label: 'Audit Trail', icon: History },
    { id: 'settings', label: 'System & RBAC', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-65px)]">
      <div className="p-4 border-b border-slate-100">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Active Environment
        </div>
        <div className="flex items-center justify-between text-xs text-slate-700">
          <span className="font-semibold text-slate-900">Care Navigation Hub</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-teal-50 text-teal-800 border border-teal-200">
            v2.4 Core
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-slate-800 text-teal-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.count}
                </span>
              )}
              {item.tag && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-teal-900 text-teal-300' : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}
                >
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Current User</div>
        <div className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</div>
        <div className="text-[11px] text-slate-500 truncate">{currentUser.title}</div>
        <div className="mt-2 text-[11px] text-slate-400">
          Role: <strong className="text-slate-700">{currentUser.role.replace('_', ' ')}</strong>
        </div>
      </div>
    </aside>
  );
};
