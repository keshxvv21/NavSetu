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
  Play, 
  Clock, 
  IndianRupee, 
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

  // Default Pilot Milestones
  const [milestones] = useState([
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
      const { pilot } = selectApplicantAndStartPilot({
        applicationId: selectedAppForPilot.id,
        startDate,
        endDate,
        pilotBudget: budgetNum,
        milestones,
      });

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
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="space-y-4">
        <Link
          href="/department/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/department/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Department Command Center</span>
        </Link>

        {problem.status === 'in_pilot' && problem.active_pilot_id && (
          <Link
            href={`/department/pilots/${problem.active_pilot_id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Open Active Pilot Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Problem Header Card */}
      <div className="gov-card p-6 sm:p-8 bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={problem.status} size="md" />
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
              {problem.sector}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ID: <strong className="font-mono text-slate-700">{problem.id}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="text-slate-600">
              Budget Cap: <strong className="text-emerald-800 font-mono text-sm font-bold">₹{problem.budget_cap.toLocaleString('en-IN')}</strong>
            </div>
            <div className="text-slate-600">
              Deadline: <strong className="text-slate-900 font-bold">{problem.deadline}</strong>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {problem.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed font-normal">
            {problem.description}
          </p>
        </div>
      </div>

      {/* Applications Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            <span>Startup Proposals ({applications.length})</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
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
                className={`gov-card p-6 bg-white border transition-all shadow-xs ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-50/20'
                    : isRejected
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="space-y-3 flex-1">
                    {/* Startup Badges */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {app.startup?.name}
                      </h3>

                      {isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>DPIIT {app.startup?.dpiit_id}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>Unverified Startup</span>
                        </span>
                      )}

                      <StatusBadge status={app.status} size="sm" />
                    </div>

                    {/* Startup Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                      <span>Founder: <strong className="text-slate-900">{app.startup?.founder || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Domain: <strong className="text-slate-900">{app.startup?.sector}</strong></span>
                      <span>•</span>
                      <span>Applied: <strong className="text-slate-900">{new Date(app.created_at).toLocaleDateString('en-IN')}</strong></span>
                    </div>

                    {/* Pitch */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800 mb-1">
                        Technical Proposal & Deployment Pitch:
                      </div>
                      <p>{app.pitch}</p>
                    </div>

                    {/* Financial & Timeline Metrics */}
                    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Proposed Pilot Budget: <strong className="text-emerald-800 font-mono font-bold">₹{app.proposed_budget.toLocaleString('en-IN')}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-700" />
                        <span>Trial Duration: <strong className="text-slate-900 font-bold">{app.pilot_timeline_weeks} Weeks</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-end gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                    {isSelected ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pilot Commissioned
                        </span>
                        {problem.active_pilot_id && (
                          <Link
                            href={`/department/pilots/${problem.active_pilot_id}`}
                            className="text-xs text-purple-700 hover:text-purple-900 underline font-bold flex items-center gap-1"
                          >
                            <span>Go to Pilot Tracker</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ) : isRejected ? (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        Proposal Not Selected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenPilotModal(app)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-xs transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-xl border border-slate-300 p-6 sm:p-8 space-y-5 bg-white shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Section 4.1 F6 • Commission Trial Pilot</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Launch Pilot with {selectedAppForPilot.startup?.name}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Confirm the pilot budget, milestone benchmarks, and trial period.
                </p>
              </div>
              <button
                onClick={() => setSelectedAppForPilot(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Config Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Pilot Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Pilot End Date (Deadline)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Authorized Pilot Budget (INR)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Cap: ₹{problem.budget_cap.toLocaleString('en-IN')}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs font-bold">₹</span>
                  <input
                    type="number"
                    max={problem.budget_cap}
                    value={pilotBudget}
                    onChange={(e) => setPilotBudget(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-4 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Preconfigured Milestones Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider">
                <span>Trial Milestones ({milestones.length})</span>
                <span className="text-[11px] text-blue-700">Section 10 Criteria Enforced</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1 font-medium"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>M{idx + 1}: {m.title}</span>
                      <span className="text-slate-600 text-[11px]">{m.dueDate}</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">{m.target}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Note */}
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                Confirming will set application to <strong>selected</strong>, mark other applicants as <strong>rejected</strong>, transition problem to <strong>in_pilot</strong>, and launch the active Pilot Tracker.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedAppForPilot(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isStartingPilot}
                onClick={handleConfirmStartPilot}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-xs disabled:opacity-50"
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
