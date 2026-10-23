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
      className={`p-4 sm:p-5 rounded-xl border transition-all ${
        milestone.status === 'met'
          ? 'bg-emerald-50/40 border-emerald-300'
          : milestone.status === 'missed'
          ? 'bg-rose-50/40 border-rose-300'
          : milestone.status === 'submitted'
          ? 'bg-sky-50/50 border-sky-300 shadow-xs'
          : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Milestone Info */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              M{index + 1}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {milestone.title}
            </h4>
            <StatusBadge status={milestone.status} size="sm" />
          </div>

          {/* Target Criterion */}
          <div className="flex items-start gap-2 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="font-bold text-blue-800 shrink-0 uppercase tracking-wider text-[11px]">
              Target Criterion:
            </span>
            <span className="text-slate-800 leading-relaxed font-medium">{milestone.target}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            {milestone.due_date && (
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Target Due Date: <strong className="text-slate-900">{milestone.due_date}</strong>
              </span>
            )}

            {/* Evidence Link */}
            {hasEvidence ? (
              <a
                href={milestone.evidence_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 underline font-semibold"
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
          <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 shrink-0">
            {milestone.status === 'submitted' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onReview(milestone.id, 'met')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                  title="Accept evidence and mark target achieved"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Met</span>
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onReview(milestone.id, 'missed')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                  title="Reject or mark target not satisfied"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Mark Missed</span>
                </button>
              </div>
            ) : isReviewed ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700 font-medium">
                  Status:{' '}
                  <strong className={milestone.status === 'met' ? 'text-emerald-700' : 'text-rose-700'}>
                    {milestone.status.toUpperCase()}
                  </strong>
                </span>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onReview(milestone.id, milestone.status === 'met' ? 'missed' : 'met')}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 transition-colors disabled:opacity-50"
                  title="Flip status for review adjustment or audit check"
                >
                  Flip to {milestone.status === 'met' ? 'Missed' : 'Met'}
                </button>
              </div>
            ) : (
              <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
                Awaiting Startup Submission
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
