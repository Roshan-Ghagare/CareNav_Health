import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { ScheduleFollowupModal } from '../components/ScheduleFollowupModal';
import { RequestLabRecordsModal } from '../components/RequestLabRecordsModal';
import {
  Users,
  FileText,
  Calendar,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Activity,
  CalendarPlus,
  FileSearch,
  Zap,
  Check,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area
} from 'recharts';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab, onOpenUpload }) => {
  const {
    patients,
    selectedPatient,
    documents,
    facts,
    appointments,
    followups,
    briefings,
    openEvidenceModal,
    currentUser,
    generateBriefingForPatient
  } = useApp();

  const [throughputMetric, setThroughputMetric] = useState<'daily' | 'cumulative'>('daily');
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [isRequestLabModalOpen, setIsRequestLabModalOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [actionNotice, setActionNotice] = useState<{
    title: string;
    message: string;
    actionTab?: string;
    actionLabel?: string;
  } | null>(null);

  const handleGeneratePatientSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      await generateBriefingForPatient(selectedPatient.id);
      setActionNotice({
        title: 'Patient Care Briefing Synthesized',
        message: `Doctor Briefing Agent compiled an evidence-backed summary for ${selectedPatient.name}. Awaiting clinician review.`,
        actionTab: 'briefings',
        actionLabel: 'View Doctor Briefing'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Metrics
  const totalPatients = patients.length;
  const patientDocs = documents.filter(d => d.patientId === selectedPatient.id);
  const patientFacts = facts.filter(f => f.patientId === selectedPatient.id);
  const upcomingApts = appointments.filter(a => a.patientId === selectedPatient.id && a.status === 'UPCOMING');
  const pendingFollowups = followups.filter(f => f.patientId === selectedPatient.id && f.status === 'PENDING');
  const missingRecords = patientFacts.filter(f => f.status === 'MISSING');
  const itemsRequiringReview = patientFacts.filter(f => f.requiresHumanReview && f.reviewStatus === 'PENDING');

  // 30-Day Throughput Timeline Generation
  const throughputData = useMemo(() => {
    const data = [];
    const today = new Date('2026-10-01T00:00:00');

    // Count user documents by date
    const countMap: Record<string, number> = {};
    documents.forEach(doc => {
      const dStr = doc.documentDate || doc.uploadDate;
      if (dStr) {
        countMap[dStr] = (countMap[dStr] || 0) + 1;
      }
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const shortLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Document intake on this date
      const actualDocs = countMap[isoDate] || 0;

      // Realistic intake distribution across clinic records for days in the 30-day window
      let clinicActivity = 0;
      const dayOfMonth = d.getDate();
      const month = d.getMonth();
      if (month === 8) { // September 2026
        if ([10, 12, 15, 20, 25, 28].includes(dayOfMonth)) {
          clinicActivity = (dayOfMonth % 3) + 1;
        } else if (dayOfMonth % 5 === 0) {
          clinicActivity = 1;
        }
      } else if (month === 9 && dayOfMonth === 1) { // October 1, 2026
        clinicActivity = 2;
      }

      const totalCount = actualDocs + clinicActivity;
      data.push({
        date: isoDate,
        label: shortLabel,
        processed: totalCount,
        cumulative: 0
      });
    }

    let runningTotal = 0;
    data.forEach(item => {
      runningTotal += item.processed;
      item.cumulative = runningTotal;
    });

    return data;
  }, [documents]);

  const total30DayProcessed = useMemo(() => {
    return throughputData.reduce((acc, curr) => acc + curr.processed, 0);
  }, [throughputData]);

  const avgDailyThroughput = (total30DayProcessed / 30).toFixed(1);

  // Chart data: Evidence Classification
  const evidenceDistribution = [
    { name: 'FACT', count: patientFacts.filter(f => f.status === 'FACT').length, color: '#0d9488' }, // teal-600
    { name: 'UNCERTAIN', count: patientFacts.filter(f => f.status === 'UNCERTAIN').length, color: '#d97706' }, // amber-600
    { name: 'MISSING', count: patientFacts.filter(f => f.status === 'MISSING').length, color: '#e11d48' }, // rose-600
    { name: 'ASSUMPTION', count: patientFacts.filter(f => f.status === 'ASSUMPTION').length, color: '#6366f1' }, // indigo-500
  ];

  // Chart data: Document Types
  const docTypeData = [
    { type: 'Labs', count: patientDocs.filter(d => d.documentType === 'LAB_REPORT').length },
    { type: 'Notes', count: patientDocs.filter(d => d.documentType === 'CLINICAL_NOTE').length },
    { type: 'Prescriptions', count: patientDocs.filter(d => d.documentType === 'PRESCRIPTION').length },
    { type: 'Appts', count: patientDocs.filter(d => d.documentType === 'APPOINTMENT').length },
    { type: 'Referrals', count: patientDocs.filter(d => d.documentType === 'REFERRAL').length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Care Navigation Workspace</span>
            <span aria-hidden="true">·</span>
            <span>Active Record: <strong className="text-slate-900">{selectedPatient.name}</strong></span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{selectedPatient.patientIdentifier}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Care Coordination & Evidence Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Organizing fragmented health records into an evidence-audited clinical care timeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('evidence')}
            className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-teal-700" />
            Inspect Evidence
          </button>
          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            + Upload Document
          </button>
        </div>
      </div>

      {/* Action Notification Alert Banner */}
      {actionNotice && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-start justify-between gap-3 text-xs text-teal-950 shadow-xs">
          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-teal-900">{actionNotice.title}</div>
              <div className="text-teal-800 mt-0.5">{actionNotice.message}</div>
              {actionNotice.actionTab && (
                <button
                  onClick={() => {
                    setActiveTab(actionNotice.actionTab!);
                    setActionNotice(null);
                  }}
                  className="mt-2 text-xs font-bold text-teal-800 underline hover:text-teal-950 flex items-center gap-1"
                >
                  <span>{actionNotice.actionLabel || 'View Record'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-teal-700 hover:text-teal-950 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-amber-50 text-amber-700 rounded">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Quick Actions & Rapid Task Management
              </h2>
              <p className="text-[11px] text-slate-500">
                Direct administrative coordination triggers for <strong className="text-slate-700">{selectedPatient.name}</strong>
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Active Role: <strong className="text-slate-700">{currentUser.title || currentUser.role.replace('_', ' ')}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action 1: Schedule Follow-up */}
          <button
            type="button"
            onClick={() => setIsFollowupModalOpen(true)}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-teal-50/50 hover:border-teal-300 text-left transition-all group flex items-start gap-3"
          >
            <div className="p-2 bg-teal-100/70 text-teal-800 rounded-lg shrink-0 group-hover:bg-teal-200/80 transition-colors">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 group-hover:text-teal-900 flex items-center justify-between">
                <span>Schedule Follow-up</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-700 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Set pharmacy sync, lab draw, or administrative check-in dates.
              </p>
            </div>
          </button>

          {/* Action 2: Request Lab Records */}
          <button
            type="button"
            onClick={() => setIsRequestLabModalOpen(true)}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-sky-50/50 hover:border-sky-300 text-left transition-all group flex items-start gap-3"
          >
            <div className="p-2 bg-sky-100/70 text-sky-800 rounded-lg shrink-0 group-hover:bg-sky-200/80 transition-colors">
              <FileSearch className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 group-hover:text-sky-900 flex items-center justify-between">
                <span>Request Lab Records</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-sky-700 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Initiate record requests to diagnostic labs and archives.
              </p>
            </div>
          </button>

          {/* Action 3: Generate Patient Summary */}
          <button
            type="button"
            onClick={handleGeneratePatientSummary}
            disabled={isGeneratingSummary}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-300 text-left transition-all group flex items-start gap-3 disabled:opacity-50"
          >
            <div className="p-2 bg-indigo-100/70 text-indigo-800 rounded-lg shrink-0 group-hover:bg-indigo-200/80 transition-colors">
              <Sparkles className={`w-4 h-4 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 flex items-center justify-between">
                <span>{isGeneratingSummary ? 'Synthesizing...' : 'Generate Patient Summary'}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Briefing Agent synthesizes an evidence-backed care summary.
              </p>
            </div>
          </button>

          {/* Action 4: Review Appointment Preparation */}
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-300 text-left transition-all group flex items-start gap-3"
          >
            <div className="p-2 bg-emerald-100/70 text-emerald-800 rounded-lg shrink-0 group-hover:bg-emerald-200/80 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 flex items-center justify-between">
                <span>Appointment Prep</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Review verified documents and missing records before visit.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Primary Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Patients</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">{totalPatients}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active in registry</div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Documents</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">{patientDocs.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Processed by AI agents</div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Upcoming Appts</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-700">{upcomingApts.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Prepped checklists</div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Pending Follow-ups</span>
            <ClipboardList className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">{pendingFollowups.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Administrative tasks</div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Missing Records</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">{missingRecords.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Administrative gaps</div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Review Queue</span>
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-700">{itemsRequiringReview.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Human-in-the-Loop</div>
        </div>
      </div>

      {/* 30-Day Document Intake & Processing Throughput Line Chart */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Processed Documents Throughput (Last 30 Days)
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-teal-50 text-teal-800 border border-teal-200">
                  AI Intake Velocity
                </span>
              </div>
              <p className="text-xs text-slate-500">
                At-a-glance volume of healthcare documents ingested, parsed, and evidence-audited across the care network.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Summary statistics */}
            <div className="hidden md:flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-sans">30-Day Total</span>
                <span className="font-bold text-slate-900 tabular-nums">{total30DayProcessed} docs</span>
              </div>
              <div className="text-right border-l border-slate-200 pl-4">
                <span className="text-[11px] text-slate-400 block font-sans">Daily Average</span>
                <span className="font-bold text-teal-700 tabular-nums">{avgDailyThroughput} / day</span>
              </div>
            </div>

            {/* Segmented control for Daily vs Cumulative */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setThroughputMetric('daily')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  throughputMetric === 'daily'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily Intake
              </button>
              <button
                type="button"
                onClick={() => setThroughputMetric('cumulative')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  throughputMetric === 'cumulative'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cumulative
              </button>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={throughputData}
              margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
            >
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={4}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 text-white rounded-lg shadow-xl border border-slate-800 text-xs space-y-1">
                        <div className="text-[11px] text-slate-400 font-mono">
                          {dataPoint.date} ({dataPoint.label})
                        </div>
                        <div className="font-semibold text-teal-400 flex items-center gap-1.5">
                          <span>Processed Documents:</span>
                          <span className="font-mono text-sm tabular-nums text-white">
                            {dataPoint.processed}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Cumulative 30-Day: <strong className="font-mono text-white tabular-nums">{dataPoint.cumulative}</strong> docs
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey={throughputMetric === 'daily' ? 'processed' : 'cumulative'}
                name={throughputMetric === 'daily' ? 'Daily Documents Processed' : 'Cumulative Documents'}
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0d9488', strokeWidth: 1, stroke: '#ffffff' }}
                activeDot={{ r: 5, fill: '#0f766e', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Evidence Classification Breakdown */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Evidence & Uncertainty Breakdown</h2>
              <p className="text-xs text-slate-500">Every extracted claim audited by Evidence Agent</p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-600">
              {patientFacts.length} Total Claims
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={evidenceDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {evidenceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val, entry: any) => (
                    <span className="text-xs text-slate-700 font-medium ml-1">
                      {val} ({entry.payload.count})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Intake Distribution */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Document Intake by Type</h2>
              <p className="text-xs text-slate-500">Categorized by Document Agent</p>
            </div>
            <button
              onClick={() => setActiveTab('documents')}
              className="text-xs font-medium text-teal-700 hover:text-teal-900"
            >
              View Documents &rarr;
            </button>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={docTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Section: Immediate Coordination Action & Recent Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Next Scheduled Appointment & Administrative Prep */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              <h2 className="text-sm font-semibold text-slate-900">Immediate Appointment Coordination</h2>
            </div>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium"
            >
              Full Checklist &rarr;
            </button>
          </div>

          {upcomingApts.length > 0 ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide">
                      {upcomingApts[0].department}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {upcomingApts[0].doctorName}
                    </h3>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                      <span>{upcomingApts[0].appointmentDate} at {upcomingApts[0].appointmentTime}</span>
                      <span>{upcomingApts[0].location}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-teal-50 text-teal-800 border border-teal-200">
                    CONFIRMED
                  </span>
                </div>

                {/* Prep checklist preview */}
                <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Administrative Prep Checklist:</div>
                  <div className="space-y-1 text-xs text-slate-600">
                    {upcomingApts[0].preparationChecklist.preparationSteps.slice(0, 2).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  {upcomingApts[0].preparationChecklist.potentiallyMissing.length > 0 && (
                    <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Administrative Notice: </span>
                        {upcomingApts[0].preparationChecklist.potentiallyMissing[0]}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">No scheduled appointments.</div>
          )}
        </div>

        {/* Recent Extracted Facts & Evidence Links */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-teal-700" />
              <h2 className="text-sm font-semibold text-slate-900">Recent Extracted Evidence Items</h2>
            </div>
            <button
              onClick={() => setActiveTab('evidence')}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium"
            >
              All Facts &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {patientFacts.slice(0, 4).map(fact => (
              <div
                key={fact.id}
                className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <EvidenceBadge status={fact.status} confidence={fact.confidence} />
                    <span className="text-[11px] text-slate-400 font-mono truncate">
                      {fact.sourceDocumentName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium truncate">
                    {fact.information}
                  </p>
                </div>
                <button
                  onClick={() => openEvidenceModal(fact)}
                  className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-white border border-teal-200 rounded hover:bg-teal-50 shrink-0 transition-colors"
                >
                  View Evidence
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Quick Action Modals */}
      <ScheduleFollowupModal
        isOpen={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        onSuccess={() => {
          setActionNotice({
            title: 'Administrative Follow-up Scheduled',
            message: `New task assigned and queued for tracking. View under Follow-ups tab.`,
            actionTab: 'followups',
            actionLabel: 'View Follow-ups'
          });
        }}
      />

      <RequestLabRecordsModal
        isOpen={isRequestLabModalOpen}
        onClose={() => setIsRequestLabModalOpen(false)}
        onSuccess={(details) => {
          setActionNotice({
            title: 'Records Retrieval Dispatched',
            message: details,
            actionTab: 'followups',
            actionLabel: 'Track Status in Follow-ups'
          });
        }}
      />
    </div>
  );
};
