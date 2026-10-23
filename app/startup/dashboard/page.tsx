'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Rocket,
  Search,
  Building2,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  Layers,
  Award
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import {
  loadState,
  Pilot,
  Application,
  Startup,
} from '@/lib/departmentStore';

export default function StartupDashboard() {
  const [currentStartup, setCurrentStartup] = useState<Startup | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [activeTab, setActiveTab] = useState<'pilots' | 'applications'>('pilots');

  useEffect(() => {
    const state = loadState();
    let startup = state.startups[0]; // default AquaSense

    const saved = localStorage.getItem('navsetu_session');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        const found = state.startups.find((s) => s.id === user.org_id || s.name === user.org_name);
        if (found) startup = found;
      } catch {
        // ignore
      }
    }
    setCurrentStartup(startup);

    // Filter startup's applications
    const apps = state.applications.filter((a) => a.startup_id === startup.id);
    setApplications(apps);

    // Filter startup's pilots
    const userPilots = state.pilots.filter(
      (p) =>
        p.startup_name?.toLowerCase().includes(startup.name.toLowerCase()) ||
        p.startup_dpiit === startup.dpiit_id
    );
    setPilots(userPilots);
  }, []);

  const activePilots = pilots.filter((p) => p.status === 'active');
  const convertedPilots = pilots.filter((p) => p.status === 'converted');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Startup Welcome Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
              Startup Pilot Dashboard
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-300">
              {currentStartup?.dpiit_id || 'DIPP-89211'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Organization: <strong>{currentStartup?.name}</strong> • Sector: {currentStartup?.sector}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/startup/browse"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Browse Open Problems</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Submitted Proposals
            </span>
            <FileText className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="text-3xl font-black text-zinc-950 mt-2">{applications.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Across Indian ministries & missions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Active Validation Pilots
            </span>
            <Rocket className="h-4 w-4 text-zinc-900" />
          </div>
          <p className="text-3xl font-black text-zinc-950 mt-2">{activePilots.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Live telemetry milestone monitoring</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Converted Contracts
            </span>
            <Award className="h-4 w-4 text-zinc-900" />
          </div>
          <p className="text-3xl font-black text-zinc-950 mt-2">{convertedPilots.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Fast-track direct statutory awards</p>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 mb-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('pilots')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'pilots'
              ? 'bg-black text-white shadow-xs'
              : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
          }`}
        >
          My Pilots & Milestones ({pilots.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'applications'
              ? 'bg-black text-white shadow-xs'
              : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
          }`}
        >
          My Applications & Proposals ({applications.length})
        </button>
      </div>

      {/* Tab Content: Pilots */}
      {activeTab === 'pilots' && (
        <div className="space-y-4">
          {pilots.length === 0 ? (
            <EmptyState
              title="No active pilots underway"
              description="Apply to open department challenges to win paid field validation pilots."
            />
          ) : (
            pilots.map((pilot) => {
              const totalM = pilot.milestones?.length || 0;
              const metM = (pilot.milestones || []).filter((m) => m.status === 'met').length;
              const reviewedM = (pilot.milestones || []).filter(
                (m) => m.status === 'met' || m.status === 'missed'
              ).length;
              const pendingSubmit = (pilot.milestones || []).filter((m) => m.status === 'pending').length;

              return (
                <div
                  key={pilot.id}
                  className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 hover:border-zinc-300 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-300">
                          {pilot.id}
                        </span>
                        <StatusBadge status={pilot.status} />
                        <span className="text-xs text-zinc-500">
                          • {pilot.department_name || 'Government Department'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                        {pilot.problem_title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      {pilot.status === 'active' ? (
                        <Link
                          href={`/startup/pilots/${pilot.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          <span>Submit Milestone Evidence</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/contracts/${pilot.contract_id || pilot.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs shadow-2xs transition-colors"
                        >
                          <span>View Contract & PDF</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar & Details */}
                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-400 font-medium block">Pilot Budget</span>
                      <span className="font-extrabold text-zinc-950">
                        INR {pilot.budget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-medium block">Timeline</span>
                      <span className="font-bold text-zinc-800">
                        {pilot.start_date} to {pilot.end_date}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-medium block">Milestone Progress</span>
                      <span className="font-bold text-zinc-950">
                        {metM} of {totalM} Met ({reviewedM} Reviewed)
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-medium block">Action Needed</span>
                      <span className={`font-bold ${pendingSubmit > 0 ? 'text-zinc-900' : 'text-zinc-600'}`}>
                        {pendingSubmit > 0 ? `${pendingSubmit} Evidence Link(s) Pending` : 'All Evidence Uploaded'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content: Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <EmptyState
              title="No proposals submitted yet"
              description="Explore challenges on the browse page to submit pilot applications."
            />
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-500">{app.id}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed max-w-2xl line-clamp-2">
                    "{app.pitch}"
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-medium pt-1">
                    <span>Proposed Budget: <strong>INR {app.proposed_budget.toLocaleString('en-IN')}</strong></span>
                    <span>Timeline: <strong>{app.pilot_timeline_weeks} Weeks</strong></span>
                  </div>
                </div>

                <span className="text-xs text-zinc-400">
                  {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
