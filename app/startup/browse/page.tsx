'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Building2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { loadState, Problem, Startup } from '@/lib/departmentStore';
import { checkStartupEligibility } from '@/lib/services/eligibilityService';

const SECTORS = [
  'All Sectors',
  'Water & Sanitation',
  'Smart Mobility',
  'Healthcare',
  'Smart Mobility & Transit',
];

export default function BrowseProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentStartup, setCurrentStartup] = useState<Startup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_pilot'>('all');

  useEffect(() => {
    const state = loadState();
    setProblems(state.problems);

    // Get active startup from session or default to AquaSense
    const saved = localStorage.getItem('navsetu_session');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        const found = state.startups.find((s) => s.id === user.org_id || s.name === user.org_name);
        if (found) {
          setCurrentStartup(found);
          return;
        }
      } catch {
        // ignore
      }
    }
    setCurrentStartup(state.startups[0]); // default AquaSense (verified)
  }, []);

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.department_name && p.department_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSector =
      selectedSector === 'All Sectors' ||
      p.sector.toLowerCase().includes(selectedSector.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : p.status === statusFilter;

    return matchesSearch && matchesSector && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Startup Context Banner */}
      <div className="mb-6 p-4 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black text-white shadow-2xs">
            {currentStartup?.verified ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-950 text-sm">
                {currentStartup?.name || 'AquaSense Analytics Pvt Ltd'}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                {currentStartup?.dpiit_id || 'DIPP-89211'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Sector: <strong>{currentStartup?.sector}</strong> • Founder: {currentStartup?.founder}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentStartup?.verified ? (
            <div className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-zinc-900" />
              <span>DPIIT Recognition Verified (Eligible to Apply)</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-400 text-zinc-900 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-zinc-700" />
              <span>DPIIT Verification Pending (Applications Blocked)</span>
            </div>
          )}
          <Link
            href="/startup/profile"
            className="text-xs font-bold text-zinc-900 hover:text-black underline underline-offset-4"
          >
            Manage Profile
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
          Browse Government Problem Challenges
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Discover active operational pain-points posted by Indian central & state ministries. Win paid validation pilots with guaranteed statutory fast-track procurement.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs mb-6 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search challenges by keyword, sector, or ministry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-black focus:border-black"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full py-2 px-3 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-black focus:border-black bg-white"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
              statusFilter === 'all'
                ? 'bg-black text-white border-black'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
              statusFilter === 'open'
                ? 'bg-black text-white border-black'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setStatusFilter('in_pilot')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
              statusFilter === 'in_pilot'
                ? 'bg-black text-white border-black'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            Piloting
          </button>
        </div>
      </div>

      {/* Challenge Cards Grid */}
      {filteredProblems.length === 0 ? (
        <EmptyState
          title="No matching government challenges"
          description="Try loosening your search terms or selecting 'All Sectors' to view open challenges."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProblems.map((prob) => {
            const eligibility = currentStartup
              ? checkStartupEligibility(currentStartup, prob)
              : { eligible: true, badge: 'Eligible', badgeColor: 'emerald' as const };

            const isOpen = prob.status === 'open';

            return (
              <div
                key={prob.id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-xs hover:border-zinc-400 hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {prob.sector}
                    </span>
                    <StatusBadge status={prob.status} />
                  </div>

                  {/* Department name */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-semibold mb-2">
                    <Building2 className="h-3.5 w-3.5 text-zinc-800" />
                    <span>{prob.department_name || 'Government Department'}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-zinc-950 leading-snug tracking-tight mb-3">
                    {prob.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3 mb-4">
                    {prob.description}
                  </p>

                  {/* Badges / Metrics */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-100 mb-4 text-xs">
                    <div>
                      <span className="text-zinc-400 font-medium block">Pilot Budget Cap</span>
                      <span className="font-extrabold text-zinc-950 text-sm">
                        INR {prob.budget_cap.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-medium block">Submission Deadline</span>
                      <span className="font-bold text-zinc-800">{prob.deadline}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Eligibility Badge & Apply Action */}
                <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    {eligibility.eligible ? (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300">
                        <ShieldCheck className="h-3.5 w-3.5 text-zinc-900" />
                        <span>{eligibility.badge}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300">
                        <ShieldAlert className="h-3.5 w-3.5 text-zinc-600" />
                        <span>{eligibility.badge}</span>
                      </div>
                    )}
                  </div>

                  {isOpen ? (
                    <Link
                      href={`/startup/apply/${prob.id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <span>Apply for Pilot</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">
                      {prob.status === 'in_pilot' ? 'Pilot underway' : 'Converted to Contract'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
