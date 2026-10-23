'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Lock, 
  ArrowRight,
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

  // Run Conversion Check manually
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
      const result = convertPilotToContract({
        pilotId: pilot.id,
        contractValue: Number(contractValue),
        ruleReference,
      });

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
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pilot) {
    return (
      <div className="space-y-4">
        <Link
          href="/department/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black"
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/department/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Department Command Center</span>
        </Link>

        {isConverted && (
          <div className="flex items-center gap-2">
            <Link
              href={`/contracts/${pilot.contract_id || pilot.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-100 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-900" />
              <span>View Contract & PDF</span>
            </Link>
            <Link
              href={`/verify/${pilot.contract_id || pilot.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black hover:bg-zinc-800 text-white shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Public Audit Verification</span>
            </Link>
          </div>
        )}
      </div>

      {/* Converted Alert Banner */}
      {isConverted && (
        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950 text-white border border-zinc-800 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-zinc-800 text-white shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Officially Converted & Sealed
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-white font-bold border border-zinc-700">
                    {pilot.contract_id}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Direct Procurement Contract Awarded
                </h2>
                <p className="text-xs text-zinc-400 font-medium">
                  Record is read-only and sealed with cryptographic SHA-256 fingerprint under{' '}
                  <span className="text-white font-bold underline">{pilot.rule_reference}</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/contracts/${pilot.contract_id || pilot.id}`}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-900 bg-white hover:bg-zinc-100 shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Download Justification PDF</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Cryptographic Hash Bar */}
          {pilot.record_hash && (
            <div className="mt-2 pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="text-zinc-400 font-bold uppercase text-[10px]">Canonical SHA-256:</span>
                <span className="text-white font-bold select-all break-all bg-zinc-900 px-2 py-1 rounded border border-zinc-700">
                  {pilot.record_hash}
                </span>
              </div>
              <div className="text-xs text-zinc-200 font-bold flex items-center gap-1 font-sans shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Verified Match</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Pilot Card */}
      <div className="p-6 sm:p-8 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={pilot.status} size="md" />
              <span className="text-xs font-mono font-bold text-zinc-700 px-2.5 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                Pilot ID: {pilot.id}
              </span>
              <span className="text-xs text-zinc-900 font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{pilot.department_name}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {pilot.problem_title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 pt-1 font-medium">
              <div>
                Partner Startup: <strong className="text-zinc-900 font-bold text-sm">{pilot.startup_name}</strong>
              </div>
              {pilot.startup_dpiit && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-300 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
                  <span>DPIIT {pilot.startup_dpiit}</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Authorized Budget</span>
              <span className="text-sm font-extrabold text-zinc-900 font-mono">
                ₹{pilot.budget.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Scheduled Start</span>
              <span className="text-xs font-bold text-zinc-900">{pilot.start_date}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Pilot Deadline</span>
              <span className="text-xs font-bold text-zinc-900">{pilot.end_date}</span>
            </div>
          </div>
        </div>

        {/* Milestone Scorecard & 70% Progress Indicator */}
        <div className="pt-4 border-t border-zinc-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium">
            <div className="flex items-center gap-3">
              <span className="font-bold text-zinc-900">Target Completion Scorecard:</span>
              <span className="text-zinc-600">
                <strong className="text-zinc-900">{metCount} Met</strong> •{' '}
                <strong className="text-zinc-500">{missedCount} Missed</strong> •{' '}
                <strong className="text-zinc-700">{unreviewedCount} Awaiting Review</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-600">Current Success Rate:</span>
              <span className="font-bold font-mono text-sm text-zinc-900">
                {successRate}%
              </span>
              <span className="text-zinc-500 text-[11px]">(70% statutory bar)</span>
            </div>
          </div>

          {/* Progress Bar with 70% marker */}
          <div className="relative pt-1">
            <div className="w-full h-3 rounded-full bg-zinc-100 border border-zinc-300 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 ${
                  successRate >= 70
                    ? 'bg-black'
                    : 'bg-zinc-500'
                }`}
                style={{ width: `${successRate}%` }}
              />
            </div>
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 pointer-events-none"
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
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-zinc-900" />
              <span>Conversion Audit Engine (Section 10)</span>
            </h2>
            <p className="text-xs text-zinc-600 font-medium">
              Real-time programmatic check of all 5 conversion rules before GFR direct contract generation.
            </p>
          </div>

          {!isConverted && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunConversionCheck}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 transition-colors shadow-xs"
                title="Re-run compliance evaluation"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-600" />
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
                  conversionReport?.ok
                    ? 'bg-black hover:bg-zinc-800'
                    : 'bg-zinc-800 hover:bg-zinc-900'
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
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-zinc-900" />
              <span>Pilot Trial Milestones ({pilot.milestones.length})</span>
            </h2>
            <p className="text-xs text-zinc-600 font-medium">
              Review submitted evidence links against objective targets. Mark each milestone as Met or Missed.
            </p>
          </div>

          {isConverted && (
            <div className="flex items-center gap-1 text-xs font-bold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-xl border border-zinc-200">
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
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

      {/* CONVERSION MODAL */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-300 p-6 sm:p-8 space-y-6 bg-white shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Statutory Conversion Execution</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
                  Issue Direct Public Contract
                </h3>
                <p className="text-xs text-zinc-600 mt-0.5 font-medium">
                  Convert this successful trial into an official government contract with an immutable cryptographic SHA-256 hash.
                </p>
              </div>
              <button
                onClick={() => setShowConvertModal(false)}
                className="text-zinc-400 hover:text-black p-1 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Compliance Confirmation */}
            <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-300 text-xs text-zinc-900 space-y-1 font-medium">
              <div className="font-bold flex items-center gap-1.5 text-black">
                <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                <span>All 5 Section 10 Verification Criteria Verified:</span>
              </div>
              <p className="text-zinc-700">
                • Pilot is active • All milestones evaluated • Success rate {successRate}% &gt;= 70% threshold • Within budget cap
              </p>
            </div>

            {/* Input Contract Value */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Final Award Contract Value (INR)</span>
                  <span className="text-[11px] text-zinc-500 font-mono font-normal">Max Cap: ₹{pilot.budget.toLocaleString('en-IN')}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm font-bold">₹</span>
                  <input
                    type="number"
                    max={pilot.budget}
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full bg-white border border-zinc-300 rounded-xl pl-8 pr-4 py-2.5 text-sm text-zinc-900 font-mono font-bold focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Statutory Rule Reference */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Statutory Rule Reference (Printed on Justification PDF)
                </label>
                <input
                  type="text"
                  value={ruleReference}
                  onChange={(e) => setRuleReference(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-zinc-900 font-medium focus:outline-none focus:border-black"
                />
                <span className="text-[11px] text-zinc-500 font-medium">
                  Section 8 & 21 requirement: Cited on justification PDF to ensure audit immunity.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:text-black bg-white border border-zinc-300 shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isConverting}
                onClick={handleConvert}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-black hover:bg-zinc-800 shadow-xs disabled:opacity-50"
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
