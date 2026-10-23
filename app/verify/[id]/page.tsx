'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  Rocket,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  ExternalLink,
  Lock,
  Unlock,
  AlertTriangle,
  Award,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function PublicVerifyPage() {
  const params = useParams();
  const { showToast } = useToast();
  const contractId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTampering, setIsTampering] = useState(false);

  const fetchVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/verify/${contractId}`);
      const json = await res.json();
      setData(json);
    } catch {
      showToast('Error connecting to statutory verification gateway', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) {
      fetchVerification();
    }
  }, [contractId]);

  const handleSimulateTamper = async () => {
    setIsTampering(true);
    try {
      const res = await fetch(`/api/verify/${contractId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tamper' }),
      });
      const json = await res.json();
      setData(json);
      showToast('Tampering simulated: Milestone modified in database. Verification seal is now flagged as mismatched.', 'error');
    } catch {
      showToast('Failed to trigger tamper simulation', 'error');
    } finally {
      setIsTampering(false);
    }
  };

  const handleRestoreGenuine = async () => {
    setIsTampering(true);
    try {
      const res = await fetch(`/api/verify/${contractId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });
      const json = await res.json();
      setData(json);
      showToast('Genuine record restored. Cryptographic hash verified.', 'success');
    } catch {
      showToast('Failed to restore record', 'error');
    } finally {
      setIsTampering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200 text-center max-w-sm w-full">
          <RefreshCw className="h-8 w-8 text-black animate-spin mx-auto mb-3" />
          <h2 className="font-bold text-zinc-950 text-base">Recomputing Cryptographic Hash...</h2>
          <p className="text-xs text-zinc-500 mt-1">Verifying canonical pilot JSON against stored audit anchor</p>
        </div>
      </div>
    );
  }

  const isVerified = Boolean(data?.verified);
  const storedHash = data?.storedHash || '';
  const computedHash = data?.computedHash || '';
  const pilot = data?.pilot;
  const summary = data?.summary;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to NavSetu Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-zinc-900 text-white px-2.5 py-1 rounded-lg shadow-2xs">
            Portal: Public Audit
          </span>
        </div>
      </div>

      {/* Verification Result Hero Card */}
      <div
        className={`rounded-3xl border-2 p-6 sm:p-8 shadow-xl transition-all mb-8 ${
          isVerified
            ? 'bg-zinc-950 text-white border-black'
            : 'bg-white text-zinc-950 border-zinc-900'
        }`}
      >
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 mb-6 ${
          isVerified ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                isVerified ? 'bg-zinc-900 text-white border border-zinc-700' : 'bg-black text-white'
              }`}
            >
              {isVerified ? (
                <ShieldCheck className="h-8 w-8 text-white" />
              ) : (
                <ShieldAlert className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isVerified
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'bg-zinc-100 text-zinc-900 border border-zinc-300'
                  }`}
                >
                  {isVerified ? 'Statutory Audit Verified' : 'Integrity Mismatch Detected'}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight">
                {isVerified ? 'Record Unchanged Since Conversion' : 'Unauthorized Tampering Detected'}
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className={`text-xs block font-medium ${isVerified ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Contract Reference
            </span>
            <span className="font-mono font-bold text-sm">
              {summary?.contractId || contractId}
            </span>
          </div>
        </div>

        <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isVerified ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {isVerified
            ? 'All pilot telemetry milestones, target benchmarks, and award values match the original cryptographic anchor generated at conversion under GFR Rule 149(viii). Zero unauthorized modifications detected.'
            : 'The canonical SHA-256 hash of current pilot milestone telemetry differs from the anchor recorded at conversion. Data has been edited post-conversion.'}
        </p>

        {/* Hash Comparison Box */}
        <div className={`space-y-3 p-4 rounded-2xl border text-xs font-mono mb-6 ${
          isVerified ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-1 font-sans">
              <span>Stored Anchor Hash (At Conversion)</span>
              <span>Database Record</span>
            </div>
            <div className={`p-2.5 rounded-lg border break-all select-all ${
              isVerified ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-900'
            }`}>
              {storedHash}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-1 font-sans">
              <span>Live Computed Hash (Current State)</span>
              <span className="font-bold flex items-center gap-1">
                {isVerified ? (
                  <span className="text-white flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Exact Match
                  </span>
                ) : (
                  <span className="text-zinc-950 font-black flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Mismatch
                  </span>
                )}
              </span>
            </div>
            <div
              className={`p-2.5 rounded-lg border break-all select-all ${
                isVerified
                  ? 'bg-zinc-900 border-zinc-700 text-white'
                  : 'bg-zinc-200 border-zinc-400 text-black font-bold'
              }`}
            >
              {computedHash}
            </div>
          </div>
        </div>

        {/* Summary Badges */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div className={`p-3 rounded-xl border ${isVerified ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <span className="text-zinc-400 block">Department</span>
              <span className="font-bold truncate block">{summary.department}</span>
            </div>
            <div className={`p-3 rounded-xl border ${isVerified ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <span className="text-zinc-400 block">Awardee Startup</span>
              <span className="font-bold truncate block">{summary.startup}</span>
            </div>
            <div className={`p-3 rounded-xl border ${isVerified ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <span className="text-zinc-400 block">Success Rate</span>
              <span className="font-bold">{summary.successRate}% ({summary.metCount}/{summary.milestoneCount})</span>
            </div>
            <div className={`p-3 rounded-xl border ${isVerified ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <span className="text-zinc-400 block">Contract Value</span>
              <span className="font-extrabold">INR {summary.contractValue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Demo Presentation Tamper Simulator (Section 20 of README) */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-black" />
            <h3 className="font-bold text-sm text-zinc-950">
              Interactive Presentation / Audit Demonstration Controls
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
            30-Second Audit Test
          </span>
        </div>

        <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
          During judging demonstrations, click <strong>"Simulate Database Tamper"</strong> to flip a milestone's reviewed result. The verify screen immediately recomputes the hash and signals tampering to prove zero-trust integrity. Click <strong>"Restore Genuine Record"</strong> to return it to verified state.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSimulateTamper}
            disabled={isTampering || !isVerified}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-400 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors disabled:opacity-40"
          >
            <Unlock className="h-3.5 w-3.5 text-zinc-800" />
            <span>Simulate Database Tamper (Flip Milestone to Missed)</span>
          </button>

          <button
            onClick={handleRestoreGenuine}
            disabled={isTampering || isVerified}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-40"
          >
            <Lock className="h-3.5 w-3.5 text-white" />
            <span>Restore Genuine Record (Verify Match)</span>
          </button>

          <button
            onClick={fetchVerification}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Re-check</span>
          </button>
        </div>
      </div>

      {/* Milestone Detail List */}
      {pilot?.milestones && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-950 mb-4">
            Canonical Pilot Milestones & Evidence Logs
          </h3>
          <div className="space-y-3">
            {pilot.milestones.map((m: any, idx: number) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-600">M{idx + 1}</span>
                    <span className="font-bold text-zinc-950">{m.title}</span>
                  </div>
                  <p className="text-zinc-600 text-[11px] mt-0.5">Target: {m.target}</p>
                  {m.evidence_url && (
                    <a
                      href={m.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-900 hover:underline inline-flex items-center gap-1 mt-1 font-medium"
                    >
                      <span>Evidence Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <span
                  className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                    m.status === 'met'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-200 text-zinc-800'
                  }`}
                >
                  {m.status === 'met' ? 'Outcome: MET' : 'Outcome: MISSED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
