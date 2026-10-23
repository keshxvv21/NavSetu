'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  ArrowLeft,
  Send,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  IndianRupee,
  Clock,
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { getProblemById, loadState, Problem, Startup } from '@/lib/departmentStore';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const problemId = params?.id as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [currentStartup, setCurrentStartup] = useState<Startup | null>(null);
  const [pitch, setPitch] = useState('');
  const [proposedBudget, setProposedBudget] = useState('1400000');
  const [timelineWeeks, setTimelineWeeks] = useState('8');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!problemId) return;
    const p = getProblemById(problemId);
    if (p) {
      setProblem(p);
      setProposedBudget(String(p.budget_cap));
    }

    const state = loadState();
    const saved = localStorage.getItem('navsetu_session');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        const s = state.startups.find((item) => item.id === user.org_id || item.name === user.org_name);
        if (s) {
          setCurrentStartup(s);
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }
    }
    // Default to first startup (AquaSense)
    setCurrentStartup(state.startups[0]);
    setLoading(false);
  }, [problemId]);

  // Demo 1-click pre-fill
  const handlePreFill = () => {
    setPitch(
      'Our patented IoT hydrophone sensor nodes connect directly to municipal valve junctions with non-destructive magnetic clamp mounts. Telemetry is edge-classified by a lightweight 1D-CNN pipeline running on 4G solar gateways, delivering real-time acoustic leak triangulation within 3.5m radius.'
    );
    setProposedBudget(String(Math.min(problem?.budget_cap || 1500000, 1420000)));
    setTimelineWeeks('8');
    showToast('Demo proposal pre-filled!', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!problem || !currentStartup) return;

    if (!currentStartup.verified) {
      showToast('Eligibility Block: Unverified startups cannot submit proposals under DPIIT procurement rules.', 'error');
      return;
    }

    const budgetNum = Number(proposedBudget);
    if (budgetNum > problem.budget_cap) {
      showToast(`Proposed budget exceeds problem cap of INR ${problem.budget_cap.toLocaleString('en-IN')}`, 'error');
      return;
    }

    if (pitch.trim().length < 20) {
      showToast('Please provide a substantive technical pitch (minimum 20 characters).', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: problem.id,
          startup_id: currentStartup.id,
          pitch,
          proposed_budget: budgetNum,
          pilot_timeline_weeks: Number(timelineWeeks),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || 'Failed to submit proposal', 'error');
        setIsSubmitting(false);
        return;
      }

      showToast('Proposal submitted successfully to the department!', 'success');
      router.push('/startup/dashboard');
    } catch {
      showToast('Submission error occurred', 'error');
      setIsSubmitting(false);
    }
  };

  if (loading || !problem) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-zinc-500">
        Loading challenge details...
      </div>
    );
  }

  const isBlocked = !currentStartup?.verified;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/startup/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Open Challenges</span>
        </Link>

        <button
          type="button"
          onClick={handlePreFill}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-bold hover:bg-zinc-200 transition-colors shadow-2xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-zinc-900" />
          <span>Pre-Fill Demo Proposal</span>
        </button>
      </div>

      {/* Problem Brief */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 mb-2">
          <Building2 className="h-4 w-4" />
          <span>{problem.department_name || 'Government Ministry'}</span>
          <span>•</span>
          <span className="text-zinc-500">{problem.sector}</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight mb-3">
          {problem.title}
        </h1>

        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
          {problem.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-100 text-xs">
          <div>
            <span className="text-zinc-400 block font-medium">Statutory Budget Cap</span>
            <span className="font-extrabold text-zinc-950 text-sm">
              INR {problem.budget_cap.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block font-medium">Application Deadline</span>
            <span className="font-bold text-zinc-800">{problem.deadline}</span>
          </div>
          <div>
            <span className="text-zinc-400 block font-medium">Validation Phase</span>
            <span className="font-bold text-zinc-900">Paid Milestone Pilot</span>
          </div>
        </div>
      </div>

      {/* Eligibility Guard Warning */}
      {isBlocked && (
        <div className="mb-6 p-4 rounded-xl bg-zinc-950 text-white border border-zinc-800 shadow-lg flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-white text-sm">
              DPIIT Verification Required (F5 Compliance Rule)
            </h4>
            <p className="text-zinc-300 leading-relaxed">
              Your current active profile ({currentStartup?.name} • {currentStartup?.dpiit_id}) has not completed statutory DPIIT certificate verification. Under General Financial Rules (GFR), only verified startups are eligible to bid for direct government pilots.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/startup/profile"
                className="inline-flex items-center gap-1 font-bold text-white underline underline-offset-2 hover:text-zinc-300"
              >
                Go to Startup Profile to simulate verification
              </Link>
              <span className="text-zinc-500">or</span>
              <Link
                href="/login"
                className="font-bold text-white underline underline-offset-2 hover:text-zinc-300"
              >
                Switch to verified persona
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Application Form */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-zinc-950">
              Submit Pilot Proposal
            </h2>
            <p className="text-xs text-zinc-500">
              Applying as: <strong>{currentStartup?.name}</strong> ({currentStartup?.dpiit_id})
            </p>
          </div>
          {currentStartup?.verified ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-900" />
              Verified Applicant
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300">
              <ShieldAlert className="h-3.5 w-3.5 text-zinc-500" />
              Unverified (Blocked)
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1">
              Technical Pitch & Deployment Methodology *
            </label>
            <p className="text-[11px] text-zinc-500 mb-2">
              Explain your technology, sensor/algorithm specs, field deployment plan, and how you will meet the department's baseline targets.
            </p>
            <textarea
              rows={5}
              required
              value={pitch}
              disabled={isBlocked || isSubmitting}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Describe your technical architecture, telemetry data capture, and pilot deliverables..."
              className="w-full p-3 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:ring-black focus:border-black disabled:bg-zinc-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Proposed Pilot Budget (INR) *
              </label>
              <div className="relative rounded-md shadow-xs">
                <input
                  type="number"
                  required
                  value={proposedBudget}
                  disabled={isBlocked || isSubmitting}
                  onChange={(e) => setProposedBudget(e.target.value)}
                  max={problem.budget_cap}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:ring-black focus:border-black disabled:bg-zinc-100 disabled:cursor-not-allowed font-semibold"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Max statutory cap: INR {problem.budget_cap.toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Pilot Duration (Weeks) *
              </label>
              <div className="relative rounded-md shadow-xs">
                <input
                  type="number"
                  required
                  min={2}
                  max={26}
                  value={timelineWeeks}
                  disabled={isBlocked || isSubmitting}
                  onChange={(e) => setTimelineWeeks(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:ring-black focus:border-black disabled:bg-zinc-100 disabled:cursor-not-allowed font-semibold"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Typical pilot duration: 6 to 12 weeks
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <Link
              href="/startup/browse"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-black"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isBlocked || isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
