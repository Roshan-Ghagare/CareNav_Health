import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { SafetyNoticeBanner } from './components/SafetyNoticeBanner';
import { DemoWalkthroughBar } from './components/DemoWalkthroughBar';
import { EvidenceModal } from './components/EvidenceModal';
import { UploadDocumentModal } from './components/UploadDocumentModal';
import { AgentProgressModal } from './components/AgentProgressModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { EvidenceCenterPage } from './pages/EvidenceCenterPage';
import { TimelinePage } from './pages/TimelinePage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { FollowupsPage } from './pages/FollowupsPage';
import { DoctorBriefingsPage } from './pages/DoctorBriefingsPage';
import { HumanReviewQueuePage } from './pages/HumanReviewQueuePage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { GeminiChatPage } from './pages/GeminiChatPage';
import { GeminiChatbot } from './components/GeminiChatbot';
import { Sparkles, Bot } from 'lucide-react';

function AppContent() {
  const { selectedEvidenceFact, closeEvidenceModal } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            setActiveTab={setActiveTab}
            onOpenUpload={() => setIsUploadModalOpen(true)}
          />
        );
      case 'chat':
        return <GeminiChatPage />;
      case 'patients':
        return (
          <PatientsPage
            onOpenUpload={() => setIsUploadModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        );
      case 'documents':
        return (
          <DocumentsPage
            onOpenUpload={() => setIsUploadModalOpen(true)}
          />
        );
      case 'evidence':
        return <EvidenceCenterPage />;
      case 'timeline':
        return <TimelinePage />;
      case 'appointments':
        return <AppointmentsPage />;
      case 'followups':
        return <FollowupsPage />;
      case 'briefings':
        return <DoctorBriefingsPage />;
      case 'reviews':
        return <HumanReviewQueuePage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            setActiveTab={setActiveTab}
            onOpenUpload={() => setIsUploadModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Mandatory Safety & Regulatory Scope Banner */}
      <SafetyNoticeBanner />

      {/* 2. Interactive 15-Step Presentation Walkthrough Controller */}
      <DemoWalkthroughBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 3. Top Navigation Bar (Follows Top Bar Contract) */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenChat={() => setIsChatbotOpen(true)}
      />

      {/* 4. Core Application Workspace (Sidebar + Main Viewport) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Interactive Global Modals */}
      <EvidenceModal
        fact={selectedEvidenceFact}
        onClose={closeEvidenceModal}
      />

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <AgentProgressModal />

      {/* Floating Gemini Copilot Trigger Button */}
      {!isChatbotOpen && activeTab !== 'chat' && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-5 right-5 z-40 px-4 py-2.5 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2.5 border border-slate-700 hover:scale-105 group"
        >
          <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-xs font-bold tracking-tight">Gemini Copilot</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-900 text-teal-300">
            3.5
          </span>
        </button>
      )}

      {/* Gemini Multi-Turn Chatbot Drawer */}
      <GeminiChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
