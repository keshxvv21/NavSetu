'use client';

import React from 'react';
import StatusBadge from './StatusBadge';
import { ExternalLink, CheckCircle2, XCircle, Clock } from 'lucide-react';

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
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        milestone.status === 'met'
          ? 'bg-zinc-50/80 border-zinc-300 shadow-xs'
          : milestone.status === 'missed'
          ? 'bg-zinc-100/80 border-zinc-300'
          : milestone.status === 'submitted'
          ? 'bg-zinc-50 border-zinc-400 shadow-xs'
          : 'bg-white border-zinc-200 shadow-xs'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Milestone Info */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-200">
              M{index + 1}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">
              {milestone.title}
            </h4>
            <StatusBadge status={milestone.status} size="sm" />
          </div>

          {/* Target Criterion */}
          <div className="flex items-start gap-2 text-xs text-zinc-800 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
            <span className="font-bold text-zinc-900 shrink-0 uppercase tracking-wider text-[11px]">
              Target Criterion:
            </span>
            <span className="text-zinc-800 leading-relaxed font-medium">{milestone.target}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600">
            {milestone.due_date && (
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Target Due Date: <strong className="text-zinc-900 font-semibold">{milestone.due_date}</strong>
              </span>
            )}

            {/* Evidence Link */}
            {hasEvidence ? (
              <a
                href={milestone.evidence_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-black hover:text-zinc-700 underline font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Startup Evidence</span>
              </a>
            ) : (
              <span className="text-zinc-400 italic">No evidence link submitted yet</span>
            )}
          </div>
        </div>

        {/* Right: Department Review Action Buttons */}
        {!readOnly && onReview && (
          <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-200 shrink-0">
            {milestone.status === 'submitted' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onReview(milestone.id, 'met')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                  title="Accept evidence and mark target achieved"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Met</span>
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onReview(milestone.id, 'missed')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 text-xs font-bold border border-zinc-300 shadow-xs transition-colors disabled:opacity-50"
                  title="Reject or mark target not satisfied"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Mark Missed</span>
                </button>
              </div>
            ) : isReviewed ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-700 font-medium">
                  Status:{' '}
                  <strong className="text-black font-bold">
                    {milestone.status.toUpperCase()}
                  </strong>
                </span>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onReview(milestone.id, milestone.status === 'met' ? 'missed' : 'met')}
                  className="text-xs font-semibold text-zinc-700 hover:text-black px-2.5 py-1 rounded-lg border border-zinc-300 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                  title="Flip status for review adjustment or audit check"
                >
                  Flip to {milestone.status === 'met' ? 'Missed' : 'Met'}
                </button>
              </div>
            ) : (
              <div className="text-xs text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200 font-medium">
                Awaiting Startup Submission
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
