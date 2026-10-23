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
      styles = 'bg-zinc-100 text-zinc-900 border-zinc-300 font-medium';
      dotColor = 'bg-zinc-900';
      label = 'Open for Proposals';
      break;
    case 'in_pilot':
      styles = 'bg-zinc-900 text-white border-zinc-900 font-medium';
      dotColor = 'bg-zinc-300';
      label = 'In Pilot';
      break;
    case 'active':
      styles = 'bg-zinc-900 text-white border-zinc-900 font-medium';
      dotColor = 'bg-zinc-300';
      label = 'Active Pilot';
      break;
    case 'converted':
      styles = 'bg-black text-white border-black font-semibold';
      dotColor = 'bg-zinc-200';
      label = 'Converted to Contract';
      break;
    case 'met':
      styles = 'bg-zinc-900 text-white border-zinc-800 font-medium';
      dotColor = 'bg-white';
      label = 'Milestone Met';
      break;
    case 'missed':
      styles = 'bg-zinc-100 text-zinc-800 border-zinc-400 font-medium';
      dotColor = 'bg-zinc-500';
      label = 'Milestone Missed';
      break;
    case 'pending':
      styles = 'bg-zinc-100 text-zinc-700 border-zinc-200';
      dotColor = 'bg-zinc-400';
      label = 'Pending Submission';
      break;
    case 'submitted':
      styles = 'bg-zinc-100 text-zinc-900 border-zinc-300 font-medium';
      dotColor = 'bg-zinc-900';
      label = 'Submitted (Under Review)';
      break;
    case 'selected':
      styles = 'bg-black text-white border-black font-semibold';
      dotColor = 'bg-white';
      label = 'Selected';
      break;
    case 'rejected':
      styles = 'bg-zinc-100 text-zinc-500 border-zinc-200';
      dotColor = 'bg-zinc-400';
      label = 'Not Selected';
      break;
    case 'failed':
      styles = 'bg-zinc-200 text-zinc-800 border-zinc-400 font-medium';
      dotColor = 'bg-zinc-600';
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
