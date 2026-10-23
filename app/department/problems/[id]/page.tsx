'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  IndianRupee, 
  Play, 
  Sparkles, 
  Clock, 
  Tag, 
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { 
  getProblemById, 
  getApplicationsForProblem, 
  selectApplicantAndStartPilot,
  Problem,
  Application
} from '@/lib/departmentStore';

export default function ApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const problemId = params?.id as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state for Starting Pilot
  const [selectedAppForPilot, setSelectedAppForPilot] = useState<Application | null>(null);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-12-25');
  const [pilotBudget, setPilotBudget] = useState('1420000');
  const [isStartingPilot, setIsStartingPilot] = useState(false);

  // Default Pilot Milestones to instantiate
  const [milestones, setMilestones] = useState([
    {
      title: 'Sensor Grid Calibration & Baseline Acoustic Mapping',
      target: 'Deploy and calibrate 25 acoustic telemetry nodes across 10km network; establish baseline within 14 days.',
      dueDate: '2026-11-10',
    },
    {
      title: 'Edge ML Anomaly Classification & False-Positive Suppression',
      target: 'Demonstrate false-positive alarm rate below 5% under variable nocturnal and diurnal pump pressure.',
      dueDate: '2026-11-25',
    },
    {
      title: 'Municipal GIS Integration & Auto-Workorder Dispatch',
      target: 'Dispatch GPS incident coordinates directly into Jal Board GIS portal within 10 seconds of acoustic burst verification.',
      dueDate: '2026-12-08',
    },
    {
      title: 'Leakage Localization & Turnaround Time Reduction',
      target: 'Pinpoint simulated and natural leaks within 5 meters; reduce mean detection-to-repair turnaround time by >= 30%.',
      dueDate: '2026-12-20',
    },
  ]);

  const loadData = () => {
    if (!problemId) return;
    const p = getProblemById(problemId);
    if (p) {
      setProblem(p);
      setPilotBudget(String(p.budget_cap));
      const apps = getApplicationsForProblem(problemId);
      setApplications(apps);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [problemId]);

  const handleOpenPilotModal = (app: Application) => {
    setSelectedAppForPilot(app);
    setPilotBudget(String(app.proposed_budget || problem?.budget_cap || 1400000));
  };

  const handleConfirmStartPilot = async () => {
    if (!selectedAppForPilot || !problem) return;

    const budgetNum = Number(pilotBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      showToast('Please enter a valid pilot budget.', 'error');
      return;
    }

    if (budgetNum > problem.budget_cap) {
      showToast(
        `Pilot budget cannot exceed problem cap of ₹${problem.budget_cap.toLocaleString('en-IN')}`,
        'error'
      );
      return;
    }

    setIsStartingPilot(true);

    try {
      // 1. Select applicant & start pilot via departmentStore
      const { pilot, updatedProblem } = selectApplicantAndStartPilot({
        applicationId: selectedAppForPilot.id,
        startDate,
        endDate,
        pilotBudget: budgetNum,
        milestones,
      });

      // 2. Also attempt API call for backend sync
      try {
        await fetch(`/api/applications/${selectedAppForPilot.id}/select`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate,
            endDate,
            pilotBudget: budgetNum,
            milestones,
          }),
        });
      } catch (e) {
        // Fallback gracefully
      }

      showToast(
        `Pilot initiated with ${selectedAppForPilot.startup?.name}! Problem status updated to IN PILOT.`,
        'success'
      );

      setSelectedAppForPilot(null);
      loadData();

      // Redirect directly to the new Pilot Tracker screen
      setTimeout(() => {
        router.push(`/department/pilots/${pilot.id}`);
      }, 700);
    } catch (err: any) {
      showToast(err?.message || 'Failed to start pilot', 'error');
      setIsStartingPilot(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="space-y-4">
        <Link
          href="/department/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <EmptyState
          title="Problem Challenge Not Found"
          description="The requested department challenge does not exist or may have been deleted."
          actionText="Go to Dashboard"
          actionHref="/department/dashboard"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/department/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Department Command Center</span>
        </Link>

        {problem.status === 'in_pilot' && problem.active_pilot_id && (
          <Link
            href={`/department/pilots/${problem.active_pilot_id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Open Active Pilot Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Problem Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={problem.status} size="md" />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {problem.sector}
            </span>
            <span className="text-xs text-slate-500">
              ID: <strong className="font-mono text-slate-400">{problem.id}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-slate-400">
              Budget Cap: <strong className="text-emerald-400 font-mono text-sm">₹{problem.budget_cap.toLocaleString('en-IN')}</strong>
            </div>
            <div className="text-slate-400">
              Deadline: <strong className="text-white">{problem.deadline}</strong>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {problem.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            {problem.description}
          </p>
        </div>
      </div>

      {/* Applications Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Startup Proposals ({applications.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate DPIIT-registered startups. Selecting one candidate commissions the live pilot trial and marks remaining applicants as not selected.
          </p>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <EmptyState
          title="No Startup Proposals Submitted Yet"
          description="Verified startups in the Water & Sanitation sector have been notified and can submit short pitches under the open challenge."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {applications.map((app) => {
            const isSelected = app.status === 'selected';
            const isRejected = app.status === 'rejected';
            const isVerified = app.startup?.verified ?? true;

            return (
              <div
                key={app.id}
                className={`glass-panel p-6 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500/40 bg-emerald-950/15 shadow-lg shadow-emerald-950/20'
                    : isRejected
                    ? 'border-slate-800/60 bg-slate-900/30 opacity-75'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="space-y-3 flex-1">
                    {/* Startup Badges */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {app.startup?.name}
                      </h3>

                      {isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>DPIIT {app.startup?.dpiit_id}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Unverified Startup</span>
                        </span>
                      )}

                      <StatusBadge status={app.status} size="sm" />
                    </div>

                    {/* Startup Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span>Founder: <strong className="text-slate-200">{app.startup?.founder || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Domain: <strong className="text-slate-200">{app.startup?.sector}</strong></span>
                      <span>•</span>
                      <span>Applied: <strong className="text-slate-200">{new Date(app.created_at).toLocaleDateString('en-IN')}</strong></span>
                    </div>

                    {/* Pitch */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                        Technical Proposal & Deployment Pitch:
                      </div>
                      <p>{app.pitch}</p>
                    </div>

                    {/* Financial & Timeline Metrics */}
                    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Proposed Pilot Budget: <strong className="text-emerald-400 font-mono">₹{app.proposed_budget.toLocaleString('en-IN')}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Trial Duration: <strong className="text-white">{app.pilot_timeline_weeks} Weeks</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-end gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {isSelected ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4" /> Pilot Commissioned
                        </span>
                        {problem.active_pilot_id && (
                          <Link
                            href={`/department/pilots/${problem.active_pilot_id}`}
                            className="text-xs text-purple-400 hover:text-purple-300 underline font-medium flex items-center gap-1"
                          >
                            <span>Go to Pilot Tracker</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ) : isRejected ? (
                      <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                        Proposal Not Selected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenPilotModal(app)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/25 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Pilot with Startup</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: START PILOT CONFIGURATION */}
      {selectedAppForPilot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 p-6 sm:p-8 space-y-5 bg-slate-950 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Section 4.1 F6 • Commission Trial Pilot</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Launch Pilot with {selectedAppForPilot.startup?.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Confirm the pilot budget, milestone benchmarks, and trial period.
                </p>
              </div>
              <button
                onClick={() => setSelectedAppForPilot(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            {/* Config Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Pilot Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Pilot End Date (Deadline)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Authorized Pilot Budget (INR)</span>
                  <span className="text-[11px] text-slate-500">Cap: ₹{problem.budget_cap.toLocaleString('en-IN')}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    max={problem.budget_cap}
                    value={pilotBudget}
                    onChange={(e) => setPilotBudget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Preconfigured Milestones Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span>Trial Milestones ({milestones.length})</span>
                <span className="text-[11px] text-indigo-400">Section 10 Criteria Enforced</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span>M{idx + 1}: {m.title}</span>
                      <span className="text-slate-400 text-[11px]">{m.dueDate}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{m.target}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Note */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                Confirming will set application to <strong>selected</strong>, mark other applicants as <strong>rejected</strong>, transition problem to <strong>in_pilot</strong>, and launch the active Pilot Tracker.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAppForPilot(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isStartingPilot}
                onClick={handleConfirmStartPilot}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {isStartingPilot ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Commissioning Pilot...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Confirm & Launch Pilot</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
