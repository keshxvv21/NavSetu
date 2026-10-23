import React from 'react';
import Link from 'next/link';
import { LucideIcon, Inbox, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-slate-200 rounded-xl bg-white shadow-xs">
      <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mb-4">
        <Icon className="w-6 h-6 text-slate-700" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>

      {actionText && (
        <div className="mt-6">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{actionText}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{actionText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
