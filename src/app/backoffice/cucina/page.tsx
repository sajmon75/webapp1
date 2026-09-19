// src/app/backoffice/cucina/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChefHat,
  PackageCheck,
  CheckCircle2,
  Clock,
  Printer,
  Filter,
  Sandwich,
  Building2,
  Banknote,
  Users,
  Check,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export default function KitchenDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'bags' | 'prep'>('bags');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadKitchenData();
  }, [selectedBranch]);

  const loadKitchenData = async () => {
    try {
      setLoading(true);
      const url =
        selectedBranch === 'all'
          ? '/api/orders/kitchen'
          : `/api/orders/kitchen?branchId=${selectedBranch}`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      // Optimistic update
      setData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          classOrders: prev.classOrders.map((ord: any) =>
            ord.id === orderId ? { ...ord, status: newStatus } : ord
          ),
        };
      });

      await fetch('/api/orders/kitchen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus }),
      });
    } catch (err) {
      console.error(err);
      loadKitchenData();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-semibold text-slate-600">Caricamento ordini confermati...</div>
      </div>
    );
  }

  const classOrders = data?.classOrders || [];
  const prepSummary = data?.prepSummary || [];
  const branches = data?.branches || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Intestazione Cucina & KPIs */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-black/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5 text-amber-200" /> Servizio Ristorazione & Bar
              </span>
              <span className="bg-white/20 text-xs font-semibold px-2.5 py-1 rounded-full">
                Oggi ({data?.date})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dashboard Cucina & Consegna Buste
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm">
              Visualizza gli ordini confermati dai responsabili di classe, la distinta aggregata ingredienti e le buste da consegnare.
            </p>
          </div>

          {/* Filtro Plesso / Sede */}
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur p-2 rounded-2xl shrink-0">
            <Filter className="w-4 h-4 text-amber-200 ml-1" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">
                Tutte le Sedi / Plessi
              </option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metriche Rapide */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/20">
          <div>
            <div className="text-[11px] text-amber-200 uppercase tracking-wider font-semibold">
              Buste / Classi
            </div>
            <div className="text-2xl font-black">{data?.totalClasses || 0}</div>
          </div>
          <div>
            <div className="text-[11px] text-amber-200 uppercase tracking-wider font-semibold">
              Totale Pezzi
            </div>
            <div className="text-2xl font-black">{data?.totalItems || 0}</div>
          </div>
          <div>
            <div className="text-[11px] text-amber-200 uppercase tracking-wider font-semibold">
              Incasso Totale
            </div>
            <div className="text-2xl font-black">€{(data?.totalRevenue || 0).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Selettore Vista Tab: Buste vs Preparazione Aggregata */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bags')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'bags'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Buste per Classe ({classOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('prep')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'prep'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Distinta Preparazione Cumulativa ({prepSummary.length} tipologie)</span>
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Stampa</span>
        </button>
      </div>

      {/* VISTA 1: BUSTE PER CLASSE */}
      {activeTab === 'bags' && (
        <div>
          {classOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <ChefHat className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-base font-bold text-slate-800">
                Nessun ordine confermato pervenuto
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Gli ordini delle classi compariranno qui non appena i rispettivi rappresentanti di classe confermeranno la comanda dopo aver raccolto i contanti.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classOrders.map((order: any) => {
                const isReady = order.status === 'READY';
                const isDelivered = order.status === 'DELIVERED';
                const isPreparing = order.status === 'PREPARING';

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                      isDelivered
                        ? 'opacity-60 border-slate-200 bg-slate-50'
                        : isReady
                        ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Header Busta */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-lg">
                          Busta {order.classroom.name}
                        </span>
                        <span
                          className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            isDelivered
                              ? 'bg-slate-200 text-slate-700'
                              : isReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPreparing
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isDelivered
                            ? 'RITIRATO'
                            : isReady
                            ? 'PRONTO'
                            : isPreparing
                            ? 'IN LAVORAZIONE'
                            : 'IN CODA'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-medium">
                        📍 {order.classroom.branch?.name} • {order.classroom.floor || 'Piano aule'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Resp: <strong className="text-slate-700">{order.confirmedBy?.name || 'Incaricato'}</strong>
                      </div>
                    </div>

                    {/* Dettaglio Contenuto Busta */}
                    <div className="space-y-1.5 border-t border-b border-slate-100 py-3">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Contenuto Busta ({order.items.length} articoli):
                      </div>
                      <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
                        {order.items.map((it: any) => (
                          <div key={it.id} className="flex items-start justify-between gap-2">
                            <span className="text-slate-800">
                              <strong className="text-emerald-700">{it.quantity}x</strong>{' '}
                              {it.product.name}
                              {it.customization && (
                                <span className="block text-[11px] text-amber-700 italic">
                                  ({it.student?.name}: {it.customization})
                                </span>
                              )}
                            </span>
                            <span className="text-slate-400 font-mono shrink-0 text-[11px]">
                              €{(it.unitPrice * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totale Cassa da Incassare & Azioni Stato */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl text-amber-950">
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-amber-700" />
                          <span>Da incassare al ritiro:</span>
                        </div>
                        <div className="text-base font-black">
                          €{order.totalAmount.toFixed(2)}
                        </div>
                      </div>

                      {/* Bottoni Avanzamento */}
                      <div className="grid grid-cols-2 gap-2">
                        {!isReady && !isDelivered && (
                          <button
                            disabled={updatingId === order.id}
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                            className="w-full col-span-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <PackageCheck className="w-4 h-4" />
                            <span>Segna come Pronto</span>
                          </button>
                        )}

                        {isReady && (
                          <button
                            disabled={updatingId === order.id}
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            className="w-full col-span-2 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Ritirato con Contanti</span>
                          </button>
                        )}

                        {isDelivered && (
                          <button
                            disabled={updatingId === order.id}
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                            className="w-full col-span-2 py-1.5 text-slate-400 hover:text-slate-600 text-[11px] font-semibold text-center"
                          >
                            Annulla ritiro (riporta a pronto)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: DISTINTA PREPARAZIONE CUMULATIVA */}
      {activeTab === 'prep' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Totale Quantità da Farcire e Confezionare
              </h2>
              <p className="text-xs text-slate-500">
                Riepilogo totale ordinato per l'intervallo aggregato su tutte le classi confermate.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {prepSummary.map((item: any) => (
              <div key={item.productId} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center font-black text-lg shrink-0 border border-amber-200">
                    {item.totalQuantity}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {item.productName}
                    </div>
                    {item.customizations.length > 0 ? (
                      <div className="mt-1 space-y-0.5">
                        <span className="text-[11px] font-bold text-amber-800">
                          Varianti e Note speciali ({item.customizations.length}):
                        </span>
                        {item.customizations.map((c: string, idx: number) => (
                          <div key={idx} className="text-xs text-slate-600 pl-2 border-l-2 border-amber-300">
                            {c}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">Preparazione standard</div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                    Totale: {item.totalQuantity} pz
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

