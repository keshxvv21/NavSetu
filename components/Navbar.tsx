'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  PlusCircle, 
  LayoutDashboard, 
  Layers, 
  ShieldCheck, 
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
      active: pathname === '/department/dashboard' || pathname === '/department',
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/department/dashboard" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  NavSetu
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium -mt-0.5 hidden sm:block">
                Gov-Startup Pilot & Fast-Track Procurement
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-slate-200 pl-4">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    item.active
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-blue-600" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side - User & Role */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900">{departmentName}</span>
            <div className="flex items-center justify-end gap-1.5 text-[11px] text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Procurement Officer (Verified)
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* Public verify quick check link */}
          <Link
            href="/verify/demo"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Public Verification Portal"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Audit / Verify</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-slate-200 hover:border-rose-200"
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
