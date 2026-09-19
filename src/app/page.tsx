// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sandwich,
  Flame,
  Salad,
  Cookie,
  CupSoda,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<any>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterGlutenFree, setFilterGlutenFree] = useState(false);

  // Carrello locale per ordinazione
  const [cart, setCart] = useState<Record<string, { quantity: number; customization: string }>>({});
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);
  const [modalCustomization, setModalCustomization] = useState('');
  const [modalQuantity, setModalQuantity] = useState(1);

  // Ordine già inviato per oggi
  const [existingOrder, setExistingOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // 1. Profilo utente
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setUser(meData.user);

      // 2. Prodotti e impostazioni scuola
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      setProducts(prodData.products || []);
      setCategories(prodData.categories || []);
      setSchoolSettings(prodData.schoolSettings);

      // 3. Se studente o responsabile, carica l'ordine già piazzato oggi
      if (meData.user?.classroomId) {
        const orderRes = await fetch('/api/orders/student');
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setExistingOrder(orderData);
          // Se ci sono articoli già ordinati e modificabili, pre-popola il carrello
          if (orderData.myItems && orderData.myItems.length > 0 && orderData.classOrder?.status === 'DRAFT') {
            const initialCart: Record<string, { quantity: number; customization: string }> = {};
            for (const it of orderData.myItems) {
              initialCart[it.productId] = {
                quantity: it.quantity,
                customization: it.customization || '',
              };
            }
            setCart(initialCart);
          }
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCustomizationModal = (product: any) => {
    setSelectedProductForModal(product);
    const existing = cart[product.id];
    setModalQuantity(existing?.quantity || 1);
    setModalCustomization(existing?.customization || '');
  };

  const saveProductToCart = () => {
    if (!selectedProductForModal) return;

    if (modalQuantity <= 0) {
      const newCart = { ...cart };
      delete newCart[selectedProductForModal.id];
      setCart(newCart);
    } else {
      setCart({
        ...cart,
        [selectedProductForModal.id]: {
          quantity: modalQuantity,
          customization: modalCustomization,
        },
      });
    }
    setSelectedProductForModal(null);
  };

  const removeFromCart = (productId: string) => {
    const newCart = { ...cart };
    delete newCart[productId];
    setCart(newCart);
  };

  const submitOrder = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const itemsToSend = Object.entries(cart).map(([productId, val]) => ({
      productId,
      quantity: val.quantity,
      customization: val.customization,
    }));

    if (itemsToSend.length === 0) {
      setOrderMessage({ type: 'error', text: 'Seleziona almeno un prodotto per ordinare.' });
      return;
    }

    setSubmitting(true);
    setOrderMessage(null);

    try {
      const res = await fetch('/api/orders/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToSend }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Impossibile inviare ordine');
      }

      setOrderMessage({
        type: 'success',
        text: 'Ordine inviato con successo! Ricorda di consegnare i contanti al responsabile della tua classe.',
      });

      // Ricarica stato
      loadData();
    } catch (err: any) {
      setOrderMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Calcolo totale carrello
  const cartItemCount = Object.values(cart).reduce((sum, it) => sum + it.quantity, 0);
  const cartTotalEuro = Object.entries(cart).reduce((sum, [pid, val]) => {
    const prod = products.find((p) => p.id === pid);
    return sum + (prod ? prod.price * val.quantity : 0);
  }, 0);

  // Filtro prodotti
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (filterVeg && !p.isVegetarian) return false;
    if (filterGlutenFree && !p.isGlutenFree) return false;
    if (
      searchQuery.trim() !== '' &&
      !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'Salad':
        return <Salad className="w-4 h-4" />;
      case 'Cookie':
        return <Cookie className="w-4 h-4" />;
      case 'CupSoda':
        return <CupSoda className="w-4 h-4" />;
      default:
        return <Sandwich className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-semibold text-slate-600">Caricamento menu dell'intervallo...</div>
      </div>
    );
  }

  // Se l'utente è Bar / Ristorazione, diamo evidenza diretta alla vista cucina
  if (user && user.role === 'CATERING') {
    return (
      <div className="py-8 text-center space-y-6 max-w-lg mx-auto">
        <div className="p-4 bg-amber-100 text-amber-900 rounded-3xl inline-flex">
          <Sandwich className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Accesso Servizio Ristorazione</h1>
        <p className="text-slate-600 text-sm">
          Sei autenticato come operatore del Bar/Ristorazione. Puoi accedere alla schermata cucina per preparare le buste delle classi o gestire il listino prezzi e le scorte.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/backoffice/cucina"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
          >
            Dashboard Cucina & Buste &rarr;
          </Link>
          <Link
            href="/backoffice/listino"
            className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all"
          >
            Gestione Listino & Scorte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Banner Intestazione Studente */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white/20 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-full">
              🎒 {user?.school?.name || 'Scuola Superiore'}
            </span>
            {user?.classroom && (
              <span className="bg-amber-400 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                Classe {user.classroom.name}
              </span>
            )}
            {user?.branch && (
              <span className="bg-white/15 text-xs font-medium px-2.5 py-1 rounded-full">
                📍 {user.branch.name}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Cosa desideri per l'intervallo? 🥪
          </h1>

          <p className="text-emerald-50 text-xs sm:text-sm">
            Scegli il tuo panino o snack. Il responsabile della tua classe raccoglierà i contanti e confermerà la comanda cumulativa per il bar.
          </p>

          <div className="flex items-center gap-2 pt-1 text-xs text-emerald-100 font-medium">
            <Clock className="w-4 h-4 text-amber-300" />
            <span>
              Chiusura ordini ore{' '}
              <strong className="text-white font-bold">
                {schoolSettings?.orderCutoffTime || '09:30'}
              </strong>
            </span>
            {schoolSettings?.enableStockTracking && (
              <span className="ml-2 bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-md">
                📦 Quantità limitate attive
              </span>
            )}
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Avviso Stato Ordine Esistente */}
      {existingOrder?.classOrder && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
            existingOrder.classOrder.status === 'CONFIRMED_BY_REP'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : existingOrder.classOrder.status === 'READY'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                Stato Ordine Classe Oggi:
              </div>
              <div className="text-sm font-semibold mt-0.5">
                {existingOrder.classOrder.status === 'DRAFT' && (
                  <span>
                    Bozza in corso. Puoi ancora modificare il tuo ordine prima che il responsabile confermi.
                  </span>
                )}
                {existingOrder.classOrder.status === 'CONFIRMED_BY_REP' && (
                  <span>
                    Confermato dal responsabile ({existingOrder.classOrder.confirmedBy || 'Resp.'})! In preparazione al bar.
                  </span>
                )}
                {existingOrder.classOrder.status === 'READY' && (
                  <span className="font-bold text-emerald-700">
                    🎉 Busta pronta al bar! Il responsabile può ritirarla.
                  </span>
                )}
              </div>
              <div className="text-xs opacity-80 mt-1">
                Totale per te: <strong>€{existingOrder.totalMyOrder.toFixed(2)}</strong> (da dare al responsabile di classe)
              </div>
            </div>
          </div>

          <Link
            href="/mio-ordine"
            className="shrink-0 px-3 py-1.5 bg-white shadow-xs rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Vedi Dettaglio &rarr;
          </Link>
        </div>
      )}

      {orderMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-semibold ${
            orderMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{orderMessage.text}</span>
          <button onClick={() => setOrderMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categorie e Barra di Ricerca */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Categorie Pills (Scroll orizzontale) */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tutti i Prodotti
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ricerca e Filtri Dietetici */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cerca panino, ingrediente, bibita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterVeg(!filterVeg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                filterVeg
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🌱 Vegetariano
            </button>
            <button
              onClick={() => setFilterGlutenFree(!filterGlutenFree)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                filterGlutenFree
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🌾 Senza Glutine
            </button>
          </div>
        </div>
      </div>

      {/* Griglia Prodotti */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="text-3xl">🥪</div>
          <div className="text-base font-bold text-slate-800">Nessun prodotto trovato</div>
          <div className="text-xs text-slate-500">
            Prova a modificare i filtri di ricerca o la categoria selezionata.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const inCart = cart[product.id];
            const isOutOfStock = !product.isAvailable || (product.stockQuantity !== null && product.stockQuantity <= 0);
            const isOrderLocked = existingOrder?.classOrder && existingOrder.classOrder.status !== 'DRAFT';

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isOutOfStock ? 'opacity-65 bg-slate-50/70' : ''
                }`}
              >
                {/* Immagine con badge sovrapposti */}
                <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Sandwich className="w-12 h-12" />
                    </div>
                  )}

                  {/* Badge Disponibilità */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {isOutOfStock && (
                      <span className="bg-red-600 text-white text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                        Esaurito
                      </span>
                    )}
                    {!isOutOfStock && schoolSettings?.enableStockTracking && product.stockQuantity !== null && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                          product.stockQuantity <= 5
                            ? 'bg-amber-500 text-white'
                            : 'bg-white/90 text-slate-700 backdrop-blur'
                        }`}
                      >
                        {product.stockQuantity} rimasti
                      </span>
                    )}
                  </div>

                  {/* Badge Dietetici */}
                  <div className="absolute top-2.5 right-2.5 flex gap-1">
                    {product.isVegetarian && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Veg
                      </span>
                    )}
                    {product.isGlutenFree && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Senza Glutine
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Prodotto */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400 font-medium">
                      {product.category?.name}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                    {product.allergens && (
                      <div className="text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-500">Allergeni:</span> {product.allergens}
                      </div>
                    )}
                  </div>

                  {/* Prezzo e Azione Aggiunta */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-slate-900">
                        €{product.price.toFixed(2)}
                      </span>
                    </div>

                    {isOutOfStock ? (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                        Non Disponibile
                      </span>
                    ) : isOrderLocked ? (
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Ordine Bloccato
                      </span>
                    ) : inCart ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openCustomizationModal(product)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200"
                        >
                          Q.tà: {inCart.quantity} • Modifica
                        </button>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                          title="Rimuovi"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openCustomizationModal(product)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Aggiungi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Personalizzazione e Quantità */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold">
                  {selectedProductForModal.category?.name}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedProductForModal.name}
                </h3>
                <div className="text-emerald-700 font-extrabold text-base">
                  €{selectedProductForModal.price.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selettore Quantità */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantità
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-lg text-slate-900 w-8 text-center">
                  {modalQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-500 font-medium ml-2">
                  Totale: €{(selectedProductForModal.price * modalQuantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Note e Personalizzazioni */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Note e Preferenze per il Bar (Opzionale)
              </label>
              <input
                type="text"
                placeholder="es: Senza maionese, pane integrale, ben tostato..."
                value={modalCustomization}
                onChange={(e) => setModalCustomization(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={saveProductToCart}
                className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Conferma nel Carrello
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Bar (Stile App Mobile per Invio Ordine) */}
      {cartItemCount > 0 && (!existingOrder?.classOrder || existingOrder.classOrder.status === 'DRAFT') && (
        <aside aria-label="Riepilogo Carrello" className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl px-4 py-3 sm:py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold relative shadow-xs">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold">Il tuo ordine di oggi</div>
                <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  €{cartTotalEuro.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={submitOrder}
                disabled={submitting}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Invio in corso...' : 'Invia al Responsabile'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

