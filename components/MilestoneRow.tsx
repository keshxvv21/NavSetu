'use client';

import React from 'react';
import StatusBadge from './StatusBadge';
import { ExternalLink, CheckCircle2, XCircle, Clock, FileText, ArrowRight } from 'lucide-react';

export interface MilestoneData {
  id: string;
  pilot_id: string;
  title: string;
  due_date?: string;
  target: string;
  evidence_url?: string | null;
  status: 'pending' | 'submitted' | 'met' | 'missed';
  notes?: string;
}

interface MilestoneRowProps {
  milestone: MilestoneData;
  index: number;
  readOnly?: boolean;
  onReview?: (milestoneId: string, decision: 'met' | 'missed') => void;
  isUpdating?: boolean;
}

export default function MilestoneRow({
  milestone,
  index,
  readOnly = false,
  onReview,
  isUpdating = false,
}: MilestoneRowProps) {
  const isReviewed = milestone.status === 'met' || milestone.status === 'missed';
  const hasEvidence = Boolean(milestone.evidence_url && milestone.evidence_url.trim().length > 0);

  return (
    <div className={`p-4 sm:p-5 rounded-xl border transition-all ${
      milestone.status === 'met' 
        ? 'bg-emerald-950/20 border-emerald-500/30'
        : milestone.status === 'missed'
        ? 'bg-rose-950/20 border-rose-500/30'
        : milestone.status === 'submitted'
        ? 'bg-cyan-950/20 border-cyan-500/30 shadow-md shadow-cyan-900/10'
        : 'bg-slate-900/50 border-slate-800'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Milestone Info */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              M{index + 1}
            </span>
            <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">
              {milestone.title}
            </h4>
            <StatusBadge status={milestone.status} size="sm" />
          </div>

          {/* Success Measure / Target (Critical according to README) */}
          <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="font-semibold text-indigo-400 shrink-0 uppercase tracking-wider text-[10px]">Target Criterion:</span>
            <span className="text-slate-300 leading-relaxed">{milestone.target}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {milestone.due_date && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Due: <strong className="text-slate-300">{milestone.due_date}</strong>
              </span>
            )}

            {/* Evidence Link */}
            {hasEvidence ? (
              <a
                href={milestone.evidence_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Startup Evidence</span>
              </a>
            ) : (
              <span className="text-slate-500 italic">No evidence link submitted yet</span>
            )}
          </div>
        </div>

        {/* Right: Department Review Action Buttons */}
        {!readOnly && onReview && (
          <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800 shrink-0">
            {milestone.status === 'submitted' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onReview(milestone.id, 'met')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-700/30 transition-colors disabled:opacity-50"
                  title="Accept evidence and mark target achieved"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Met</span>
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onReview(milestone.id, 'missed')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700/80 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm shadow-rose-900/30 transition-colors disabled:opacity-50"
                  title="Reject or mark target not satisfied"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Mark Missed</span>
                </button>
              </div>
            ) : isReviewed ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Reviewed as <strong className={milestone.status === 'met' ? 'text-emerald-400' : 'text-rose-400'}>{milestone.status.toUpperCase()}</strong>
                </span>
                {/* Optional toggle for re-review or tamper demonstration */}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onReview(milestone.id, milestone.status === 'met' ? 'missed' : 'met')}
                  className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors disabled:opacity-50"
                  title="Flip status for review adjustment or audit check"
                >
                  Flip to {milestone.status === 'met' ? 'Missed' : 'Met'}
                </button>
              </div>
            ) : (
              <div className="text-xs text-amber-400/80 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                Awaiting Startup Submission
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
