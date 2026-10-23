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
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Converted pilots
  const convertedPilots = pilots.filter((p) => p.status === 'converted');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Department Header */}
      <div className="gov-card p-6 sm:p-8 bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1.5">
              <Building2 className="w-4 h-4" />
              <span>Ministry of Jal Shakti • Dept. of Drinking Water & Sanitation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Department Procurement Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed font-normal">
              Identify real governance bottlenecks, commission agile startup pilot trials, and convert successful innovations into audit-verified contracts in under 30 days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetSeed}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
              title="Reset state to original demo seed data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Seed</span>
            </button>
            <Link
              href="/department/post-problem"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-xs transition-colors"
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
        <div className="gov-card p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Challenges</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalProblems}</div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1 font-medium">
              <span className="text-blue-700 font-bold">{problems.filter(p => p.status === 'open').length} open</span>
              <span>for startup proposals</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="gov-card p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Active Pilots</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{activePilots}</div>
            <div className="text-xs text-purple-800 mt-1 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              <span>Milestone tracking in progress</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="gov-card p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Procured Contracts</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{convertedContracts}</div>
            <div className="text-xs text-emerald-800 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tamper-evident hashed</span>
            </div>
          </div>
        </div>

        {/* Card 4: Procurement Clock / Speed */}
        <div className="gov-card p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Turnaround Speed</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">~14 Days</div>
            <div className="text-xs text-slate-600 mt-1 font-medium">
              vs <span className="line-through text-slate-400">18-24 months</span> legacy tender
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('problems')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'problems'
                ? 'bg-blue-50 text-blue-900 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Department Problems ({problems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pilots')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pilots'
                ? 'bg-purple-50 text-purple-900 border border-purple-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span>Live Pilots ({pilots.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'contracts'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Contracts ({convertedPilots.length})</span>
          </button>
        </div>

        {activeTab === 'problems' && (
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search challenges or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors w-48 sm:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-600"
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
                  className="gov-card gov-card-hover p-5 sm:p-6 bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <StatusBadge status={problem.status} size="sm" />
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {problem.sector}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Posted {new Date(problem.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      {problem.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-700 line-clamp-2 leading-relaxed">
                      {problem.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-slate-600">
                      <div>
                        Budget Cap:{' '}
                        <strong className="text-slate-900 font-bold font-mono">
                          ₹{problem.budget_cap.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        Deadline:{' '}
                        <strong className="text-slate-900 font-bold">{problem.deadline}</strong>
                      </div>
                      <div className="flex items-center gap-1 text-blue-700 font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{problem.application_count || 0} Startup Applications</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
                    {problem.status === 'in_pilot' && problem.active_pilot_id ? (
                      <Link
                        href={`/department/pilots/${problem.active_pilot_id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-colors"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Open Pilot Tracker</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : problem.status === 'converted' && problem.active_pilot_id ? (
                      <Link
                        href={`/department/pilots/${problem.active_pilot_id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>View Contract Audit</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/department/problems/${problem.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors"
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
                  className="gov-card p-5 sm:p-6 bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={pilot.status} size="sm" />
                      <span className="text-xs font-mono font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {pilot.id}
                      </span>
                      {pilot.startup_dpiit && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {pilot.startup_dpiit} Verified
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      {pilot.problem_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
                      <div>
                        Partner Startup:{' '}
                        <strong className="text-slate-900 font-bold">{pilot.startup_name}</strong>
                      </div>
                      <div>
                        Pilot Budget:{' '}
                        <strong className="text-emerald-800 font-bold font-mono">
                          ₹{pilot.budget.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        Timeline:{' '}
                        <span className="text-slate-700 font-medium">
                          {pilot.start_date} to {pilot.end_date}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2 max-w-md">
                      <div className="flex items-center justify-between text-xs mb-1 font-medium">
                        <span className="text-slate-700">
                          Milestones: <strong className="text-slate-900">{metCount} of {totalCount} Met</strong>
                        </span>
                        <span className={`font-bold ${rate >= 70 ? 'text-emerald-800' : 'text-amber-800'}`}>
                          {rate}% (Threshold 70%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${rate >= 70 ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/department/pilots/${pilot.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-colors"
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
                  className="gov-card p-5 sm:p-6 bg-white border border-emerald-300 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status="converted" size="sm" />
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {pilot.contract_id}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                        {pilot.problem_title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Awarded to <strong className="text-slate-900">{pilot.startup_name}</strong> under{' '}
                        <span className="text-blue-800 font-semibold">{pilot.rule_reference}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/department/pilots/${pilot.id}`}
                        className="px-3.5 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition-colors"
                      >
                        Pilot Tracker
                      </Link>
                      <Link
                        href={`/verify/${pilot.contract_id || pilot.id}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Public Audit Proof</span>
                      </Link>
                    </div>
                  </div>

                  {/* Hash Snippet in clean light box */}
                  {pilot.record_hash && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="text-slate-900 font-bold uppercase text-[10px]">SHA-256 Digest:</span>
                        <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
                          {pilot.record_hash}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-bold shrink-0 flex items-center gap-1 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Immutable Hash Stored
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
