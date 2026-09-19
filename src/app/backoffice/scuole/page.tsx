// src/app/backoffice/scuole/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Clock,
  Package,
  Plus,
  ShieldCheck,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  School as SchoolIcon,
  ChevronRight,
} from 'lucide-react';

export default function SchoolsManagementPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/schools');
      const json = await res.json();
      setSchools(json.schools || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSchoolStockTracking = async (school: any) => {
    const updated = !school.enableStockTracking;
    setSchools(
      schools.map((s) =>
        s.id === school.id ? { ...s, enableStockTracking: updated } : s
      )
    );

    try {
      setSavingId(school.id);
      await fetch('/api/schools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: school.id,
          enableStockTracking: updated,
        }),
      });
    } catch (err) {
      console.error(err);
      loadSchools();
    } finally {
      setSavingId(null);
    }
  };

  const updateCutoffTime = async (schoolId: string, cutoffTime: string) => {
    setSchools(
      schools.map((s) =>
        s.id === schoolId ? { ...s, orderCutoffTime: cutoffTime } : s
      )
    );

    try {
      setSavingId(schoolId);
      await fetch('/api/schools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          orderCutoffTime: cutoffTime,
        }),
      });
    } catch (err) {
      console.error(err);
      loadSchools();
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-semibold text-slate-600">Caricamento anagrafica scuole e sedi...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Pannello Direzione
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Gestione Scuole, Sedi & Classi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configura la multi-sede, gli orari limite di ordinazione e attiva il tracciamento scorte per singola scuola.
          </p>
        </div>
      </div>

      {/* Lista Scuole */}
      <div className="space-y-6">
        {schools.map((school) => (
          <div
            key={school.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Header Scuola */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 backdrop-blur rounded-2xl shrink-0">
                  <SchoolIcon className="w-7 h-7 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black">{school.name}</h2>
                    <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-md">
                      {school.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {school.address || 'Sede Principale'}
                  </p>
                </div>
              </div>

              {/* Impostazioni Scuola (Scorte & Cutoff) */}
              <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur p-3 rounded-2xl">
                {/* Orario Limite */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-semibold">Chiusura Ordini:</span>
                  <input
                    type="time"
                    value={school.orderCutoffTime}
                    onChange={(e) => updateCutoffTime(school.id, e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1 text-xs font-bold focus:outline-hidden focus:bg-white focus:text-slate-900 cursor-pointer"
                  />
                </div>

                <div className="h-6 w-px bg-white/20 hidden sm:block"></div>

                {/* Switch Tracciamento Scorte Opzionale */}
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-semibold">Tracciamento Scorte:</span>
                  <button
                    onClick={() => toggleSchoolStockTracking(school)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      school.enableStockTracking
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/20 text-slate-200 hover:bg-white/30'
                    }`}
                  >
                    {school.enableStockTracking ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        <span>Attivo per la Scuola</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        <span>Disattivato</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sedi (Branches) & Classi */}
            <div className="p-6 space-y-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Sedi & Plessi della Scuola ({school.branches.length})
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {school.branches.map((branch: any) => (
                  <div
                    key={branch.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-600" />
                          <span>{branch.name}</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{branch.address}</p>
                      </div>
                      <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                        {branch.classrooms.length} Classi
                      </span>
                    </div>

                    {/* Elenco Classi del Plesso */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Classi & Responsabili Assegnati:
                      </div>
                      <div className="space-y-1.5">
                        {branch.classrooms.map((cls: any) => {
                          const rep = cls.users?.[0];
                          return (
                            <div
                              key={cls.id}
                              className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                                  {cls.name}
                                </span>
                                <span className="text-slate-600 font-medium">
                                  {cls.section || 'Corso'}
                                </span>
                                <span className="text-slate-400 text-[11px]">
                                  ({cls.floor || 'Piano'})
                                </span>
                              </div>

                              <div className="text-right">
                                {rep ? (
                                  <span className="text-blue-700 font-bold flex items-center gap-1">
                                    <span>⭐ {rep.name}</span>
                                  </span>
                                ) : (
                                  <span className="text-amber-600 font-medium">
                                    Da assegnare
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

