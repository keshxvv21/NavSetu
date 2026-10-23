'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  PlusCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Users,
  ShieldCheck,
  Layers,
  RotateCcw,
  Search
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import {
  loadState,
  resetState,
  Problem,
  Pilot
} from '@/lib/departmentStore';

export default function DepartmentDashboard() {
  const { showToast } = useToast();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_pilot' | 'converted'>('all');
  const [activeTab, setActiveTab] = useState<'problems' | 'pilots' | 'contracts'>('problems');

  const refreshData = () => {
    const state = loadState();
    setProblems(state.problems);
    setPilots(state.pilots);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleResetSeed = () => {
    resetState();
    refreshData();
    showToast('Platform reset to initial seed state successfully!', 'success');
  };

  // KPIs
  const totalProblems = problems.length;
  const activePilots = pilots.filter((p) => p.status === 'active').length;
  const convertedContracts = pilots.filter((p) => p.status === 'converted').length;

  // Filtered problems
  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Converted pilots
  const convertedPilots = pilots.filter((p) => p.status === 'converted');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Department Header */}
      <div className="p-6 sm:p-8 bg-white rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
              <Building2 className="w-4 h-4" />
              <span>Ministry of Jal Shakti • Dept. of Drinking Water & Sanitation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              Department Procurement Command Center
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl mt-1.5 leading-relaxed font-normal">
              Identify real governance bottlenecks, commission agile startup pilot trials, and convert successful innovations into audit-verified contracts in under 30 days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetSeed}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black bg-white hover:bg-zinc-100 border border-zinc-300 shadow-2xs transition-colors"
              title="Reset state to original demo seed data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span>Reset Seed</span>
            </button>
            <Link
              href="/department/post-problem"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-black hover:bg-zinc-800 shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Problem</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Challenges</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950">{totalProblems}</div>
            <div className="text-xs text-zinc-600 mt-1 flex items-center gap-1 font-medium">
              <span className="text-zinc-950 font-bold">{problems.filter(p => p.status === 'open').length} open</span>
              <span>for startup proposals</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Pilots</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950">{activePilots}</div>
            <div className="text-xs text-zinc-600 mt-1 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              <span>Milestone tracking in progress</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contracts Converted</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950">{convertedContracts}</div>
            <div className="text-xs text-zinc-600 mt-1 flex items-center gap-1 font-medium">
              <span className="font-bold text-zinc-950">GFR 149(viii)</span>
              <span>Statutory Conversion</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Avg Procurement Time</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950">9 Days</div>
            <div className="text-xs text-zinc-600 mt-1 flex items-center gap-1 font-medium">
              <span className="font-semibold text-zinc-950">vs 18–24 mo</span>
              <span>traditional tender</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('problems')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'problems'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Department Problems ({problems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pilots')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pilots'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live Pilots ({pilots.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'contracts'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Contracts ({convertedPilots.length})</span>
          </button>
        </div>

        {activeTab === 'problems' && (
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search challenges or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-zinc-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black transition-colors w-48 sm:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-700 focus:outline-none focus:border-black"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_pilot">In Pilot</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: PROBLEMS */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          {filteredProblems.length === 0 ? (
            <EmptyState
              title="No Department Challenges Found"
              description="Post a problem statement to invite verified DPIIT startups to submit agile pilot proposals."
              actionLabel="Post Challenge"
              actionHref="/department/post-problem"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="p-5 sm:p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs hover:border-zinc-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {problem.id}
                      </span>
                      <StatusBadge status={problem.status} />
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
                        {problem.sector}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight">
                      {problem.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 line-clamp-2 max-w-3xl leading-relaxed">
                      {problem.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-zinc-600">
                      <div>
                        Budget Cap:{' '}
                        <strong className="text-zinc-950 font-bold font-mono">
                          INR {problem.budget_cap.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        Deadline:{' '}
                        <strong className="text-zinc-950 font-bold">{problem.deadline}</strong>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-900 font-semibold">
                        <Users className="w-3.5 h-3.5 text-zinc-700" />
                        <span>{problem.application_count || 0} Startup Applications</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-200">
                    {problem.status === 'in_pilot' && problem.active_pilot_id ? (
                      <Link
                        href={`/department/pilots/${problem.active_pilot_id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-black hover:bg-zinc-800 text-white shadow-xs transition-colors"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Open Pilot Tracker</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : problem.status === 'converted' && problem.active_pilot_id ? (
                      <Link
                        href={`/department/pilots/${problem.active_pilot_id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-950 shadow-2xs transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
                        <span>View Contract Audit</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/department/problems/${problem.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-black hover:bg-zinc-800 text-white shadow-xs transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Review Applicants</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: LIVE PILOTS */}
      {activeTab === 'pilots' && (
        <div className="space-y-4">
          {pilots.length === 0 ? (
            <EmptyState
              title="No Pilots Active"
              description="Review applications and commission a pilot to monitor milestone execution."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pilots.map((pilot) => {
                const totalM = pilot.milestones.length;
                const metM = pilot.milestones.filter((m) => m.status === 'met').length;
                const pendingM = pilot.milestones.filter(
                  (m) => m.status === 'pending' || m.status === 'submitted'
                ).length;

                return (
                  <div
                    key={pilot.id}
                    className="p-5 sm:p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs hover:border-zinc-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {pilot.id}
                        </span>
                        <StatusBadge status={pilot.status} />
                        <span className="text-xs text-zinc-500 font-medium">
                          Partner Startup:{' '}
                          <strong className="text-zinc-950 font-bold">{pilot.startup_name}</strong>
                          {pilot.startup_dpiit && ` (${pilot.startup_dpiit})`}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight">
                        {pilot.problem_title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-zinc-600">
                        <div>
                          Pilot Budget:{' '}
                          <strong className="text-zinc-950 font-bold font-mono">
                            INR {pilot.budget.toLocaleString('en-IN')}
                          </strong>
                        </div>
                        <div>
                          Schedule:{' '}
                          <strong className="text-zinc-950 font-bold">
                            {pilot.start_date} to {pilot.end_date}
                          </strong>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                          <span>Milestones: {metM}/{totalM} Met</span>
                          {pendingM > 0 && (
                            <span className="text-zinc-600">({pendingM} awaiting evaluation)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-200">
                      <Link
                        href={`/department/pilots/${pilot.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-black hover:bg-zinc-800 text-white shadow-xs transition-colors"
                      >
                        <span>Open Pilot Tracker</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: CONVERTED CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          {convertedPilots.length === 0 ? (
            <EmptyState
              title="No Converted Contracts Yet"
              description="Complete and evaluate 70%+ of milestones in an active pilot to execute conversion under GFR Rule 149(viii)."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {convertedPilots.map((pilot) => (
                <div
                  key={pilot.id}
                  className="p-5 sm:p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs hover:border-zinc-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-300">
                        {pilot.contract_id || pilot.id}
                      </span>
                      <StatusBadge status="converted" />
                      <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                        Tamper-Evident SHA-256 Hashed
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight">
                      {pilot.problem_title}
                    </h3>

                    <div className="text-xs text-zinc-600 space-y-1">
                      <p>
                        Awardee Startup: <strong>{pilot.startup_name}</strong> • Contract Value:{' '}
                        <strong className="text-zinc-950 font-mono">
                          INR {(pilot.contract_value || pilot.budget).toLocaleString('en-IN')}
                        </strong>
                      </p>
                      <p className="text-zinc-500 text-[11px]">
                        Statutory Reference:{' '}
                        <span className="text-zinc-900 font-semibold">{pilot.rule_reference}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-200">
                    <Link
                      href={`/contracts/${pilot.contract_id || pilot.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-black hover:bg-zinc-800 text-white shadow-xs transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>View Dossier & PDF</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
