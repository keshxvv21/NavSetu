'use client';

import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';

export interface RuleCheckResult {
  ruleNumber: number;
  name: string;
  passed: boolean;
  message: string;
}

export interface ConversionCheckReport {
  ok: boolean;
  reasons: string[];
  rules: RuleCheckResult[];
  successRate: number;
  contractValue: number;
  budgetCapped: number;
}

interface ConversionResultProps {
  report: ConversionCheckReport | null;
  onProceed?: () => void;
  isConverting?: boolean;
}

export default function ConversionResult({
  report,
  onProceed,
  isConverting = false,
}: ConversionResultProps) {
  if (!report) return null;

  return (
    <div
      className={`rounded-xl border p-5 transition-all shadow-xs ${
        report.ok
          ? 'bg-emerald-50/40 border-emerald-300'
          : 'bg-rose-50/40 border-rose-300'
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              report.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {report.ok ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {report.ok
                  ? 'Statutory Conversion Check: PASSED'
                  : 'Statutory Conversion Check: FAILED'}
              </h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
                  report.ok
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {report.ok ? 'Rule 149 GFR Compliant' : `${report.reasons.length} Violation(s)`}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium leading-relaxed">
              {report.ok
                ? 'All 5 mandatory pilot-to-contract procurement criteria have been verified in code.'
                : 'Direct contract conversion blocked to prevent procurement audit non-compliance.'}
            </p>
          </div>
        </div>

        {report.ok && onProceed && (
          <button
            type="button"
            disabled={isConverting}
            onClick={onProceed}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0 disabled:opacity-50"
          >
            {isConverting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Hashing & Converting...</span>
              </>
            ) : (
              <>
                <span>Issue Converted Contract</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Rules Checklist */}
      <div className="mt-5 space-y-2.5">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
          <span>Verification Rules (Section 10 State Engine):</span>
          <span>
            Success Rate:{' '}
            <strong className={report.successRate >= 70 ? 'text-emerald-700' : 'text-rose-700'}>
              {report.successRate}%
            </strong>{' '}
            (Min 70% Required)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {report.rules.map((rule) => (
            <div
              key={rule.ruleNumber}
              className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs transition-colors ${
                rule.passed
                  ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {rule.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">
                  Rule {rule.ruleNumber}: {rule.name}
                </div>
                <div className={`text-[11px] font-medium ${rule.passed ? 'text-slate-600' : 'text-rose-800'}`}>
                  {rule.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fail reasons callout if failed */}
      {!report.ok && report.reasons.length > 0 && (
        <div className="mt-4 p-3.5 bg-rose-100/70 border border-rose-300 rounded-lg">
          <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5 mb-1.5">
            <Info className="w-4 h-4 text-rose-700" />
            <span>Audit Block Reasons (Must be rectified before conversion):</span>
          </div>
          <ul className="list-disc list-inside text-xs text-rose-900 space-y-1 font-medium">
            {report.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
