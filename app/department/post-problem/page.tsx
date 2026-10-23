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
      // 1. Create problem via store
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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/department/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>

        {/* Demo Fast Fill Button */}
        <button
          type="button"
          onClick={handlePreFillDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors shadow-xs"
          title="Auto-fill sample challenge for quick judging demo"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Quick Demo Auto-Fill</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div className="gov-card p-6 sm:p-8 bg-white border border-slate-200 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Screen 2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Post Department Operational Challenge
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
            Specify the operational problem, success targets, and trial budget cap. This will be published immediately to verified DPIIT startups under open competitive pilot guidelines.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Procuring Department / Authority
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              required
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Challenge Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. AI-Powered Acoustic Pipeline Leakage & Non-Revenue Water Detection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              required
            />
            <span className="text-xs text-slate-500 font-medium">
              Clear, objective-focused title stating the core technical challenge.
            </span>
          </div>

          {/* Sector & Budget Cap Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Sector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Sector / Domain</span>
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600"
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
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                <span>Maximum Pilot Budget Cap (INR) <span className="text-rose-600">*</span></span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm font-bold">₹</span>
                <input
                  type="number"
                  min="50000"
                  step="10000"
                  placeholder="1500000"
                  value={budgetCap}
                  onChange={(e) => setBudgetCap(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-4 py-2.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Rule 4 Check: Any resulting direct contract cannot exceed this amount.
              </span>
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Startup Application Deadline <span className="text-rose-600">*</span></span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full sm:w-64 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Problem Description & Expected Outcome <span className="text-rose-600">*</span></span>
            </label>
            <textarea
              rows={5}
              placeholder="Detail the operational situation, existing limitations, testbed environment, and target quantitative benchmarks (e.g. 30% reduction in response time, 99% uptime)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-4 text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-600 leading-relaxed"
              required
            />
            <span className="text-xs text-slate-500 font-medium">
              Tip: Explicit quantitative targets make milestone verification straightforward.
            </span>
          </div>

          {/* Statutory Notice */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-blue-950">GFR 2017 & Public Procurement Compliance:</span>
              <p className="leading-relaxed text-blue-900 font-medium">
                By publishing this problem statement on NavSetu, you initiate an open, non-discriminatory innovation challenge. Selected proposals undergo live milestone trials with tamper-evident cryptographic verification before direct contract conversion.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <Link
              href="/department/dashboard"
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-xs transition-colors disabled:opacity-50"
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
