'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Rocket,
  ShieldCheck,
  ShieldAlert,
  Building2,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Award,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { loadState, updateStartupVerification, Startup } from '@/lib/departmentStore';

export default function StartupProfilePage() {
  const { showToast } = useToast();
  const [currentStartup, setCurrentStartup] = useState<Startup | null>(null);
  const [allStartups, setAllStartups] = useState<Startup[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const loadData = () => {
    const state = loadState();
    setAllStartups(state.startups);

    const saved = localStorage.getItem('navsetu_session');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        const s = state.startups.find((item) => item.id === user.org_id || item.name === user.org_name);
        if (s) {
          setCurrentStartup(s);
          return;
        }
      } catch {
        // ignore
      }
    }
    setCurrentStartup(state.startups[0]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVerification = (targetId: string, currentStatus: boolean) => {
    setIsVerifying(true);
    setTimeout(() => {
      try {
        const updated = updateStartupVerification(targetId, !currentStatus);
        setIsVerifying(false);
        loadData();

        // Also update stored session if it corresponds to current user
        const saved = localStorage.getItem('navsetu_session');
        if (saved) {
          const user = JSON.parse(saved);
          if (user.org_id === targetId) {
            user.verified = !currentStatus;
            localStorage.setItem('navsetu_session', JSON.stringify(user));
          }
        }

        if (!currentStatus) {
          showToast(`DPIIT Certificate validated! ${updated.name} is now certified for direct procurement bids.`, 'success');
        } else {
          showToast(`${updated.name} reverted to unverified state (bids will now be blocked).`, 'info');
        }
      } catch (e: any) {
        showToast(e.message || 'Verification update failed', 'error');
        setIsVerifying(false);
      }
    }, 600);
  };

  if (!currentStartup) {
    return (
      <div className="p-12 text-center text-zinc-500">Loading profile...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
          Startup Profile & Statutory DPIIT Registry
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Department for Promotion of Industry and Internal Trade (DPIIT) Recognition Credentials & Eligibility Status.
        </p>
      </div>

      {/* Current Active Startup Profile */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-black text-white shadow-2xs">
              {currentStartup.verified ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950">{currentStartup.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                  {currentStartup.dpiit_id}
                </span>
                <span className="text-xs text-zinc-500">• Founder: {currentStartup.founder}</span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => handleToggleVerification(currentStartup.id, currentStartup.verified)}
              disabled={isVerifying}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                currentStartup.verified
                  ? 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-300'
                  : 'bg-black text-white hover:bg-zinc-800 shadow-md'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>
                {isVerifying
                  ? 'Calling DPIIT API...'
                  : currentStartup.verified
                  ? 'Simulate DPIIT Revocation'
                  : 'Simulate DPIIT Verification'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
            <span className="text-zinc-400 block font-medium">Domain Sector</span>
            <span className="font-bold text-zinc-800 text-sm">{currentStartup.sector}</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
            <span className="text-zinc-400 block font-medium">DPIIT Recognition Status</span>
            <span className={`font-bold text-sm ${currentStartup.verified ? 'text-zinc-950' : 'text-zinc-500'}`}>
              {currentStartup.verified ? 'VERIFIED (Active)' : 'UNVERIFIED (Pending)'}
            </span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
            <span className="text-zinc-400 block font-medium">GeM Startup Runway Status</span>
            <span className="font-bold text-zinc-950 text-sm">Direct Award Eligible</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 space-y-1">
          <p className="font-bold text-zinc-950 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-zinc-900" />
            <span>Statutory Rule 149(viii) Procurement Exemption Guarantee</span>
          </p>
          <p className="text-zinc-600 leading-relaxed">
            DPIIT-verified startups enjoy exemption from prior turnover and experience conditions under General Financial Rules (GFR) 2017 when completing an audited NavSetu milestone pilot.
          </p>
        </div>
      </div>

      {/* Multi-Entity Demo Switcher */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-zinc-950 mb-1">
          All Seeded Demo Startup Entities
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Test how different startups interact with eligibility checks across different ministries.
        </p>

        <div className="space-y-3">
          {allStartups.map((s) => (
            <div
              key={s.id}
              className="p-3.5 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-zinc-300 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-950 text-xs">{s.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {s.dpiit_id}
                  </span>
                  <span className="text-[10px] text-zinc-500">• {s.sector}</span>
                </div>
                <p className="text-[11px] text-zinc-500">Founder: {s.founder}</p>
              </div>

              <div className="flex items-center gap-2">
                {s.verified ? (
                  <span className="text-[11px] font-bold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-zinc-900" />
                    Verified
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300 flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3 text-zinc-500" />
                    Unverified
                  </span>
                )}

                <button
                  onClick={() => handleToggleVerification(s.id, s.verified)}
                  className="text-[11px] font-semibold text-zinc-900 hover:underline underline-offset-2 ml-2"
                >
                  Toggle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
