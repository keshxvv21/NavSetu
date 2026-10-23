'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Rocket,
  ArrowLeft,
  Building2,
  Calendar,
  IndianRupee,
  Link2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Send,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { getPilotById, Pilot, Milestone } from '@/lib/departmentStore';

export default function StartupSubmitMilestonePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const pilotId = params?.id as string;

  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPilotData = () => {
    if (!pilotId) return;
    const p = getPilotById(pilotId);
    if (p) {
      setPilot(p);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPilotData();
  }, [pilotId]);

  const handleOpenSubmit = (m: Milestone) => {
    setSelectedMilestone(m);
    setEvidenceUrl(m.evidence_url || '');
    setNotes(m.notes || '');
  };

  const handlePreFillEvidence = () => {
    setEvidenceUrl('https://grafana.aquasense.org/public-dashboards/telemetry-pilot-b-field-logs');
    setNotes('Acoustic hydrophone telemetry calibrated across 25 nodes with 96.2% data packet integrity.');
    showToast('Demo evidence URL pre-filled!', 'info');
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    if (!evidenceUrl.trim() || !evidenceUrl.startsWith('http')) {
      showToast('Please provide a valid web URL for auditable evidence (http:// or https://)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/milestones/${selectedMilestone.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidence_url: evidenceUrl.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || 'Failed to submit evidence', 'error');
        setIsSubmitting(false);
        return;
      }

      showToast(`Evidence for ${selectedMilestone.title} submitted! Ready for Department review.`, 'success');
      setSelectedMilestone(null);
      loadPilotData();
    } catch {
      showToast('Submission error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !pilot) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-zinc-500">
        Loading pilot milestone tracker...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/startup/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Startup Dashboard</span>
        </Link>

        <span className="text-xs text-zinc-500">
          Pilot Status: <strong className="text-zinc-900 uppercase">{pilot.status}</strong>
        </span>
      </div>

      {/* Pilot Overview Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-300">
                {pilot.id}
              </span>
              <StatusBadge status={pilot.status} />
            </div>
            <h1 className="text-xl font-black text-zinc-950 tracking-tight">
              {pilot.problem_title}
            </h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-zinc-400 block font-medium">Pilot Budget</span>
            <span className="text-lg font-black text-zinc-950">
              INR {pilot.budget.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-zinc-400 font-medium block">Supervising Ministry / Dept</span>
            <span className="font-bold text-zinc-800">{pilot.department_name}</span>
          </div>
          <div>
            <span className="text-zinc-400 font-medium block">Pilot Timeline</span>
            <span className="font-bold text-zinc-800">
              {pilot.start_date} to {pilot.end_date}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 font-medium block">Statutory Procurement Pathway</span>
            <span className="font-bold text-zinc-900">GFR 149(viii) Direct Conversion</span>
          </div>
        </div>
      </div>

      {/* Milestone Submission Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-950">
            Pilot Performance Milestones ({pilot.milestones.length})
          </h2>
          <p className="text-xs text-zinc-500">
            Submit auditable links for pending milestones so the department can verify outcomes.
          </p>
        </div>

        <div className="space-y-3">
          {pilot.milestones.map((m, idx) => {
            const isPending = m.status === 'pending';
            const isSubmitted = m.status === 'submitted';
            const isReviewed = m.status === 'met' || m.status === 'missed';

            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border transition-all ${
                  m.status === 'met'
                    ? 'bg-zinc-50 border-zinc-300'
                    : m.status === 'missed'
                    ? 'bg-zinc-100 border-zinc-300'
                    : m.status === 'submitted'
                    ? 'bg-zinc-50 border-zinc-400'
                    : 'bg-white border-zinc-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-900">
                        M{idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-950">{m.title}</h4>
                      <StatusBadge status={m.status} size="sm" />
                    </div>

                    <p className="text-xs text-zinc-600">
                      <strong className="text-zinc-800">Target Benchmark:</strong> {m.target}
                    </p>

                    {m.due_date && (
                      <p className="text-[11px] text-zinc-400">
                        Due Date: <strong>{m.due_date}</strong>
                      </p>
                    )}

                    {m.evidence_url && (
                      <div className="pt-1 flex items-center gap-2 text-xs">
                        <Link2 className="h-3.5 w-3.5 text-zinc-700" />
                        <a
                          href={m.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-zinc-900 hover:underline max-w-md truncate inline-flex items-center gap-1"
                        >
                          <span>{m.evidence_url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    )}

                    {m.notes && (
                      <p className="text-[11px] text-zinc-500 italic">
                        Notes: {m.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => handleOpenSubmit(m)}
                        className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        Submit Evidence
                      </button>
                    )}

                    {isSubmitted && (
                      <button
                        onClick={() => handleOpenSubmit(m)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-xs font-semibold hover:bg-zinc-100 transition-colors shadow-2xs"
                      >
                        Update Evidence
                      </button>
                    )}

                    {isReviewed && (
                      <span className="text-xs font-bold text-zinc-700 inline-flex items-center gap-1">
                        {m.status === 'met' ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-zinc-900" />
                            <span>Benchmark Achieved</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Target Missed</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Submitting Evidence */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-zinc-950">
                Submit Milestone Evidence: {selectedMilestone.title}
              </h3>
              <button
                type="button"
                onClick={handlePreFillEvidence}
                className="text-xs font-bold text-zinc-900 hover:underline inline-flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>Pre-Fill</span>
              </button>
            </div>

            <form onSubmit={handleSubmitEvidence} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Auditable Evidence URL *
                </label>
                <p className="text-[11px] text-zinc-500 mb-2">
                  Enter a verifiable public link (GitHub repository, Loom demo, cloud benchmark dashboard, or telemetry logs).
                </p>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link2 className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/org/repo or https://grafana.domain.org/..."
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Execution Notes & Technical Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize key test parameters, precision metrics, and department field observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:ring-black focus:border-black"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Uploading...' : 'Submit to Department'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
