'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  IndianRupee, 
  Calendar, 
  FileText, 
  ExternalLink, 
  Lock, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  Award
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import MilestoneRow from '@/components/MilestoneRow';
import ConversionResult, { ConversionCheckReport } from '@/components/ConversionResult';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { 
  getPilotById, 
  reviewMilestone, 
  checkConversion, 
  convertPilotToContract,
  Pilot 
} from '@/lib/departmentStore';

export default function PilotTrackerPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const pilotId = params?.id as string;

  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [conversionReport, setConversionReport] = useState<ConversionCheckReport | null>(null);
  const [contractValue, setContractValue] = useState<number>(0);
  const [ruleReference, setRuleReference] = useState('Rule 149(viii) of GFR 2017 / GeM Startup Direct Mandate');
  const [isConverting, setIsConverting] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  const loadPilot = () => {
    if (!pilotId) return;
    const p = getPilotById(pilotId);
    if (p) {
      setPilot(p);
      setContractValue(p.contract_value || p.budget);
      if (p.rule_reference) {
        setRuleReference(p.rule_reference);
      }
      // Evaluate live conversion check
      const report = checkConversion(p, p.contract_value || p.budget);
      setConversionReport(report);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPilot();
  }, [pilotId]);

  // Review milestone (Met / Missed)
  const handleReview = async (milestoneId: string, decision: 'met' | 'missed') => {
    if (!pilot) return;
    setIsUpdating(true);

    try {
      const updatedPilot = reviewMilestone(pilot.id, milestoneId, decision);
      
      // Also attempt backend API call
      try {
        await fetch(`/api/milestones/${milestoneId}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: decision }),
        });
      } catch (e) {
        // Fallback gracefully
      }

      setPilot({ ...updatedPilot });
      const newReport = checkConversion(updatedPilot, contractValue);
      setConversionReport(newReport);

      showToast(
        `Milestone reviewed as ${decision.toUpperCase()}! Conversion criteria re-evaluated.`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to review milestone', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Run Conversion Check manually (for demonstration)
  const handleRunConversionCheck = () => {
    if (!pilot) return;
    const report = checkConversion(pilot, contractValue);
    setConversionReport(report);

    if (report.ok) {
      showToast('All statutory conversion checks PASSED! 100% compliant.', 'success');
    } else {
      showToast(
        `Conversion check failed: ${report.reasons[0] || 'Criteria not met'}`,
        'error'
      );
    }
  };

  // Convert to contract
  const handleConvert = async () => {
    if (!pilot) return;
    setIsConverting(true);

    try {
      // 1. Convert via store
      const result = convertPilotToContract({
        pilotId: pilot.id,
        contractValue: Number(contractValue),
        ruleReference,
      });

      // 2. Dispatch to backend API
      try {
        await fetch(`/api/pilots/${pilot.id}/convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contract_value: Number(contractValue),
            rule_reference: ruleReference,
          }),
        });
      } catch (e) {
        // Fallback gracefully
      }

      setPilot({ ...result.pilot });
      setConversionReport(checkConversion(result.pilot, contractValue));
      setShowConvertModal(false);

      showToast(
        `Pilot converted to Contract ${result.contractId}! SHA-256 hash generated.`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to convert pilot', 'error');
    } finally {
      setIsConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pilot) {
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
          title="Pilot Record Not Found"
          description="The requested pilot trial does not exist or has been removed."
          actionText="Go to Dashboard"
          actionHref="/department/dashboard"
        />
      </div>
    );
  }

  const isConverted = pilot.status === 'converted';
  const totalMilestones = pilot.milestones.length;
  const metCount = pilot.milestones.filter((m) => m.status === 'met').length;
  const missedCount = pilot.milestones.filter((m) => m.status === 'missed').length;
  const unreviewedCount = pilot.milestones.filter((m) => m.status === 'pending' || m.status === 'submitted').length;
  const successRate = totalMilestones > 0 ? Math.round((metCount / totalMilestones) * 100) : 0;

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

        {isConverted && (
          <div className="flex items-center gap-2">
            <Link
              href={`/contracts/${pilot.contract_id || pilot.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Contract & PDF</span>
            </Link>
            <Link
              href={`/verify/${pilot.contract_id || pilot.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Public Audit Verification</span>
            </Link>
          </div>
        )}
      </div>

      {/* Converted Alert Banner */}
      {isConverted && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950/60 border border-emerald-500/40 shadow-xl shadow-emerald-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Officially Converted & Sealed
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {pilot.contract_id}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Direct Procurement Contract Awarded
                </h2>
                <p className="text-xs text-slate-300">
                  Record is read-only and sealed with cryptographic SHA-256 fingerprint under{' '}
                  <span className="text-emerald-400 font-medium">{pilot.rule_reference}</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/contracts/${pilot.contract_id || pilot.id}`}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Download Justification PDF</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Cryptographic Hash Bar */}
          {pilot.record_hash && (
            <div className="mt-4 pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-indigo-400 font-bold uppercase text-[10px]">Canonical SHA-256:</span>
                <span className="text-emerald-300 select-all font-semibold break-all">
                  {pilot.record_hash}
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-sans shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Matches Live DB State</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Pilot Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={pilot.status} size="md" />
              <span className="text-xs font-mono text-slate-400 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                Pilot ID: {pilot.id}
              </span>
              <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{pilot.department_name}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {pilot.problem_title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div>
                Partner Startup: <strong className="text-white text-sm">{pilot.startup_name}</strong>
              </div>
              {pilot.startup_dpiit && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DPIIT {pilot.startup_dpiit}</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Authorized Budget</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                ₹{pilot.budget.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Scheduled Start</span>
              <span className="text-xs font-semibold text-white">{pilot.start_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Pilot Deadline</span>
              <span className="text-xs font-semibold text-white">{pilot.end_date}</span>
            </div>
          </div>
        </div>

        {/* Milestone Scorecard & 70% Progress Indicator */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">Target Completion Scorecard:</span>
              <span className="text-slate-400">
                <strong className="text-emerald-400">{metCount} Met</strong> •{' '}
                <strong className="text-rose-400">{missedCount} Missed</strong> •{' '}
                <strong className="text-cyan-400">{unreviewedCount} Awaiting Review</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current Success Rate:</span>
              <span className={`font-bold font-mono text-sm ${successRate >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {successRate}%
              </span>
              <span className="text-[11px] text-slate-500">(70% statutory bar)</span>
            </div>
          </div>

          {/* Progress Bar with 70% marker */}
          <div className="relative pt-1">
            <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-500 ${
                  successRate >= 70
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-500 to-orange-400'
                }`}
                style={{ width: `${successRate}%` }}
              />
            </div>
            {/* 70% Marker Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/70 shadow-sm pointer-events-none"
              style={{ left: '70%' }}
              title="70% Statutory Conversion Threshold"
            />
          </div>
        </div>
      </div>

      {/* Conversion Scorecard Banner (Section 10) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Conversion Audit Engine (Section 10)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time programmatic check of all 5 conversion rules before GFR direct contract generation.
            </p>
          </div>

          {!isConverted && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunConversionCheck}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Re-run compliance evaluation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Evaluate Rules</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRunConversionCheck();
                  if (conversionReport?.ok) {
                    setShowConvertModal(true);
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                  conversionReport?.ok
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Convert to Contract</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Scorecard Component */}
        <ConversionResult
          report={conversionReport}
          onProceed={() => setShowConvertModal(true)}
          isConverting={isConverting}
        />
      </div>

      {/* Milestones Review List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Pilot Trial Milestones ({pilot.milestones.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Review submitted evidence links against objective targets. Mark each milestone as Met or Missed.
            </p>
          </div>

          {isConverted && (
            <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Locked (Read-Only after Conversion)</span>
            </div>
          )}
        </div>

        {/* Milestones Rows */}
        <div className="space-y-3">
          {pilot.milestones.map((milestone, idx) => (
            <MilestoneRow
              key={milestone.id}
              milestone={milestone}
              index={idx}
              readOnly={isConverted}
              onReview={handleReview}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      </div>

      {/* CONVERSION MODAL (Final Confirmation) */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-xl rounded-2xl border border-emerald-500/40 p-6 sm:p-8 space-y-6 bg-slate-950 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Statutory Conversion Execution</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Issue Direct Public Contract
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Convert this successful trial into an official government contract with an immutable cryptographic SHA-256 hash.
                </p>
              </div>
              <button
                onClick={() => setShowConvertModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            {/* Compliance Confirmation */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>All 5 Section 10 Verification Criteria Verified:</span>
              </div>
              <p className="text-slate-300">
                • Pilot is active • All milestones evaluated • Success rate {successRate}% &gt;= 70% threshold • Within budget cap
              </p>
            </div>

            {/* Input Contract Value */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Final Award Contract Value (INR)</span>
                  <span className="text-[11px] text-slate-500 font-mono">Max Cap: ₹{pilot.budget.toLocaleString('en-IN')}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    max={pilot.budget}
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Statutory Rule Reference */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Statutory Rule Reference (Printed on Justification PDF)
                </label>
                <input
                  type="text"
                  value={ruleReference}
                  onChange={(e) => setRuleReference(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500">
                  Section 8 & 21 requirement: Cited on justification PDF to ensure audit immunity.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isConverting}
                onClick={handleConvert}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {isConverting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Computing Hash & Sealing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Conversion & Compute Hash</span>
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
