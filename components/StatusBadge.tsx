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

  let styles = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let label = status;
  let dotColor = 'bg-slate-400';

  switch (normalized) {
    case 'open':
      styles = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      dotColor = 'bg-blue-400 animate-pulse';
      label = 'Open for Proposals';
      break;
    case 'in_pilot':
      styles = 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      dotColor = 'bg-purple-400';
      label = 'In Pilot';
      break;
    case 'active':
      styles = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      dotColor = 'bg-indigo-400 animate-pulse';
      label = 'Active Pilot';
      break;
    case 'converted':
      styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/20';
      dotColor = 'bg-emerald-400';
      label = 'Converted to Contract';
      break;
    case 'met':
      styles = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      dotColor = 'bg-emerald-400';
      label = 'Milestone Met';
      break;
    case 'missed':
      styles = 'bg-rose-500/15 text-rose-300 border-rose-500/40';
      dotColor = 'bg-rose-400';
      label = 'Milestone Missed';
      break;
    case 'pending':
      styles = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      dotColor = 'bg-amber-400';
      label = 'Pending Submission';
      break;
    case 'submitted':
      styles = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      dotColor = 'bg-cyan-400 animate-pulse';
      label = 'Submitted (Under Review)';
      break;
    case 'selected':
      styles = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      dotColor = 'bg-emerald-400';
      label = 'Selected';
      break;
    case 'rejected':
      styles = 'bg-zinc-800 text-zinc-400 border-zinc-700';
      dotColor = 'bg-zinc-500';
      label = 'Not Selected';
      break;
    case 'failed':
      styles = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      dotColor = 'bg-rose-400';
      label = 'Pilot Failed';
      break;
    default:
      label = status ? status.replace(/_/g, ' ') : 'Unknown';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-2',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-sm tracking-wide capitalize ${sizeClasses} ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
