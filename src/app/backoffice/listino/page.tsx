// src/app/backoffice/listino/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Sandwich,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Package,
  Layers,
  Search,
  X,
} from 'lucide-react';

export default function ProductListinoPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modale Aggiunta/Modifica
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isAvailable: true,
    stockQuantity: '',
    allergens: '',
    isVegetarian: false,
    isGlutenFree: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);
      setSchoolSettings(data.schoolSettings);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (product: any) => {
    const updatedStatus = !product.isAvailable;
    // Optimistic
    setProducts(
      products.map((p) =>
        p.id === product.id ? { ...p, isAvailable: updatedStatus } : p
      )
    );

    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: updatedStatus }),
      });
    } catch (err) {
      console.error(err);
      loadProducts();
    }
  };

  const handleUpdateStock = async (product: any, newStock: number | null) => {
    setProducts(
      products.map((p) =>
        p.id === product.id ? { ...p, stockQuantity: newStock } : p
      )
    );

    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newStock }),
      });
    } catch (err) {
      console.error(err);
      loadProducts();
    }
  };

  const openCreateModal = () => {
    setIsNew(true);
    setFormData({
      name: '',
      description: '',
      price: '2.50',
      categoryId: categories[0]?.id || '',
      imageUrl: '',
      isAvailable: true,
      stockQuantity: '',
      allergens: 'Glutine',
      isVegetarian: false,
      isGlutenFree: false,
    });
    setEditingProduct({});
  };

  const openEditModal = (p: any) => {
    setIsNew(false);
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description || '',
      price: p.price.toString(),
      categoryId: p.categoryId,
      imageUrl: p.imageUrl || '',
      isAvailable: p.isAvailable,
      stockQuantity: p.stockQuantity !== null ? p.stockQuantity.toString() : '',
      allergens: p.allergens || '',
      isVegetarian: p.isVegetarian,
      isGlutenFree: p.isGlutenFree,
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isNew) {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setEditingProduct(null);
          loadProducts();
        }
      } else {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setEditingProduct(null);
          loadProducts();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Eliminare definitivamente questo articolo dal listino?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gestione Listino & Disponibilità
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Aggiorna i prezzi, imposta prodotti esauriti con un clic e gestisci le scorte giornaliere.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Panino o Prodotto</span>
        </button>
      </div>

      {/* Info Tracciamento Scorte Scuola */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              Impostazione Scorte Scuola ({schoolSettings?.name || 'Scuola Corrente'}):
            </div>
            <div className="text-xs text-slate-500">
              {schoolSettings?.enableStockTracking ? (
                <span className="text-emerald-700 font-bold">
                  ✅ Tracciamento quantità residue ATTIVO per gli studenti
                </span>
              ) : (
                <span className="text-slate-500">
                  ⚪ Tracciamento quantità NON attivo (vige solo Disponibile / Esaurito)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="w-64">
          <input
            type="text"
            placeholder="Filtra per nome o categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tabella / Schede Prodotti */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.map((prod) => (
            <div
              key={prod.id}
              className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                !prod.isAvailable ? 'bg-red-50/20 opacity-80' : 'hover:bg-slate-50'
              }`}
            >
              {/* Immagine & Dettagli */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Sandwich className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                      {prod.name}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {prod.category?.name}
                    </span>
                    {prod.isVegetarian && (
                      <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.2 rounded-full">
                        Veg
                      </span>
                    )}
                    {prod.isGlutenFree && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.2 rounded-full">
                        Senza Glutine
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1">{prod.description}</p>
                  {prod.allergens && (
                    <div className="text-[11px] text-slate-400">
                      Allergeni: {prod.allergens}
                    </div>
                  )}
                </div>
              </div>

              {/* Controlli Prezzo, Toggle Disponibilità & Quantità Scorte */}
              <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Prezzo */}
                <div className="text-left md:text-right">
                  <div className="text-xs text-slate-400 font-medium">Prezzo</div>
                  <div className="text-base font-black text-slate-900">
                    €{prod.price.toFixed(2)}
                  </div>
                </div>

                {/* Scorte (se abilitate) */}
                {schoolSettings?.enableStockTracking && (
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600">Scorte:</span>
                    <input
                      type="number"
                      min="0"
                      value={prod.stockQuantity ?? ''}
                      onChange={(e) =>
                        handleUpdateStock(
                          prod,
                          e.target.value === '' ? null : parseInt(e.target.value)
                        )
                      }
                      placeholder="∞"
                      className="w-14 px-1.5 py-0.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                    />
                    <span className="text-[11px] text-slate-400">pz</span>
                  </div>
                )}

                {/* Toggle Disponibile / Esaurito */}
                <button
                  onClick={() => handleToggleAvailability(prod)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    prod.isAvailable
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {prod.isAvailable ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                      <span>Disponibile</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-red-600" />
                      <span>Esaurito</span>
                    </>
                  )}
                </button>

                {/* Edit & Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(prod)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    title="Modifica"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Aggiungi / Modifica Prodotto */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">
                {isNew ? 'Aggiungi Nuovo Prodotto a Listino' : 'Modifica Prodotto'}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Panino / Articolo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="es: Focaccia Crudo e Stracchino"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Prezzo (€)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrizione Ingredienti
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="es: Focaccia artigianale con olio evo, crudo di Parma e stracchino fresco"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Allergeni
                  </label>
                  <input
                    type="text"
                    value={formData.allergens}
                    onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                    placeholder="es: Glutine, Lattosio"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Scorte Giornaliere (Opzionale)
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="es: 30 (vuoto = illimitato)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL Immagine
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVegetarian}
                    onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                    className="rounded-sm text-emerald-600"
                  />
                  <span>🌱 Vegetariano</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isGlutenFree}
                    onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                    className="rounded-sm text-emerald-600"
                  />
                  <span>🌾 Senza Glutine</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Salva Articolo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

