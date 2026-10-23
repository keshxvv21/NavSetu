'use client';

import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck, 
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
    <div className={`rounded-xl border p-5 transition-all ${
      report.ok
        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
        : 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20'
    }`}>
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            report.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {report.ok ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {report.ok
                ? 'Statutory Conversion Check: PASSED'
                : 'Statutory Conversion Check: FAILED'}
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                report.ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {report.ok ? 'Rule 149 GFR Compliant' : `${report.reasons.length} Violation(s)`}
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {report.ok
                ? 'All mandatory pilot-to-contract procurement criteria have been verified in code.'
                : 'Direct contract conversion blocked to prevent procurement audit non-compliance.'}
            </p>
          </div>
        </div>

        {report.ok && onProceed && (
          <button
            type="button"
            disabled={isConverting}
            onClick={onProceed}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            {isConverting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Verification Rules (Section 10 State Engine):</span>
          <span>Success Rate: <strong className={report.successRate >= 70 ? 'text-emerald-400' : 'text-rose-400'}>{report.successRate}%</strong> (Min 70% Req)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {report.rules.map((rule) => (
            <div
              key={rule.ruleNumber}
              className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs transition-colors ${
                rule.passed
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-rose-900/20 border-rose-600/30 text-rose-200'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {rule.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-white">
                  Rule {rule.ruleNumber}: {rule.name}
                </div>
                <div className={`text-[11px] ${rule.passed ? 'text-slate-400' : 'text-rose-300'}`}>
                  {rule.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fail reasons callout if failed */}
      {!report.ok && report.reasons.length > 0 && (
        <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg">
          <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 mb-1.5">
            <Info className="w-3.5 h-3.5 text-rose-400" />
            <span>Audit Block Reasons (Must be rectified before conversion):</span>
          </div>
          <ul className="list-disc list-inside text-xs text-rose-200/90 space-y-1">
            {report.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
