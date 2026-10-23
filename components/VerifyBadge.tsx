import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface VerifyBadgeProps {
  verified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function VerifyBadge({
  verified,
  size = 'md',
  showLabel = true,
}: VerifyBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-3 py-1 gap-2',
    lg: 'text-sm font-bold px-4 py-1.5 gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full border shadow-xs ${sizeClasses} ${
        verified
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
          : 'bg-rose-50 text-rose-800 border-rose-300'
      }`}
    >
      {verified ? (
        <ShieldCheck className={`${iconSizes} text-emerald-700`} />
      ) : (
        <ShieldAlert className={`${iconSizes} text-rose-700`} />
      )}
      {showLabel && (
        <span className="font-semibold text-slate-900">
          {verified ? 'Tamper-Evident: VERIFIED' : 'Integrity Mismatch: CHANGED'}
        </span>
      )}
    </div>
  );
}
