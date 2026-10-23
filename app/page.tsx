'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Rocket,
  ShieldCheck,
  FileCheck2,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  QrCode,
  Layers,
  ChevronRight,
  Sparkles,
  Award,
  Clock,
  Lock
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleQuickEnter = async (role: 'department' | 'startup') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.ok && data.user) {
        localStorage.setItem('navsetu_session', JSON.stringify(data.user));
        window.dispatchEvent(new Event('navsetu_auth_change'));
        if (role === 'department') {
          router.push('/department/dashboard');
        } else {
          router.push('/startup/dashboard');
        }
      }
    } catch {
      router.push(`/login?role=${role}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col font-sans">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-zinc-300 px-4 py-2 text-xs font-medium text-center border-b border-zinc-800">
        <span className="inline-flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-zinc-300" />
          <span>Statutory Compliance with GFR Rule 149(viii) & GeM Startup Runway Direct Procurement Framework</span>
        </span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-zinc-50/60 to-white pt-16 pb-20 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo Brand Header */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="p-2 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="NavSetu"
                width={48}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
              <div className="text-left pr-2">
                <span className="font-black text-lg text-black tracking-tight block">NavSetu</span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">National Gov-Startup Bridge</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tight max-w-4xl mx-auto leading-tight">
            From Pilot Validation to Direct Contract in{' '}
            <span className="underline decoration-zinc-400 underline-offset-8">9 Days</span>, Not 2 Years.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            NavSetu replaces months of procurement friction with audited milestone-driven pilots, 
            tamper-evident SHA-256 justification records, and inter-departmental solution scaling.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleQuickEnter('department')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <Building2 className="h-4 w-4" />
              <span>Enter as Department Officer</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleQuickEnter('startup')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-sm border-2 border-zinc-300 shadow-xs transition-all cursor-pointer"
            >
              <Rocket className="h-4 w-4 text-zinc-800" />
              <span>Enter as Startup Founder</span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </button>

            <Link
              href="/verify/demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-sm border border-zinc-300 transition-all"
            >
              <ShieldCheck className="h-4 w-4 text-zinc-900" />
              <span>Scan / Audit Demo Seal</span>
            </Link>
          </div>

          {/* Quick Metrics Comparison */}
          <div className="mt-14 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Traditional Tender</span>
              <p className="text-2xl font-black text-zinc-900 mt-1">18 – 24 Months</p>
              <p className="text-xs text-zinc-500 mt-1">Tender notices, committees & manual paper audits</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-950 text-white border border-black shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">NavSetu Pipeline</span>
              <p className="text-2xl font-black text-white mt-1">9 Days Conversion</p>
              <p className="text-xs text-zinc-400 mt-1">Automated conversion under GFR 149(viii)</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Audit Proof</span>
              <p className="text-2xl font-black text-zinc-950 mt-1">SHA-256 + QR</p>
              <p className="text-xs text-zinc-500 mt-1">Zero-trust public verification in 3 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Pipeline */}
      <section className="py-16 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              The 4-Stage Procurement Pipeline
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Statutory, policy-compliant pipeline with zero regulatory exceptions required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 relative">
              <span className="w-8 h-8 rounded-lg bg-black text-white font-black text-xs flex items-center justify-center mb-3">1</span>
              <h3 className="font-bold text-zinc-950 text-base">Identify</h3>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                Government departments publish focused operational challenges with strict budget caps and target deadlines.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 relative">
              <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-black text-xs flex items-center justify-center mb-3">2</span>
              <h3 className="font-bold text-zinc-950 text-base">Pilot</h3>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                DPIIT-verified startups submit concise pitches. Paid pilot starts with auditable telemetry milestones.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 relative">
              <span className="w-8 h-8 rounded-lg bg-black text-white font-black text-xs flex items-center justify-center mb-3">3</span>
              <h3 className="font-bold text-zinc-950 text-base">Procure</h3>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                When 70%+ milestones succeed, 1-click converts the pilot into a direct statutory contract with a tamper-evident PDF.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 relative">
              <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-black text-xs flex items-center justify-center mb-3">4</span>
              <h3 className="font-bold text-zinc-950 text-base">Scale</h3>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                Sister ministries discover proven pilot dossiers and directly adopt solutions without repeating validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Feature Spotlight: Tamper-Evident Justification PDF */}
      <section className="py-16 bg-zinc-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                <span>The Core Technical Innovation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Verifiable Justification PDF with Cryptographic SHA-256 Seal
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Procurement decisions face rigorous state audits. Standard PDFs can be casually edited. 
                NavSetu computes a canonical SHA-256 hash of the entire pilot telemetry record, prints the hash and 
                a QR code linking to an open public verification engine.
              </p>
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>Immutable record binding: Any milestone outcome alteration invalidates the audit seal immediately.</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>Public audit portal requires no login — anyone with the QR or contract ID can independently verify integrity.</span>
                </div>
              </div>
              <div className="pt-4 flex flex-wrap gap-3">
                <Link
                  href="/verify/demo"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs inline-flex items-center gap-2 shadow-xs"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Launch Live Audit Verification</span>
                </Link>
                <Link
                  href="/api/contracts/demo/pdf"
                  target="_blank"
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs inline-flex items-center gap-2 border border-zinc-800"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>Preview Justification PDF</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-mono font-bold text-white">RECORD HASH AUDIT SEAL</span>
                <span className="text-[10px] bg-black text-zinc-300 px-2 py-0.5 rounded border border-zinc-800">
                  GENUINE RECORD
                </span>
              </div>
              <div className="p-3 bg-black rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300 break-all select-all">
                693c22706b4375e3262b55396de4b1af6301292295533e24246fc7cf69b18efe
              </div>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>• Contract: <strong className="text-zinc-200">CNT-2026-JAL-0881</strong></p>
                <p>• Dept: <strong className="text-zinc-200">Dept. of Drinking Water & Sanitation</strong></p>
                <p>• Startup: <strong className="text-zinc-200">AquaSense Analytics Pvt Ltd</strong></p>
                <p>• Success Rate: <strong className="text-white">100% (3 of 3 Milestones Met)</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
