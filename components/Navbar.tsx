'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  PlusCircle, 
  LayoutDashboard, 
  Layers, 
  FileCheck, 
  ShieldCheck, 
  Sparkles,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  departmentName?: string;
}

export default function Navbar({ departmentName = 'Dept. of Drinking Water & Sanitation' }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    {
      name: 'Department Dashboard',
      href: '/department/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/department/dashboard',
    },
    {
      name: 'Post Problem',
      href: '/department/post-problem',
      icon: PlusCircle,
      active: pathname === '/department/post-problem',
    },
    {
      name: 'Scale & Adoptions',
      href: '/adoptions',
      icon: Layers,
      active: pathname === '/adoptions',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/department/dashboard" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  NavSetu
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                Gov-Startup Pilot & Fast-Track Procurement
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-slate-800 pl-4">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    item.active
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side - User & Role */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">{departmentName}</span>
            <div className="flex items-center justify-end gap-1.5 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Government Dept (Procurement Officer)
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Public verify quick check link */}
          <Link
            href="/verify/demo"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700/60 bg-slate-900/60 text-[11px] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
            title="Public Verification Portal"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Audit / Verify</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
            title="Switch Role or Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Switch</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
