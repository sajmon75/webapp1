// src/components/Navbar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sandwich,
  ShoppingBag,
  Users,
  ChefHat,
  Building2,
  LogOut,
  Menu as MenuIcon,
  X,
  User as UserIcon,
  Clock,
} from 'lucide-react';

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">Admin Scuola</span>;
      case 'CATERING':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold">Bar / Ristorazione</span>;
      case 'CLASS_REP':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">Resp. Classe</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold">Studente</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Info Scuola */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
                <Sandwich className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg leading-tight block tracking-tight">
                  Paninoteca<span className="text-emerald-600 font-extrabold">Scuola</span>
                </span>
                {user?.school && (
                  <span className="text-xs text-slate-500 font-medium block truncate max-w-[200px] sm:max-w-xs">
                    {user.school.name}
                  </span>
                )}
              </div>
            </Link>

            {/* Badge Plesso / Classe per studente e responsabile */}
            {user?.classroom && (
              <div className="hidden md:flex items-center gap-1.5 ml-2 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700">
                <span className="text-emerald-700">Classe {user.classroom.name}</span>
                {user.branch && <span className="text-slate-400">• {user.branch.name}</span>}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Studente & Responsabile Links */}
            {(user?.role === 'STUDENT' || user?.role === 'CLASS_REP') && (
              <>
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/'
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Ordina Panini
                </Link>
                <Link
                  href="/mio-ordine"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/mio-ordine'
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Il Mio Ordine
                </Link>
              </>
            )}

            {/* Responsabile Classe Link */}
            {(user?.role === 'CLASS_REP' || user?.role === 'ADMIN') && (
              <Link
                href="/responsabile"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/responsabile'
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Users className="w-4 h-4" />
                Gestione Ordini Classe
              </Link>
            )}

            {/* Servizio Ristorazione / Catering Links */}
            {(user?.role === 'CATERING' || user?.role === 'ADMIN') && (
              <>
                <Link
                  href="/backoffice/cucina"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith('/backoffice/cucina')
                      ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  Cucina & Buste
                </Link>
                <Link
                  href="/backoffice/listino"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith('/backoffice/listino')
                      ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Sandwich className="w-4 h-4 text-amber-600" />
                  Listino & Scorte
                </Link>
              </>
            )}

            {/* Admin Links */}
            {user?.role === 'ADMIN' && (
              <Link
                href="/backoffice/scuole"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/backoffice/scuole')
                    ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Scuole & Plessi
              </Link>
            )}
          </nav>

          {/* User profile & Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                  <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                </div>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  title="Disconnetti"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
              >
                Accedi
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2">
            {user && getRoleBadge(user.role)}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {user && (
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-slate-500" />
                </div>
              )}
              <div>
                <div className="font-bold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">
                  {user.classroom ? `Classe ${user.classroom.name} • ` : ''}
                  {user.email}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Sandwich className="w-4 h-4 text-emerald-600" />
              Ordina Panini
            </Link>
            <Link
              href="/mio-ordine"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Il Mio Ordine
            </Link>

            {(user?.role === 'CLASS_REP' || user?.role === 'ADMIN') && (
              <Link
                href="/responsabile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-blue-700 bg-blue-50"
              >
                <Users className="w-4 h-4 text-blue-600" />
                Gestione Ordini Classe
              </Link>
            )}

            {(user?.role === 'CATERING' || user?.role === 'ADMIN') && (
              <>
                <Link
                  href="/backoffice/cucina"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-800 bg-amber-50"
                >
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  Cucina & Buste
                </Link>
                <Link
                  href="/backoffice/listino"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Sandwich className="w-4 h-4 text-amber-600" />
                  Listino & Scorte
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/backoffice/scuole"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-purple-700 bg-purple-50"
              >
                <Building2 className="w-4 h-4 text-purple-600" />
                Scuole & Plessi
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100"
              >
                <LogOut className="w-4 h-4" />
                Disconnetti
              </button>
            ) : (
              <Link
                href="/login"
                className="block text-center py-2 px-4 bg-emerald-600 text-white rounded-lg text-sm font-bold"
              >
                Accedi
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

