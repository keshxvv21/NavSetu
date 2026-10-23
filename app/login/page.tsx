'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Rocket,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/Toast';

type LoginRole = 'department' | 'startup';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const queryRole = searchParams.get('role');
  const redirectTarget = searchParams.get('redirect');

  const [activeRole, setActiveRole] = useState<LoginRole>('department');
  const [email, setEmail] = useState('officer@jalshakti.gov.in');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (queryRole === 'startup') {
      setActiveRole('startup');
      setEmail('rohan@aquasense.io');
    } else {
      setActiveRole('department');
      setEmail('officer@jalshakti.gov.in');
    }
  }, [queryRole]);

  const handleRoleTabChange = (role: LoginRole) => {
    setActiveRole(role);
    if (role === 'department') {
      setEmail('officer@jalshakti.gov.in');
    } else {
      setEmail('rohan@aquasense.io');
    }
  };

  const performLogin = async (userEmail: string, preferredRole: LoginRole, overrideRedirect?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, role: preferredRole }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || 'Authentication failed', 'error');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('navsetu_session', JSON.stringify(data.user));
      window.dispatchEvent(new Event('navsetu_auth_change'));
      showToast(`Welcome back, ${data.user.name}!`, 'success');

      if (redirectTarget) {
        router.push(redirectTarget);
      } else if (overrideRedirect) {
        router.push(overrideRedirect);
      } else if (data.user.role === 'department') {
        router.push('/department/dashboard');
      } else {
        router.push('/startup/dashboard');
      }
    } catch {
      showToast('Network error during login', 'error');
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter an email address', 'error');
      return;
    }
    performLogin(email, activeRole);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-4 group cursor-pointer">
          <div className="h-10 w-10 rounded-xl bg-white border border-zinc-200 p-1 flex items-center justify-center shadow-xs">
            <Image
              src="/logo.png"
              alt="NavSetu Logo"
              width={36}
              height={36}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="font-black text-2xl text-zinc-950 tracking-tight group-hover:text-zinc-700 transition-colors">
            NavSetu
          </span>
        </Link>
        <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
          Sign In to NavSetu
        </h2>
        <p className="mt-1.5 text-xs text-zinc-600 max-w-sm mx-auto">
          Access your official procurement workspace. Select your persona to enter directly into your role dashboard.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-5 shadow-xl rounded-2xl sm:px-8 border border-zinc-200 space-y-6">
          
          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-100 border border-zinc-200">
            <button
              type="button"
              onClick={() => handleRoleTabChange('department')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'department'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Gov Department</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('startup')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'startup'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Rocket className="h-4 w-4" />
              <span>Startup</span>
            </button>
          </div>

          {/* Department Login View */}
          {activeRole === 'department' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-zinc-100 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">
                      Government Department Officer Portal
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Central & State ministries, departments, and public procurement officers.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200">
                    GOV DEPT
                  </span>
                </div>
              </div>

              {/* Seeded One-Click Demo Personas */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Select a Government Persona to Enter Dashboard:
                </p>

                {/* Dept Officer 1 */}
                <button
                  type="button"
                  onClick={() => performLogin('officer@jalshakti.gov.in', 'department', '/department/dashboard')}
                  disabled={isLoading}
                  className="w-full text-left p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-black transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-950 text-sm">Dr. S. K. Verma</span>
                        <span className="text-[10px] bg-zinc-200 text-zinc-900 font-bold px-2 py-0.5 rounded-full">
                          Department Officer
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Dept. of Drinking Water & Sanitation (Jal Jeevan Mission)
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </button>

                {/* Dept Officer 2 */}
                <button
                  type="button"
                  onClick={() => performLogin('director@mohua.gov.in', 'department', '/department/dashboard')}
                  disabled={isLoading}
                  className="w-full text-left p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-black transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 text-white flex items-center justify-center shadow-xs">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-950 text-sm">Anita Roy, IAS</span>
                        <span className="text-[10px] bg-zinc-200 text-zinc-900 font-bold px-2 py-0.5 rounded-full">
                          Director
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Ministry of Housing and Urban Affairs (Smart Cities Mission)
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-zinc-400 font-semibold">Or Sign In with Official Email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Government Email Address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@jalshakti.gov.in"
                      className="block w-full pl-9 pr-3 py-2.5 border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Password / Access Code
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-black hover:bg-zinc-800 shadow-xs transition-colors cursor-pointer"
                >
                  <Building2 className="h-4 w-4" />
                  <span>{isLoading ? 'Signing In...' : 'Sign In to Department Dashboard'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Startup Login View */}
          {activeRole === 'startup' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-zinc-100 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">
                      Startup Founder & Innovator Portal
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      DPIIT-recognized startups building innovative products for public procurement.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 text-white">
                    STARTUP
                  </span>
                </div>
              </div>

              {/* Seeded One-Click Demo Personas */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Select a Startup Persona to Enter Dashboard:
                </p>

                {/* Startup 1: Verified */}
                <button
                  type="button"
                  onClick={() => performLogin('rohan@aquasense.io', 'startup', '/startup/dashboard')}
                  disabled={isLoading}
                  className="w-full text-left p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-black transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
                      <Rocket className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-950 text-sm">Rohan Deshmukh</span>
                        <span className="text-[10px] bg-zinc-200 text-zinc-900 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-zinc-900" />
                          DPIIT Verified
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        AquaSense Analytics Pvt Ltd (DIPP-89211 • Water & Sanitation)
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </button>

                {/* Startup 2: Unverified */}
                <button
                  type="button"
                  onClick={() => performLogin('karan@terrahydro.in', 'startup', '/startup/dashboard')}
                  disabled={isLoading}
                  className="w-full text-left p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-black transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-700 text-white flex items-center justify-center shadow-xs">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-950 text-sm">Karan Mehra</span>
                        <span className="text-[10px] bg-zinc-200 text-zinc-700 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3 text-zinc-600" />
                          DPIIT Pending
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        TerraHydro Labs (Tests unverified DPIIT application gating)
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-zinc-400 font-semibold">Or Sign In with Startup Email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Startup Email Address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rohan@aquasense.io"
                      className="block w-full pl-9 pr-3 py-2.5 border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Password / Access Code
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-black hover:bg-zinc-800 shadow-xs transition-colors cursor-pointer"
                >
                  <Rocket className="h-4 w-4" />
                  <span>{isLoading ? 'Signing In...' : 'Sign In to Startup Dashboard'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Footer note */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-zinc-900 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Need an account?</strong> Startups can sign up by providing their DPIIT certificate recognition number. Government procurement officers can register using their official ministry email.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading Login Portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
