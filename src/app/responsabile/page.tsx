// src/app/responsabile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Printer,
  RotateCcw,
  Check,
  Circle,
  Banknote,
  Send,
  Building2,
  PackageCheck,
  ChefHat,
  Receipt,
  FileText,
} from 'lucide-react';

export default function ClassRepPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  useEffect(() => {
    loadClassOrders();
  }, []);

  const loadClassOrders = async () => {
    try {
      setLoading(true);
      const [meRes, repRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/orders/class').then((r) => r.json()),
      ]);

      setUser(meRes?.user);
      setData(repRes);
    } catch (err) {
      console.error('Error loading class rep data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle pagamento singolo studente
  const toggleStudentPaid = async (studentId: string, currentPaid: boolean) => {
    try {
      // Optimistic UI update
      setData((prev: any) => {
        if (!prev) return prev;
        const newStudents = prev.studentsList.map((st: any) => {
          if (st.studentId === studentId) {
            return { ...st, isAllPaid: !currentPaid };
          }
          return st;
        });
        const newCollected = newStudents.reduce(
          (sum: number, st: any) => sum + (st.isAllPaid ? st.total : 0),
          0
        );
        return {
          ...prev,
          studentsList: newStudents,
          totalCollected: newCollected,
          allPaid: prev.totalDue > 0 && newCollected >= prev.totalDue,
        };
      });

      await fetch('/api/orders/class', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_STUDENT_PAID',
          studentId,
          isPaid: !currentPaid,
        }),
      });
    } catch (err) {
      console.error('Error toggling payment:', err);
      loadClassOrders();
    }
  };

  // Conferma ordine cumulativo per il bar
  const confirmClassOrder = async () => {
    if (data?.studentsList.length === 0) {
      alert('Nessun compagno di classe ha ancora ordinato panini per oggi.');
      return;
    }

    const uncollected = data.totalDue - data.totalCollected;
    if (uncollected > 0) {
      const ok = confirm(
        `Attenzione: risultano ancora €${uncollected.toFixed(
          2
        )} non incassati da alcuni compagni.\nVuoi comunque confermare e inviare l’ordine al bar?`
      );
      if (!ok) return;
    } else {
      const ok = confirm('Confermi l’ordine cumulativo della classe da inviare alla cucina del bar?');
      if (!ok) return;
    }

    try {
      setConfirming(true);
      const res = await fetch('/api/orders/class', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONFIRM_CLASS_ORDER',
          notes: `Confermato dal Responsabile (${user?.name})`,
        }),
      });

      if (res.ok) {
        alert('Ordine classe confermato e inviato alla cucina del bar!');
        loadClassOrders();
      } else {
        const err = await res.json();
        alert(err.error || 'Errore durante la conferma');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirming(false);
    }
  };

  // Riapri ordine
  const reopenOrder = async () => {
    if (!confirm('Vuoi riaprire l’ordine per consentire modifiche prima che inizi la preparazione?')) return;
    try {
      setConfirming(true);
      const res = await fetch('/api/orders/class', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REOPEN_CLASS_ORDER' }),
      });
      if (res.ok) {
        loadClassOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-semibold text-slate-600">Caricamento ordini classe...</div>
      </div>
    );
  }

  const classroom = data?.classroom;
  const classOrder = data?.classOrder;
  const studentsList = data?.studentsList || [];
  const totalDue = data?.totalDue || 0;
  const totalCollected = data?.totalCollected || 0;
  const missing = Math.max(0, totalDue - totalCollected);
  const isDraft = !classOrder || classOrder.status === 'DRAFT';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Responsabile */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              ⭐ Responsabile di Classe
            </span>
            <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">
              Classe {classroom?.name} • {classroom?.section}
            </span>
            <span className="bg-white/10 text-xs font-medium px-2.5 py-1 rounded-full">
              📍 {classroom?.branch?.name} ({classroom?.floor || 'Piano aule'})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Raccolta Ordini & Cassa Intervallo
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                Data comanda: <strong>{data?.date}</strong> • Raccogli i soldi dai compagni, spunta i pagati e conferma l'ordine per la cucina.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrintSlip(!showPrintSlip)}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Distinta di Ritiro</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute -right-16 -top-16 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Banner Stato Comanda e Azione Conferma */}
      <div
        className={`p-5 rounded-3xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDraft
            ? 'bg-amber-50/80 border-amber-200'
            : classOrder.status === 'READY'
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Stato Comanda Classe:
            </span>
            <span
              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                isDraft
                  ? 'bg-amber-200 text-amber-900'
                  : classOrder.status === 'READY'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {isDraft
                ? 'IN BOZZA (Non ancora visibile al Bar)'
                : classOrder.status === 'READY'
                ? 'PRONTO AL BAR PER IL RITIRO'
                : 'CONFERMATO • IN CUCINA'}
            </span>
          </div>

          <p className="text-xs text-slate-700">
            {isDraft
              ? 'Gli ordini sono ancora modificabili dai compagni. Quando hai raccolto le adesioni e i soldi, premi "Conferma e Invia al Bar".'
              : `Comanda confermata alle ore ${new Date(classOrder.confirmedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}. Il bar sta preparando la busta contrassegnata per la classe ${classroom?.name}.`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isDraft ? (
            <button
              onClick={confirmClassOrder}
              disabled={confirming || studentsList.length === 0}
              className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Conferma e Invia al Bar</span>
            </button>
          ) : (
            classOrder.status === 'CONFIRMED_BY_REP' && (
              <button
                onClick={reopenOrder}
                disabled={confirming}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Riapri Bozza per Modifiche</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Riquadri Statistiche Cassa e Denaro */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Compagni Ordinanti</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{studentsList.length}</div>
          <div className="text-[11px] text-slate-500">Studenti in {classroom?.name}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5 text-amber-600" />
            <span>Totale da Portare al Bar</span>
          </div>
          <div className="text-2xl font-black text-slate-900">€{totalDue.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500">Costo comanda complessiva</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Già Incassati</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            €{totalCollected.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">Contanti raccolti in classe</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span>Ancora Mancanti</span>
          </div>
          <div
            className={`text-2xl font-black ${
              missing > 0 ? 'text-red-600' : 'text-slate-400'
            }`}
          >
            €{missing.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">
            {missing === 0 ? 'Tutti i compagni hanno pagato! 🎉' : 'Da riscuotere prima del ritiro'}
          </div>
        </div>
      </div>

      {/* Modal / Card Distinta di Ritiro Stampabile */}
      {showPrintSlip && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-base">
                Distinta di Ritiro - Classe {classroom?.name} ({data?.date})
              </h3>
            </div>
            <button
              onClick={() => setShowPrintSlip(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              Chiudi
            </button>
          </div>

          <div className="text-xs text-slate-300">
            Porta questa distinta o mostra lo smartphone al bancone del bar assieme ai{' '}
            <strong className="text-amber-400 font-bold">€{totalDue.toFixed(2)}</strong> in contanti per ritirare la busta.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {studentsList.map((st: any) => (
              <div key={st.studentId} className="p-2.5 bg-slate-800 rounded-xl space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>{st.studentName}</span>
                  <span className="text-amber-400">€{st.total.toFixed(2)}</span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  {st.items.map((it: any) => (
                    <div key={it.id}>
                      • {it.quantity}x {it.product.name} {it.customization && `(${it.customization})`}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Stampa Scheda Busta</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista Ordinazioni dei Compagni con Checkbox Incasso */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Dettaglio Ordini Compagni ({studentsList.length})
            </h2>
            <p className="text-xs text-slate-500">
              Fai clic sulla casella "Pagato" quando ricevi i contanti dal compagno.
            </p>
          </div>
        </div>

        {studentsList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto opacity-40" />
            <div className="text-sm font-bold text-slate-700">Nessun ordine presente</div>
            <div className="text-xs text-slate-500">
              I tuoi compagni della {classroom?.name} non hanno ancora inviato richieste per oggi.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {studentsList.map((st: any) => (
              <div
                key={st.studentId}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  st.isAllPaid ? 'bg-emerald-50/30' : 'hover:bg-slate-50'
                }`}
              >
                {/* Nome studente e panini ordinati */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 truncate">
                      {st.studentName}
                    </span>
                    {st.isAllPaid ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Pagato
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.2 rounded-full">
                        In attesa contanti
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {st.items.map((it: any) => (
                      <div
                        key={it.id}
                        className="text-xs text-slate-600 flex items-center gap-2 flex-wrap"
                      >
                        <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {it.quantity}x
                        </span>
                        <span>{it.product.name}</span>
                        {it.customization && (
                          <span className="text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md text-[11px] font-medium">
                            📝 {it.customization}
                          </span>
                        )}
                        <span className="text-slate-400 font-mono text-[11px]">
                          (€{(it.unitPrice * it.quantity).toFixed(2)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Importo e Bottone Spunta Pagamento */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium">Da versare</div>
                    <div className="text-base font-black text-slate-900">
                      €{st.total.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStudentPaid(st.studentId, st.isAllPaid)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                      st.isAllPaid
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                    }`}
                  >
                    {st.isAllPaid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Incassato</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-slate-400" />
                        <span>Segna come Pagato</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

