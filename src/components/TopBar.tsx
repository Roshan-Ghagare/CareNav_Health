import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Shield,
  Check,
  Sparkles,
  Search,
  X,
  FileText,
  Users,
  ArrowRight
} from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUploadModal: () => void;
  onOpenChat?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUploadModal,
  onOpenChat
}) => {
  const {
    currentUser,
    setCurrentUserRole,
    patients,
    selectedPatient,
    setSelectedPatientId,
    documents,
    mockAiMode,
    setMockAiMode
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K to open & focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsRoleDropdownOpen(false);
        setIsPatientDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to dismiss search results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time Filtered Patients
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.patientIdentifier.toLowerCase().includes(q) ||
      p.primaryFacility.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  // Real-time Filtered Documents
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return documents.filter(d =>
      d.filename.toLowerCase().includes(q) ||
      d.documentType.toLowerCase().includes(q) ||
      (d.fileContentText && d.fileContentText.toLowerCase().includes(q))
    );
  }, [documents, searchQuery]);

  const totalResultsCount = filteredPatients.length + filteredDocuments.length;

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSelectDocument = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('documents');
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'CARE_COORDINATOR', label: 'Care Coordinator', desc: 'Maya Patel, RN' },
    { role: 'CLINICIAN', label: 'Clinician / Attending', desc: 'Dr. Sarah Lin, MD' },
    { role: 'PATIENT', label: 'Patient Portal', desc: 'Aarav Sharma' },
    { role: 'ADMIN', label: 'Administrator', desc: 'David Foster' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 gap-3">
        {/* Zone 1: Wordmark & Patient Quick Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-sm font-bold tracking-tight text-slate-900 hover:text-teal-700 transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
            <span>CareNav Health</span>
          </button>

          {/* Quick patient selector */}
          <div className="relative ml-1 pl-3 border-l border-slate-200">
            <button
              onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
              className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors flex items-center gap-1.5"
            >
              <span className="text-slate-500 hidden sm:inline">Patient:</span>
              <strong className="text-slate-900">{selectedPatient.name}</strong>
              <span className="text-[11px] text-slate-500 font-mono hidden md:inline">({selectedPatient.patientIdentifier})</span>
            </button>

            {isPatientDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-40">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Patient Record
                </div>
                {patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPatientId(p.id);
                      setIsPatientDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      p.id === selectedPatient.id ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div>{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.patientIdentifier} · Age {p.age} · {p.activeDocumentsCount} Docs
                      </div>
                    </div>
                    {p.id === selectedPatient.id && <Check className="w-3.5 h-3.5 text-teal-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Global Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xs md:max-w-sm lg:max-w-md">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search patients, documents, MRN..."
              className="w-full text-xs pl-8 pr-16 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-teal-500 transition-all shadow-2xs"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          {/* Real-Time Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 max-h-96 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 overflow-y-auto">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
                <span>Search Results</span>
                <span className="font-mono text-slate-500">{totalResultsCount} found</span>
              </div>

              {totalResultsCount === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No patients or documents matching "<span className="font-semibold text-slate-800">{searchQuery}</span>"
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Patients Group */}
                  {filteredPatients.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[10px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50/50 flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-teal-600" />
                        <span>Patients ({filteredPatients.length})</span>
                      </div>
                      {filteredPatients.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectPatient(p.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {p.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 group-hover:text-teal-700 truncate">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                MRN: {p.patientIdentifier} · Age {p.age} · {p.primaryFacility}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Documents Group */}
                  {filteredDocuments.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[10px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50/50 flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-teal-600" />
                        <span>Documents ({filteredDocuments.length})</span>
                      </div>
                      {filteredDocuments.map(d => {
                        const ownerPatient = patients.find(p => p.id === d.patientId);
                        return (
                          <button
                            key={d.id}
                            onClick={() => handleSelectDocument(d.patientId)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-slate-900 group-hover:text-teal-700 truncate flex items-center gap-1.5">
                                  <span>{d.filename}</span>
                                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                    {d.documentType}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono truncate">
                                  Patient: {ownerPatient ? ownerPatient.name : 'Unknown'} · {d.documentDate || d.uploadDate}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links (Visible on large screens) */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-600 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors hover:text-slate-900 ${activeTab === 'dashboard' ? 'text-teal-700 font-semibold underline underline-offset-4' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`transition-colors hover:text-slate-900 ${activeTab === 'documents' ? 'text-teal-700 font-semibold underline underline-offset-4' : ''}`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`transition-colors hover:text-slate-900 ${activeTab === 'evidence' ? 'text-teal-700 font-semibold underline underline-offset-4' : ''}`}
          >
            Evidence Center
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`transition-colors hover:text-slate-900 ${activeTab === 'timeline' ? 'text-teal-700 font-semibold underline underline-offset-4' : ''}`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`transition-colors hover:text-slate-900 ${activeTab === 'appointments' ? 'text-teal-700 font-semibold underline underline-offset-4' : ''}`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('briefings')}
            className={`transition-colors hover:text-slate-900 ${activeTab === 'briefings' ? 'text-teal-700 font-semibold underline underline-offset-4' : ''}`}
          >
            Briefings
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-teal-300 shadow-xs transition-colors"
              title="Open Gemini AI Chat Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Copilot</span>
            </button>
          )}

          {/* AI Mode Indicator */}
          <button
            onClick={() => setMockAiMode(!mockAiMode)}
            title={mockAiMode ? 'Mock AI mode is ON (deterministic synthetic reasoning)' : 'Live AI mode'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-mono text-[11px]">{mockAiMode ? 'Mock: ON' : 'Live AI'}</span>
          </button>

          {/* Role selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-semibold text-slate-900 hidden sm:inline">{currentUser.name}</span>
              <span className="text-[11px] text-slate-500 hidden md:inline">({currentUser.role.replace('_', ' ')})</span>
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-40">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Role (RBAC)
                </div>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setCurrentUserRole(r.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      r.role === currentUser.role ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{r.label}</div>
                      <div className="text-[11px] text-slate-400">{r.desc}</div>
                    </div>
                    {r.role === currentUser.role && <Check className="w-3.5 h-3.5 text-teal-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upload Document Primary Action */}
          <button
            onClick={onOpenUploadModal}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs"
          >
            Upload
          </button>
        </div>
      </div>
    </header>
  );
};
