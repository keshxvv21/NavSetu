import React from 'react';

export type StatusType =
  | 'open'
  | 'in_pilot'
  | 'converted'
  | 'submitted'
  | 'selected'
  | 'rejected'
  | 'active'
  | 'failed'
  | 'pending'
  | 'met'
  | 'missed'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase().trim();

  let styles = 'bg-slate-100 text-slate-800 border-slate-200';
  let label = status;
  let dotColor = 'bg-slate-500';

  switch (normalized) {
    case 'open':
      styles = 'bg-blue-50 text-blue-800 border-blue-200';
      dotColor = 'bg-blue-600';
      label = 'Open for Proposals';
      break;
    case 'in_pilot':
      styles = 'bg-purple-50 text-purple-800 border-purple-200';
      dotColor = 'bg-purple-600';
      label = 'In Pilot';
      break;
    case 'active':
      styles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      dotColor = 'bg-indigo-600';
      label = 'Active Pilot';
      break;
    case 'converted':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
      dotColor = 'bg-emerald-600';
      label = 'Converted to Contract';
      break;
    case 'met':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium';
      dotColor = 'bg-emerald-600';
      label = 'Milestone Met';
      break;
    case 'missed':
      styles = 'bg-rose-50 text-rose-800 border-rose-300 font-medium';
      dotColor = 'bg-rose-600';
      label = 'Milestone Missed';
      break;
    case 'pending':
      styles = 'bg-amber-50 text-amber-800 border-amber-300';
      dotColor = 'bg-amber-600';
      label = 'Pending Submission';
      break;
    case 'submitted':
      styles = 'bg-sky-50 text-sky-800 border-sky-300';
      dotColor = 'bg-sky-600';
      label = 'Submitted (Under Review)';
      break;
    case 'selected':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      dotColor = 'bg-emerald-600';
      label = 'Selected';
      break;
    case 'rejected':
      styles = 'bg-slate-100 text-slate-600 border-slate-300';
      dotColor = 'bg-slate-500';
      label = 'Not Selected';
      break;
    case 'failed':
      styles = 'bg-rose-50 text-rose-800 border-rose-300';
      dotColor = 'bg-rose-600';
      label = 'Pilot Failed';
      break;
    default:
      label = status ? status.replace(/_/g, ' ') : 'Unknown';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
    md: 'text-xs font-semibold px-3 py-1 gap-2',
    lg: 'text-sm font-semibold px-3.5 py-1.5 gap-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide capitalize shadow-xs ${sizeClasses} ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
