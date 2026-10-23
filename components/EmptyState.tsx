import React from 'react';
import Link from 'next/link';
import { LucideIcon, Inbox, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const label = actionText || actionLabel;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-zinc-200 rounded-2xl bg-white shadow-xs">
      <div className="h-12 w-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 mb-4">
        <Icon className="w-6 h-6 text-zinc-900" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-zinc-600 max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>

      {label && (
        <div className="mt-6">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
