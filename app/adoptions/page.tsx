'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Building2,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  PlusCircle,
  Clock,
  Award,
  IndianRupee,
  Share2
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { loadState, getContracts, getAdoptions, createAdoption, Pilot } from '@/lib/departmentStore';

const PROCURING_DEPARTMENTS = [
  { id: 'dept-2', name: 'Ministry of Housing and Urban Affairs (Smart Cities Mission)' },
  { id: 'dept-3', name: 'Ministry of Health & Family Welfare (National Health Mission)' },
  { id: 'dept-4', name: 'Ministry of Agriculture & Farmers Welfare' },
  { id: 'dept-5', name: 'Ministry of Road Transport and Highways' },
];

export default function AdoptionsPage() {
  const { showToast } = useToast();
  const [provenContracts, setProvenContracts] = useState<any[]>([]);
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState(PROCURING_DEPARTMENTS[0].id);
  const [adoptionNotes, setAdoptionNotes] = useState('');
  const [isAdopting, setIsAdopting] = useState(false);

  const loadData = () => {
    const contracts = getContracts();
    const adoptionsList = getAdoptions();
    setProvenContracts(contracts);
    setAdoptions(adoptionsList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdoptModal = (c: any) => {
    setSelectedContract(c);
    setAdoptionNotes(
      `Fast-track adoption under GFR Rule 149(viii) for state deployment across 12 operational zones based on verified pilot telemetry.`
    );
  };

  const handleConfirmAdoption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    const deptObj = PROCURING_DEPARTMENTS.find((d) => d.id === selectedDeptId);
    if (!deptObj) return;

    setIsAdopting(true);
    try {
      const res = await fetch('/api/adoptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: selectedContract.contract_id,
          department_id: deptObj.id,
          department_name: deptObj.name,
          notes: adoptionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || 'Adoption failed', 'error');
        setIsAdopting(false);
        return;
      }

      showToast(`Success! Requisition created: ${deptObj.name} adopted solution!`, 'success');
      setSelectedContract(null);
      loadData();
    } catch {
      showToast('Error during adoption registration', 'error');
    } finally {
      setIsAdopting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300">
            Scale Phase (Identify → Pilot → Procure → Scale)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
          Inter-Departmental Solution Scale & Adoption Registry
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-3xl leading-relaxed">
          Proven, milestone-audited pilot solutions can be directly adopted across other government ministries and state bodies without repeating costly 18-month tender qualifications.
        </p>
      </div>

      {/* Proven Contracts Showcase */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-zinc-950">
            Verified Solutions Ready for Direct Procurement ({provenContracts.length})
          </h2>
          <span className="text-xs text-zinc-500 font-mono">GFR 149(viii) Multi-Agency Eligible</span>
        </div>

        {provenContracts.length === 0 ? (
          <EmptyState
            title="No converted solutions yet"
            description="Complete and convert active pilots in the Department Tracker to populate this scaling registry."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {provenContracts.map((c) => {
              const pilot: Pilot = c.pilot;
              const totalM = pilot.milestones?.length || 0;
              const metM = (pilot.milestones || []).filter((m) => m.status === 'met').length;
              const successPct = totalM > 0 ? Math.round((metM / totalM) * 100) : 100;

              return (
                <div
                  key={c.contract_id}
                  className="bg-white rounded-2xl border border-zinc-200 shadow-xs hover:border-zinc-400 hover:shadow-md transition-all p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300">
                        {c.contract_id}
                      </span>
                      <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-300 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-zinc-900" />
                        Audited 100%
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-950 leading-snug tracking-tight mb-2">
                      {pilot.problem_title}
                    </h3>

                    <div className="text-xs text-zinc-600 space-y-1 mb-4">
                      <p>Originating Dept: <strong>{pilot.department_name}</strong></p>
                      <p>Awardee Startup: <strong>{pilot.startup_name}</strong> ({pilot.startup_dpiit})</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-100 text-xs mb-4">
                      <div>
                        <span className="text-zinc-400 block font-medium">Pilot Success Benchmark</span>
                        <span className="font-extrabold text-zinc-950 text-sm">
                          {successPct}% ({metM}/{totalM} Milestones Met)
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block font-medium">Validated Contract Value</span>
                        <span className="font-extrabold text-zinc-950 text-sm">
                          INR {(pilot.contract_value || pilot.budget).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100">
                    <Link
                      href={`/contracts/${c.contract_id}`}
                      className="text-xs font-bold text-zinc-900 hover:underline underline-offset-2"
                    >
                      View Verification Dossier
                    </Link>

                    <button
                      onClick={() => handleOpenAdoptModal(c)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-md transition-colors"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Adopt This Solution</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Existing Inter-Departmental Adoptions Registry */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-950">
              Inter-Departmental Scaling Log ({adoptions.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Official statutory scale procurement requisitions executed across sister departments.
            </p>
          </div>
          <Award className="h-5 w-5 text-zinc-700" />
        </div>

        <div className="space-y-3">
          {adoptions.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No adoptions logged yet.</p>
          ) : (
            adoptions.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900">{item.id}</span>
                    <span className="font-semibold text-zinc-950">Adopted by: {item.department_name}</span>
                  </div>
                  <p className="text-zinc-600">
                    Solution: <strong>{item.pilot_title || 'Validated Pilot Solution'}</strong>
                  </p>
                  {item.notes && <p className="text-[11px] text-zinc-500 italic">"{item.notes}"</p>}
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="font-extrabold text-zinc-950 text-sm block">
                    INR {(item.contract_value || 1150000).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {item.adopted_at ? new Date(item.adopted_at).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Adopting Solution */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-zinc-950 mb-1">
              Initiate Inter-Departmental Adoption
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Fast-track requisition for: <strong>{selectedContract.pilot?.problem_title}</strong>
            </p>

            <form onSubmit={handleConfirmAdoption} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Adopting Ministry / Department *
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full p-2.5 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:ring-black focus:border-black font-semibold bg-white"
                >
                  {PROCURING_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Requisition Justification Note
                </label>
                <textarea
                  rows={3}
                  value={adoptionNotes}
                  onChange={(e) => setAdoptionNotes(e.target.value)}
                  className="w-full p-2.5 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:ring-black focus:border-black"
                />
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-800 space-y-0.5">
                <p className="font-bold">Statutory Exemption Applied</p>
                <p className="text-[11px] text-zinc-600">
                  Pursuant to GFR 149(viii), this solution has passed technical and performance validation in an authorized government pilot. No repeated feasibility committee required.
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedContract(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdopting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isAdopting ? 'Recording Adoption...' : 'Confirm Statutory Adoption'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
