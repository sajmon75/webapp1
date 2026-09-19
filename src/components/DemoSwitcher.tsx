// src/components/DemoSwitcher.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, ChevronUp, ChevronDown, UserCheck } from 'lucide-react';

interface DemoSwitcherProps {
  currentUserEmail?: string;
}

export default function DemoSwitcher({ currentUserEmail }: DemoSwitcherProps) {
  const router = useRouter();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const testAccounts = [
    {
      role: 'STUDENT',
      name: 'Mario Rossi',
      email: 'mario.rossi@scuola.it',
      label: 'Studente 3A',
      desc: 'Ordina panino e bibita',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
      badge: 'Studente',
    },
    {
      role: 'CLASS_REP',
      name: 'Luca Bianchi',
      email: 'luca.bianchi@scuola.it',
      label: 'Resp. Classe 3A',
      desc: 'Raccoglie soldi e conferma ordine',
      color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
      badge: 'Responsabile',
    },
    {
      role: 'CATERING',
      name: 'Luigi Barista',
      email: 'bar@scuola.it',
      label: 'Bar / Cucina',
      desc: 'Prepara buste e gestisce listino',
      color: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100',
      badge: 'Ristorazione',
    },
    {
      role: 'ADMIN',
      name: 'Prof.ssa Anna',
      email: 'admin@scuola.it',
      label: 'Admin Scuola',
      desc: 'Configura plessi, orari e scorte',
      color: 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100',
      badge: 'Direzione',
    },
  ];

  const handleSwitch = async (email: string, targetPath: string) => {
    try {
      setLoadingEmail(email);
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        router.push(targetPath);
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to switch demo user:', err);
    } finally {
      setLoadingEmail(null);
    }
  };

  const getTargetUrlForRole = (role: string) => {
    switch (role) {
      case 'CATERING':
        return '/backoffice/cucina';
      case 'CLASS_REP':
        return '/responsabile';
      case 'ADMIN':
        return '/backoffice/scuole';
      default:
        return '/';
    }
  };

  return (
    <aside aria-label="Demo Role Switcher" className="fixed bottom-3 right-3 z-50 max-w-sm sm:max-w-md">
      {/* Mini Toggle Pill */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-full text-xs font-semibold shadow-xl hover:bg-slate-800 transition-all border border-slate-700"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Switch Ruolo Demo</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Menu */}
      {isOpen && (
        <div className="mt-2 p-3 bg-white rounded-2xl shadow-2xl border border-slate-200 backdrop-blur-md space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Cambia Profilo con 1-Click
            </span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              Demo Mode
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {testAccounts.map((account) => {
              const isActive = currentUserEmail === account.email;
              const isLoading = loadingEmail === account.email;
              const targetUrl = getTargetUrlForRole(account.role);

              return (
                <button
                  key={account.email}
                  disabled={isLoading}
                  onClick={() => handleSwitch(account.email, targetUrl)}
                  className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between ${
                    account.color
                  } ${isActive ? 'ring-2 ring-slate-800 font-bold' : 'opacity-90 hover:opacity-100'}`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate">{account.label}</span>
                      {isActive && (
                        <span className="flex items-center gap-0.5 text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded-sm">
                          <Check className="w-2.5 h-2.5" /> Attivo
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] opacity-75 truncate">{account.desc}</div>
                  </div>

                  <div className="shrink-0 text-right">
                    {isLoading ? (
                      <span className="text-[10px] animate-spin">⏳</span>
                    ) : (
                      <span className="text-[10px] font-semibold underline decoration-dotted">
                        Passa a {account.badge} &rarr;
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

