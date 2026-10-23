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
  Search,
  Filter,
  FileCheck2,
  Sparkles,
  ExternalLink
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
  const totalBudget = pilots.reduce((sum, p) => sum + (p.contract_value || p.budget), 0);

  // Filtered problems
  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Converted pilots
  const convertedPilots = pilots.filter((p) => p.status === 'converted');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Department Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/10 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1.5">
              <Building2 className="w-4 h-4" />
              <span>Ministry of Jal Shakti • Dept. of Drinking Water & Sanitation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Department Procurement Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Identify real governance bottlenecks, commission agile startup pilot trials, and convert successful innovations into audit-verified contracts in under 30 days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetSeed}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all"
              title="Reset state to original demo seed data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Seed</span>
            </button>
            <Link
              href="/department/post-problem"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/25 transition-all"
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
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Challenges</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-white">{totalProblems}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span className="text-blue-400 font-medium">{problems.filter(p => p.status === 'open').length} open</span>
              <span>for startup proposals</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Pilots</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-white">{activePilots}</div>
            <div className="text-[11px] text-purple-300 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>Milestone tracking in progress</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Procured Contracts</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{convertedContracts}</div>
            <div className="text-[11px] text-emerald-300 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tamper-evident hashed</span>
            </div>
          </div>
        </div>

        {/* Card 4: Procurement Clock / Value */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Turnaround Speed</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-white">~14 Days</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              vs <span className="line-through text-slate-500">18-24 months</span> legacy tender
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('problems')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'problems'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Department Problems ({problems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pilots')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pilots'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live Pilots ({pilots.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'contracts'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Contracts ({convertedPilots.length})</span>
          </button>
        </div>

        {activeTab === 'problems' && (
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search challenges or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors w-48 sm:w-60"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
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
              actionText="Post First Problem"
              actionHref="/department/post-problem"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="glass-panel glass-panel-hover p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <StatusBadge status={problem.status} size="sm" />
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {problem.sector}
                      </span>
                      <span className="text-xs text-slate-500">
                        Posted {new Date(problem.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {problem.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {problem.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-slate-400">
                      <div>
                        Budget Cap:{' '}
                        <strong className="text-slate-200">
                          ₹{problem.budget_cap.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        Deadline:{' '}
                        <strong className="text-slate-200">{problem.deadline}</strong>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <Users className="w-3.5 h-3.5" />
                        <span>{problem.application_count || 0} Startup Applications</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    {problem.status === 'in_pilot' && problem.active_pilot_id ? (
                      <Link
                        href={`/department/pilots/${problem.active_pilot_id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/25 transition-all"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Open Pilot Tracker</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : problem.status === 'converted' && problem.active_pilot_id ? (
                      <Link
                        href={`/department/pilots/${problem.active_pilot_id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>View Contract Audit</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/department/problems/${problem.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition-all"
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
          <div className="grid grid-cols-1 gap-4">
            {pilots.map((pilot) => {
              const metCount = pilot.milestones.filter((m) => m.status === 'met').length;
              const totalCount = pilot.milestones.length;
              const rate = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0;

              return (
                <div
                  key={pilot.id}
                  className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={pilot.status} size="sm" />
                      <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {pilot.id}
                      </span>
                      {pilot.startup_dpiit && (
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {pilot.startup_dpiit} Verified
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {pilot.problem_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
                      <div>
                        Partner Startup:{' '}
                        <strong className="text-white">{pilot.startup_name}</strong>
                      </div>
                      <div>
                        Pilot Budget:{' '}
                        <strong className="text-emerald-400">
                          ₹{pilot.budget.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        Timeline:{' '}
                        <span className="text-slate-400">
                          {pilot.start_date} to {pilot.end_date}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2 max-w-md">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">
                          Milestones: <strong className="text-white">{metCount} of {totalCount} Met</strong>
                        </span>
                        <span className={`font-semibold ${rate >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {rate}% (Threshold 70%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            rate >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/department/pilots/${pilot.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 transition-all"
                    >
                      <span>Track & Review Milestones</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: CONVERTED CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          {convertedPilots.length === 0 ? (
            <EmptyState
              title="No Converted Contracts Yet"
              description="When a pilot meets the 70% threshold and passes statutory audit checks, one click converts it into an official contract."
              actionText="View Active Pilots"
              onAction={() => setActiveTab('pilots')}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {convertedPilots.map((pilot) => (
                <div
                  key={pilot.id}
                  className="glass-panel p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status="converted" size="sm" />
                        <span className="text-xs font-mono text-emerald-300 font-semibold">
                          {pilot.contract_id}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                        {pilot.problem_title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Awarded to <strong className="text-white">{pilot.startup_name}</strong> under{' '}
                        <span className="text-emerald-400">{pilot.rule_reference}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/department/pilots/${pilot.id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                      >
                        Pilot Tracker
                      </Link>
                      <Link
                        href={`/verify/${pilot.contract_id || pilot.id}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Public Audit Proof</span>
                      </Link>
                    </div>
                  </div>

                  {/* Tamper Evident Hash Snippet */}
                  {pilot.record_hash && (
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-indigo-400 font-bold uppercase text-[10px]">SHA-256 Digest:</span>
                        <span className="text-slate-300 truncate max-w-xs sm:max-w-md">
                          {pilot.record_hash}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-400 shrink-0 flex items-center gap-1 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Immutable Hash Stored
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
