// src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sandwich, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenziali non valide');
      }

      // Reindirizza in base al ruolo
      if (data.user.role === 'CATERING') {
        router.push('/backoffice/cucina');
      } else if (data.user.role === 'ADMIN') {
        router.push('/backoffice/scuole');
      } else if (data.user.role === 'CLASS_REP') {
        router.push('/responsabile');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async (provider: 'GOOGLE' | 'MICROSOFT') => {
    setLoading(true);
    setError(null);

    try {
      // Simula / esegue SSO OIDC per account istituzionale
      const simulatedEmail = provider === 'GOOGLE' ? 'studente.google@scuola.edu.it' : 'studente.ms@scuola.edu.it';
      const simulatedName = provider === 'GOOGLE' ? 'Studente Google SSO' : 'Studente Microsoft SSO';

      const res = await fetch('/api/auth/sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          email: simulatedEmail,
          name: simulatedName,
        }),
      });

      if (!res.ok) throw new Error('Errore durante l’accesso SSO');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (userEmail: string, roleUrl: string) => {
    setEmail(userEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-emerald-600 to-amber-500 rounded-2xl text-white shadow-md shadow-emerald-600/20">
            <Sandwich className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Paninoteca Scolastica
          </h1>
          <p className="text-sm text-slate-600 max-w-xs mx-auto">
            Ordina il tuo panino preferito per l'intervallo con consegna diretta in classe
          </p>
        </div>

        {/* Card di Accesso */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form Email & Password */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Scolastica o Personale
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="mario.rossi@scuola.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Accesso in corso...' : 'Accedi con Credenziali'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Separatore SSO */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-3 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              oppure SSO Istituzionale
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Pulsanti SSO Google e Microsoft */}
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSSOLogin('GOOGLE')}
              className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Accedi con Google Workspace (@scuola.edu.it)</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSSOLogin('MICROSOFT')}
              className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <span>Accedi con Microsoft 365 (Entra ID)</span>
            </button>
          </div>

          {/* Quick Demo Pre-fill Links */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Compilazione Rapida Demo:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => quickFill('mario.rossi@scuola.it', '/')}
                className="p-1.5 text-left bg-emerald-50 text-emerald-800 rounded-lg hover:bg-emerald-100 font-medium"
              >
                👦 Studente (Mario)
              </button>
              <button
                type="button"
                onClick={() => quickFill('luca.bianchi@scuola.it', '/responsabile')}
                className="p-1.5 text-left bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 font-medium"
              >
                ⭐ Resp. Classe (Luca)
              </button>
              <button
                type="button"
                onClick={() => quickFill('bar@scuola.it', '/backoffice/cucina')}
                className="p-1.5 text-left bg-amber-50 text-amber-900 rounded-lg hover:bg-amber-100 font-medium"
              >
                🥪 Bar / Ristorazione
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@scuola.it', '/backoffice/scuole')}
                className="p-1.5 text-left bg-purple-50 text-purple-900 rounded-lg hover:bg-purple-100 font-medium"
              >
                🏫 Amministrazione
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Multi-scuola & Multi-sede • Piattaforma Istituzionale</span>
        </div>
      </div>
    </div>
  );
}

