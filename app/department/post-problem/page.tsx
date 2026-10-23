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
  FileText,
  CheckCircle2
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

  // Quick Pre-fill for Hackathon Demos (Instant 20-second demo)
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

    if (!description.trim() || description.trim().length < 20) {
      showToast('Please provide a detailed description and operational objectives.', 'error');
      return;
    }

    const budgetNum = Number(budgetCap);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      showToast('Please enter a valid positive budget cap in INR.', 'error');
      return;
    }

    if (!deadline) {
      showToast('Please specify an application deadline date.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create problem via store (works locally & keeps localStorage state)
      const created = createProblem({
        department_id: 'dept-1',
        department_name: departmentName,
        title,
        description,
        sector,
        budget_cap: budgetNum,
        deadline,
      });

      // 2. Also dispatch to API endpoint if active
      try {
        await fetch('/api/problems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            sector,
            budget_cap: budgetNum,
            deadline,
          }),
        });
      } catch (err) {
        // Fallback gracefully to store
      }

      showToast('Problem challenge posted successfully! Status is now OPEN.', 'success');
      
      // Redirect to the applications review page for this new problem
      setTimeout(() => {
        router.push(`/department/problems/${created.id}`);
      }, 700);
    } catch (err: any) {
      showToast(err?.message || 'Failed to post problem challenge', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/department/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>

        {/* Demo Fast Fill Button */}
        <button
          type="button"
          onClick={handlePreFillDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all"
          title="Auto-fill sample challenge for quick SIH judging demo"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick Demo Auto-Fill</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Smart India Hackathon • Screen 2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Post Department Operational Challenge
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Specify the operational problem, success targets, and trial budget cap. This will be published immediately to verified DPIIT startups under open competitive pilot guidelines.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Name (Read-only or selectable) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Procuring Department / Authority
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Challenge Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. AI-Powered Acoustic Pipeline Leakage & Non-Revenue Water Detection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
            <span className="text-[11px] text-slate-500">
              Clear, objective-focused title stating the core technical challenge.
            </span>
          </div>

          {/* Sector & Budget Cap Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Sector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span>Sector / Domain</span>
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {SECTORS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Cap */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                <span>Maximum Pilot Budget Cap (INR) <span className="text-rose-400">*</span></span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">₹</span>
                <input
                  type="number"
                  min="50000"
                  step="10000"
                  placeholder="1500000"
                  value={budgetCap}
                  onChange={(e) => setBudgetCap(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
              <span className="text-[11px] text-slate-500">
                Rule 4 Check: Any resulting direct contract cannot exceed this amount.
              </span>
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Startup Application Deadline <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full sm:w-64 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Problem Description & Expected Outcome <span className="text-rose-400">*</span></span>
            </label>
            <textarea
              rows={5}
              placeholder="Detail the operational situation, existing limitations, testbed environment, and target quantitative benchmarks (e.g. 30% reduction in response time, 99% uptime)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
              required
            />
            <span className="text-[11px] text-slate-500">
              Tip: Explicit quantitative targets make milestone verification straightforward.
            </span>
          </div>

          {/* Statutory Notice */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-200/90 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white">GFR 2017 & Public Procurement Compliance:</span>
              <p className="leading-relaxed">
                By publishing this problem statement on NavSetu, you initiate an open, non-discriminatory innovation challenge. Selected proposals undergo live milestone trials with tamper-evident cryptographic verification before direct contract conversion.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Link
              href="/department/dashboard"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Challenge...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish Challenge (Open Status)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
