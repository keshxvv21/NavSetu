'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  ArrowLeft,
  Send,
  Sparkles,
  Info,
  IndianRupee,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { createProblem } from '@/lib/departmentStore';

const SECTORS = [
  'Water & Sanitation',
  'Smart Mobility & Transit',
  'Healthcare & Public Health',
  'Urban Governance & Waste',
  'Agriculture & Rural Economy',
  'Clean Energy & Power Grid',
  'Disaster Management & Safety',
];

export default function PostProblem() {
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [description, setDescription] = useState('');
  const [budgetCap, setBudgetCap] = useState('1500000');
  const [deadline, setDeadline] = useState('2026-11-30');
  const [departmentName, setDepartmentName] = useState('Dept. of Drinking Water & Sanitation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Pre-fill for Demos (Instant 20-second demo)
  const handlePreFillDemo = () => {
    setTitle('Autonomous Micro-Sonar Silt & Structural Health Drone for Canal Siphons');
    setSector('Water & Sanitation');
    setDescription(
      'Irrigation siphons and aqueducts suffer uninspected silt buildup and micro-fissures beneath deep murky waters. The department requires an autonomous submersible tetherless drone capable of acoustic imaging, silt volumetric profiling, and fissure depth mapping without draining canal infrastructure.'
    );
    setBudgetCap('1800000');
    setDeadline('2026-12-15');
    showToast('Demo challenge loaded into form!', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 8) {
      showToast('Please enter a descriptive challenge title (min 8 characters).', 'error');
      return;
    }

    if (!description.trim() || description.trim().length < 25) {
      showToast('Please provide a substantive technical description (min 25 characters).', 'error');
      return;
    }

    const budgetNum = Number(budgetCap);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      showToast('Please enter a valid budget cap in INR.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      createProblem({
        department_id: 'dept-1',
        department_name: departmentName,
        title: title.trim(),
        description: description.trim(),
        sector,
        budget_cap: budgetNum,
        deadline,
      });

      showToast('Operational Challenge posted successfully! Published to startups.', 'success');
      router.push('/department/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Failed to post challenge', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 py-8 px-4 sm:px-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/department/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>

        {/* Demo Fast Fill Button */}
        <button
          type="button"
          onClick={handlePreFillDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 text-zinc-900 border border-zinc-300 hover:bg-zinc-200 transition-colors shadow-2xs"
          title="Auto-fill sample challenge for quick judging demo"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
          <span>Quick Demo Auto-Fill</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div className="p-6 sm:p-8 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Post Operational Challenge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Commission Public Sector Innovation
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed font-normal">
            Specify the operational problem, success targets, and trial budget cap. This will be published immediately to verified DPIIT startups under open competitive pilot guidelines.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Basic Details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Challenge Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI-Powered Acoustic Pipeline Leakage & Non-Revenue Water Detection"
                className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Clear, action-oriented title describing the target outcome.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dept" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Procuring Ministry / Department *
                </label>
                <input
                  id="dept"
                  type="text"
                  required
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>

              <div>
                <label htmlFor="sector" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Domain Sector *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <select
                    id="sector"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-900 font-medium focus:outline-none focus:border-black"
                  >
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Statutory Pilot Budget Cap (INR) *
                </label>
                <div className="relative">
                  <input
                    id="budget"
                    type="number"
                    required
                    step="10000"
                    min="100000"
                    value={budgetCap}
                    onChange={(e) => setBudgetCap(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 font-mono font-bold focus:outline-none focus:border-black"
                  />
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Capped per GFR Rule 149(viii) pilot authorization limits.
                </span>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Proposal Submission Deadline *
                </label>
                <input
                  id="deadline"
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 font-medium focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label htmlFor="desc" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Detailed Problem Context & Target Benchmarks *
              </label>
              <textarea
                id="desc"
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the technical requirement, operational site characteristics, telemetry expectations, and quantitative benchmark targets..."
                className="w-full bg-white border border-zinc-300 rounded-xl p-4 text-sm text-zinc-900 placeholder-zinc-400 font-medium focus:outline-none focus:border-black leading-relaxed"
              />
            </div>
          </div>

          {/* Regulatory Note */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-950">GFR 2017 & Public Procurement Compliance:</span>
              <p className="leading-relaxed text-zinc-600 font-medium mt-0.5">
                Problems posted on NavSetu are automatically bound to the GFR 149(viii) startup runway framework. Applicants are verified against DPIIT registries. Selected startups enter a paid trial pilot; upon milestone verification, this converts into a direct procurement contract.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Link
              href="/department/dashboard"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-black hover:bg-zinc-800 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing Challenge...' : 'Publish Challenge'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
