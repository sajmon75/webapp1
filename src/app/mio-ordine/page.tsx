// src/app/mio-ordine/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Sandwich,
  Users,
  ChefHat,
  PackageCheck,
  ArrowLeft,
  Banknote,
} from 'lucide-react';

export default function MyOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const [meRes, orderRes] = await fetch('/api/auth/me').then((r) => r.json()),
        orderJson = await fetch('/api/orders/student').then((r) => r.json());

      setUser(meRes?.user);
      setOrderData(orderJson);
    } catch (err) {
      console.error('Error fetching my order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Sei sicuro di voler annullare il tuo ordine per oggi?')) return;

    try {
      setCancelling(true);
      const res = await fetch('/api/orders/student', { method: 'DELETE' });
      if (res.ok) {
        alert('Ordine annullato con successo.');
        router.push('/');
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error || 'Errore durante annullamento');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-semibold text-slate-600">Caricamento del tuo ordine...</div>
      </div>
    );
  }

  const items = orderData?.myItems || [];
  const classOrder = orderData?.classOrder;
  const isDraft = !classOrder || classOrder.status === 'DRAFT';
  const isConfirmed = classOrder && classOrder.status !== 'DRAFT';
  const isAllPaid = items.length > 0 && items.every((i: any) => i.isPaid);

  const getStatusInfo = () => {
    if (!classOrder || classOrder.status === 'DRAFT') {
      return {
        badge: 'In attesa di conferma responsabile',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        desc: 'Il tuo ordine è salvato in bozza. Il responsabile della classe raccoglierà i contanti e confermerà la comanda cumulativa per il bar.',
        step: 1,
      };
    }
    if (classOrder.status === 'CONFIRMED_BY_REP') {
      return {
        badge: 'Confermato dal Responsabile • In Cucina',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        desc: `Confermato alle ore ${new Date(classOrder.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} da ${classOrder.confirmedBy || 'Responsabile'}. La cucina sta preparando le buste.`,
        step: 2,
      };
    }
    if (classOrder.status === 'PREPARING') {
      return {
        badge: 'In Preparazione al Bar',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        desc: 'Il personale della cucina sta confezionando i panini per la tua classe.',
        step: 3,
      };
    }
    if (classOrder.status === 'READY') {
      return {
        badge: 'Pronto per il Ritiro!',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        desc: 'La busta della tua classe è pronta al bancone del bar! Il responsabile può ritirarla portando i contanti.',
        step: 4,
      };
    }
    return {
      badge: 'Consegnato / Concluso',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      desc: 'Ordine dell’intervallo ritirato e distribuito con successo!',
      step: 5,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Torna al menu */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Torna al catalogo panini</span>
        </Link>
      </div>

      {/* Card Principale Stato Ordine */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Intervallo di Oggi ({orderData?.date})
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              Il Tuo Ordine Personale
            </h1>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Classe {user?.classroom?.name} • {user?.branch?.name}
            </div>
          </div>

          <div className="shrink-0">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
            >
              {statusInfo.badge}
            </span>
          </div>
        </div>

        {/* Stepper Grafico */}
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div
              className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${
                statusInfo.step >= 1 ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-400'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-[10px]">1. Ordinato</span>
            </div>
            <div
              className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${
                statusInfo.step >= 2 ? 'bg-blue-50 text-blue-800' : 'bg-slate-50 text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px]">2. Resp. Convalida</span>
            </div>
            <div
              className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${
                statusInfo.step >= 3 ? 'bg-indigo-50 text-indigo-800' : 'bg-slate-50 text-slate-400'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span className="text-[10px]">3. Cucina Bar</span>
            </div>
            <div
              className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${
                statusInfo.step >= 4 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-400'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span className="text-[10px]">4. Pronto Ritiro</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {statusInfo.desc}
          </p>
        </div>

        {/* Lista Articoli Ordinati */}
        {items.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-3xl">🥪</div>
            <div className="font-bold text-slate-800 text-sm">
              Non hai ancora ordinato nulla per oggi!
            </div>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700"
            >
              Vai al menu e ordina &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Articoli nel tuo sacchetto:
              </span>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {items.map((item: any) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {item.quantity}x
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {item.product?.name}
                        </div>
                        {item.customization && (
                          <div className="text-xs text-slate-500 italic">
                            "{item.customization}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-slate-900">
                        €{(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        €{item.unitPrice.toFixed(2)} cad.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box Pagamento Contanti per il Responsabile */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Contanti per il responsabile:
                  </div>
                  <div className="text-lg font-black text-amber-950">
                    €{orderData.totalMyOrder.toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                {isAllPaid ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pagato
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-200 text-amber-900 text-xs font-bold rounded-full">
                    Da Pagare al Resp.
                  </span>
                )}
              </div>
            </div>

            {/* Azioni Modifica / Annulla */}
            {isDraft && (
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Link
                  href="/"
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs text-center transition-colors"
                >
                  Modifica Articoli nel Menu
                </Link>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Annulla Ordine</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

