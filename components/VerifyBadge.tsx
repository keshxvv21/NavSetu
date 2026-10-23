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
      className={`inline-flex items-center rounded-full border backdrop-blur-md ${sizeClasses} ${
        verified
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/20'
          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-500/20'
      }`}
    >
      {verified ? (
        <ShieldCheck className={`${iconSizes} text-emerald-400`} />
      ) : (
        <ShieldAlert className={`${iconSizes} text-rose-400`} />
      )}
      {showLabel && (
        <span>
          {verified ? 'Tamper-Evident: VERIFIED' : 'Integrity Mismatch: CHANGED'}
        </span>
      )}
    </div>
  );
}
