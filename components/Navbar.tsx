'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, 
  Rocket, 
  PlusCircle, 
  LayoutDashboard, 
  Layers, 
  ShieldCheck, 
  LogOut, 
  Search, 
  UserCheck, 
  ChevronDown, 
  Home, 
  AlertTriangle,
  User
} from 'lucide-react';
import { UserSession } from '@/lib/auth';

interface NavbarProps {
  departmentName?: string;
}

export default function Navbar({ departmentName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  const syncSession = () => {
    try {
      const saved = localStorage.getItem('navsetu_session');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    syncSession();

    window.addEventListener('storage', syncSession);
    window.addEventListener('navsetu_auth_change', syncSession);

    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('navsetu_auth_change', syncSession);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // Ignore network errors on logout
    }

    localStorage.removeItem('navsetu_session');
    setCurrentUser(null);
    setShowRoleMenu(false);
    window.dispatchEvent(new Event('navsetu_auth_change'));
    router.push('/');
  };

  const switchRole = async (targetRole: 'department' | 'startup' | 'startup_unverified') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (data.ok && data.user) {
        localStorage.setItem('navsetu_session', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setShowRoleMenu(false);
        window.dispatchEvent(new Event('navsetu_auth_change'));
        if (data.user.role === 'department') {
          router.push('/department/dashboard');
        } else {
          router.push('/startup/dashboard');
        }
      }
    } catch (e) {
      console.error('Role switch failed:', e);
    }
  };

  const isLoggedIn = Boolean(currentUser);
  const isStartup = currentUser?.role === 'startup';

  const deptLinks = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      active: pathname === '/',
    },
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

  const startupLinks = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      active: pathname === '/',
    },
    {
      name: 'Startup Dashboard',
      href: '/startup/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/startup/dashboard',
    },
    {
      name: 'Browse Problems',
      href: '/startup/browse',
      icon: Search,
      active: pathname === '/startup/browse',
    },
    {
      name: 'DPIIT Profile',
      href: '/startup/profile',
      icon: UserCheck,
      active: pathname === '/startup/profile',
    },
    {
      name: 'Proven Solutions',
      href: '/adoptions',
      icon: Layers,
      active: pathname === '/adoptions',
    },
  ];

  const currentLinks = isStartup ? startupLinks : deptLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand with Logo PNG -> ALWAYS redirects to Landing Page '/' */}
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2.5 group cursor-pointer"
            title="NavSetu Home (Return to Landing Page)"
          >
            <div className="h-9 w-9 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-zinc-200 p-0.5 shadow-2xs">
              <Image
                src="/logo.png"
                alt="NavSetu Logo"
                width={36}
                height={36}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-black tracking-tight group-hover:text-zinc-700 transition-colors">
                  NavSetu
                </span>
                {mounted && isLoggedIn && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 text-white">
                    {isStartup ? 'STARTUP' : 'GOV DEPT'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 font-medium -mt-0.5 hidden sm:block">
                Gov-Startup Fast-Track Procurement
              </p>
            </div>
          </Link>

          {/* Role-Specific Navigation Links: Only visible when logged in */}
          {mounted && isLoggedIn && (
            <nav className="hidden md:flex items-center gap-1.5 ml-2 border-l border-zinc-200 pl-4">
              {currentLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      item.active
                        ? 'bg-black text-white shadow-xs'
                        : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${item.active ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right side navigation */}
        <div className="flex items-center gap-3">
          {/* Public verify quick check link */}
          <Link
            href="/verify/demo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-900 hover:bg-zinc-100 hover:border-black transition-colors shadow-2xs"
            title="Public Verification Portal (Tamper Evident Audit)"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-900" />
            <span className="hidden sm:inline">Audit Seal</span>
          </Link>

          {mounted && (
            <>
              {isLoggedIn ? (
                /* Authenticated User Menu */
                <div className="relative">
                  <button
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 transition-colors text-left shadow-2xs cursor-pointer"
                  >
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs font-bold text-zinc-900 max-w-[140px] truncate">
                        {currentUser?.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 max-w-[140px] truncate">
                        {currentUser?.org_name}
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  </button>

                  {showRoleMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-zinc-200 py-2 z-50 text-xs animate-in fade-in duration-100">
                      <div className="px-3 py-2 border-b border-zinc-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Active Role: {isStartup ? 'Startup Innovator' : 'Government Officer'}
                        </p>
                        <p className="font-bold text-zinc-900 truncate mt-0.5">{currentUser?.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{currentUser?.email}</p>
                      </div>

                      <div className="px-3 py-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Switch Demo Persona
                        </p>
                      </div>

                      {/* Persona 1: Department Officer */}
                      <button
                        onClick={() => switchRole('department')}
                        className="w-full text-left px-3 py-2.5 hover:bg-zinc-100 flex items-center justify-between group transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <Building2 className="h-4 w-4 text-zinc-700 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-zinc-900 group-hover:text-black">Department Officer</p>
                            <p className="text-[11px] text-zinc-500">Dept of Drinking Water & Sanitation</p>
                          </div>
                        </div>
                        {currentUser?.role === 'department' && (
                          <span className="w-2 h-2 rounded-full bg-black shrink-0 ml-2" />
                        )}
                      </button>

                      {/* Persona 2: Verified Startup */}
                      <button
                        onClick={() => switchRole('startup')}
                        className="w-full text-left px-3 py-2.5 hover:bg-zinc-100 flex items-center justify-between group transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <Rocket className="h-4 w-4 text-zinc-700 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-zinc-900 group-hover:text-black">Verified Startup</p>
                            <p className="text-[11px] text-zinc-500">AquaSense Analytics (DIPP-89211)</p>
                          </div>
                        </div>
                        {currentUser?.role === 'startup' && currentUser?.verified && (
                          <span className="w-2 h-2 rounded-full bg-black shrink-0 ml-2" />
                        )}
                      </button>

                      {/* Persona 3: Unverified Startup */}
                      <button
                        onClick={() => switchRole('startup_unverified')}
                        className="w-full text-left px-3 py-2.5 hover:bg-zinc-100 flex items-center justify-between group transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="h-4 w-4 text-zinc-700 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-zinc-900 group-hover:text-black">Unverified Startup</p>
                            <p className="text-[11px] text-zinc-500">TerraHydro Labs (Blocks Apply)</p>
                          </div>
                        </div>
                        {currentUser?.role === 'startup' && !currentUser?.verified && (
                          <span className="w-2 h-2 rounded-full bg-black shrink-0 ml-2" />
                        )}
                      </button>

                      <div className="border-t border-zinc-100 mt-1 pt-1 space-y-0.5">
                        <Link
                          href="/login"
                          onClick={() => setShowRoleMenu(false)}
                          className="w-full text-left px-3 py-2 text-zinc-700 hover:bg-zinc-100 flex items-center gap-2 font-medium"
                        >
                          <User className="h-3.5 w-3.5 text-zinc-500" />
                          <span>Change Login / Role</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-zinc-900 hover:bg-zinc-100 flex items-center gap-2 font-bold cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5 text-zinc-900" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest Navigation: Only Sign In & Sign Up buttons */
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-zinc-700 hover:text-black px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-black hover:bg-zinc-800 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
