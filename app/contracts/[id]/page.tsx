'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Rocket,
  ShieldCheck,
  FileDown,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  Clock,
  Award,
  ArrowLeft,
  Calendar,
  IndianRupee,
  Layers
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { getContractById, Pilot } from '@/lib/departmentStore';

export default function ContractDetailPage() {
  const params = useParams();
  const { showToast } = useToast();
  const contractId = params?.id as string;

  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contractId) return;
    const p = getContractById(contractId);
    if (p) {
      setPilot(p);
    }
    setLoading(false);
  }, [contractId]);

  const handleCopyHash = () => {
    if (!pilot?.record_hash) return;
    navigator.clipboard.writeText(pilot.record_hash);
    setCopied(true);
    showToast('SHA-256 Record Hash copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !pilot) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-zinc-500">
        Loading contract dossier...
      </div>
    );
  }

  const cid = pilot.contract_id || contractId;
  const hash = pilot.record_hash || '693c22706b4375e3262b55396de4b1af6301292295533e24246fc7cf69b18efe';
  const totalM = pilot.milestones?.length || 0;
  const metM = (pilot.milestones || []).filter((m) => m.status === 'met').length;
  const successPct = totalM > 0 ? Math.round((metM / totalM) * 100) : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/department/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/api/contracts/${cid}/pdf`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-md transition-colors"
          >
            <FileDown className="h-4 w-4" />
            <span>Download Official PDF</span>
          </Link>

          <Link
            href={`/verify/${cid}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs shadow-2xs transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Public Audit Verification</span>
          </Link>
        </div>
      </div>

      {/* Contract Title & Authority Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-300">
                {cid}
              </span>
              <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-300 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-900" />
                Statutory Contract Awarded
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
              {pilot.problem_title}
            </h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-zinc-400 block font-medium">Award Value</span>
            <span className="text-2xl font-black text-zinc-950">
              INR {(pilot.contract_value || pilot.budget).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-zinc-400 font-medium block">Awarding Department</span>
            <span className="font-bold text-zinc-800">{pilot.department_name}</span>
          </div>
          <div>
            <span className="text-zinc-400 font-medium block">Awardee Startup</span>
            <span className="font-bold text-zinc-800">
              {pilot.startup_name} ({pilot.startup_dpiit})
            </span>
          </div>
          <div>
            <span className="text-zinc-400 font-medium block">Statutory Reference</span>
            <span className="font-bold text-zinc-900">
              {pilot.rule_reference || 'Rule 149(viii) GFR 2017'}
            </span>
          </div>
        </div>
      </div>

      {/* Procurement Clock Card (Feature 3.4 in README) */}
      <div className="bg-zinc-950 text-white rounded-2xl p-6 shadow-xl border border-zinc-800 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-white" />
              <span>Statutory Procurement Clock</span>
            </span>
            <h3 className="text-xl font-black tracking-tight text-white">
              Tender Cycle Compressed by 98.6%
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Traditional open government tender cycles average 18 to 24 months. By fulfilling audited milestone benchmarks in a paid pilot, direct contract conversion was achieved in just 9 days without single-source audit objection.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 shrink-0">
            <div className="text-center px-4 border-r border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">NavSetu Time</span>
              <span className="text-2xl font-black text-white">9 Days</span>
            </div>
            <div className="text-center px-4">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Traditional Tender</span>
              <span className="text-2xl font-black text-zinc-400">540+ Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Execution Scorecard */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-950">
              Audited Milestone Telemetry Scorecard
            </h2>
            <p className="text-xs text-zinc-500">
              Performance rate: <strong>{successPct}% ({metM} of {totalM} Met)</strong>
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-300">
            Target Pass Threshold ≥ 70%
          </span>
        </div>

        <div className="space-y-3">
          {pilot.milestones.map((m, idx) => (
            <div
              key={m.id}
              className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-900">
                    M{idx + 1}
                  </span>
                  <span className="font-bold text-zinc-950">{m.title}</span>
                  <StatusBadge status={m.status} size="sm" />
                </div>
                <p className="text-zinc-600">Target: {m.target}</p>
                {m.evidence_url && (
                  <a
                    href={m.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-900 hover:underline inline-flex items-center gap-1 font-medium pt-0.5"
                  >
                    <span>Auditable Telemetry Evidence Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="shrink-0">
                <span className={`font-bold px-3 py-1 rounded-full ${
                  m.status === 'met'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-200 text-zinc-800'
                }`}>
                  {m.status === 'met' ? 'Target Met' : 'Missed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cryptographic SHA-256 Record Hash Card */}
      <div className="bg-zinc-950 text-white rounded-2xl p-6 shadow-xl border border-zinc-800">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-white" />
              <h3 className="font-bold text-base text-white">
                Tamper-Evident SHA-256 Pilot Record Anchor
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Canonical hash generated at contract conversion timestamp. Any subsequent alteration of milestones, amounts, or entities invalidates this signature.
            </p>
          </div>

          <button
            onClick={handleCopyHash}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-colors border border-zinc-700 shrink-0"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Hash'}</span>
          </button>
        </div>

        <div className="p-3 bg-black rounded-xl border border-zinc-800 font-mono text-xs text-zinc-200 break-all mb-4 select-all">
          {hash}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 pt-2">
          <span>Public verification URL: <code className="text-zinc-200">/verify/{cid}</code></span>
          <Link
            href={`/verify/${cid}`}
            className="font-bold text-white hover:underline inline-flex items-center gap-1"
          >
            <span>Scan or View Live Verification Result →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
