'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  LayoutGrid,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Search,
  Eye,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import ConfirmDialog from './ConfirmDialog';
import { buttonTap, iconTap, modalVariants, backdropVariants } from '../utils/motion';

export default function AdminHomeShowcaseManager({ showToast }) {
  const {
    products,
    homeShowcase,
    homeLimits,
    addToHomeShowcase,
    removeFromHomeShowcase,
  } = useProducts();

  const [activeSection, setActiveSection] = useState('heroDeals'); // 'heroDeals' | 'flashDeals'
  const [selectedProdToAdd, setSelectedProdToAdd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionModal, setRejectionModal] = useState(null); // { title, message }
  const [itemToRemove, setItemToRemove] = useState(null); // { section, product }

  const heroLimit = homeLimits?.heroDeals || 2;
  const flashLimit = homeLimits?.flashDeals || 6;

  const currentLimit = activeSection === 'heroDeals' ? heroLimit : flashLimit;
  const currentItems = Array.isArray(homeShowcase?.[activeSection]) ? homeShowcase[activeSection] : [];

  // Resolve product objects for current section
  const sectionProducts = useMemo(() => {
    return currentItems.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  }, [currentItems, products]);

  // Available products to add (not already in current section)
  const availableProducts = useMemo(() => {
    return products.filter((p) => {
      const notInCurrent = !currentItems.includes(p.id);
      const matchesSearch = searchQuery.trim()
        ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      return notInCurrent && matchesSearch;
    });
  }, [products, currentItems, searchQuery]);

  const handleAttemptAdd = async (productId) => {
    const id = productId || selectedProdToAdd;
    if (!id) {
      if (showToast) showToast('Please select a product to feature', 'error');
      return;
    }

    const targetProduct = products.find((p) => p.id === id);
    const prodName = targetProduct?.name || 'Selected product';

    // STRICT LIMIT REJECTION: If already at or above limit, reject immediately!
    if (currentItems.length >= currentLimit) {
      const sectionName = activeSection === 'heroDeals' ? 'Hero Promotional Deals' : 'Today\'s Flash Deals';
      setRejectionModal({
        title: 'Home Screen Limit Reached',
        message: `Strict Limit: You cannot feature more than ${currentLimit} products in the "${sectionName}" section. AgriMart rejected adding "${prodName}" to preserve layout integrity. Please remove an existing product first to make room.`,
      });
      if (showToast) {
        showToast(`Rejected: Maximum ${currentLimit} items allowed in ${sectionName}`, 'error');
      }
      return;
    }

    try {
      await addToHomeShowcase(activeSection, id);
      if (showToast) {
        showToast(`"${prodName}" added to Home Screen ${activeSection === 'heroDeals' ? 'Hero Deals' : 'Flash Deals'}!`, 'success');
      }
      setSelectedProdToAdd('');
    } catch (err) {
      if (err.message.includes('Limit reached')) {
        setRejectionModal({
          title: 'Limit Exceeded Rejection',
          message: err.message,
        });
      }
      if (showToast) showToast(err.message, 'error');
    }
  };

  const handleConfirmRemove = async () => {
    if (!itemToRemove) return;
    const { section, product } = itemToRemove;
    setItemToRemove(null);

    try {
      await removeFromHomeShowcase(section, product.id);
      if (showToast) {
        showToast(`"${product.name}" removed from Home Screen showcase`, 'success');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B1B30] to-[#142B4A] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FF9F43]/20 px-3 py-1 text-xs font-bold text-[#FF9F43] border border-[#FF9F43]/30">
              <Sparkles size={14} />
              <span>Storefront Merchandising</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Home Screen Showcase Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Curate which certified agricultural products appear in high-visibility slots on the AgriMart home screen. Strict slot limits are enforced to protect optimal visual layout.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
            <div className="text-right">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Hero Deals Slot</span>
              <span className="text-sm font-black text-[#FF9F43]">
                {homeShowcase?.heroDeals?.length || 0} / {heroLimit} Slots
              </span>
            </div>
            <div className={`w-3 h-3 rounded-full ${homeShowcase?.heroDeals?.length >= heroLimit ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          </div>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveSection('heroDeals')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition ${
            activeSection === 'heroDeals'
              ? 'border-[#0B1B30] text-[#0B1B30]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles size={16} className={activeSection === 'heroDeals' ? 'text-[#FF9F43]' : ''} />
          <span>Hero Promotional Deals</span>
          <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
            (homeShowcase?.heroDeals?.length || 0) >= heroLimit
              ? 'bg-amber-100 text-amber-900'
              : 'bg-stone-100 text-stone-600'
          }`}>
            {homeShowcase?.heroDeals?.length || 0} / {heroLimit} max
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('flashDeals')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition ${
            activeSection === 'flashDeals'
              ? 'border-[#0B1B30] text-[#0B1B30]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <LayoutGrid size={16} className={activeSection === 'flashDeals' ? 'text-[#FF9F43]' : ''} />
          <span>Today's Sowing Flash Deals</span>
          <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
            (homeShowcase?.flashDeals?.length || 0) >= flashLimit
              ? 'bg-amber-100 text-amber-900'
              : 'bg-stone-100 text-stone-600'
          }`}>
            {homeShowcase?.flashDeals?.length || 0} / {flashLimit} max
          </span>
        </button>
      </div>

      {/* Capacity & Enforcement Alert */}
      <div className={`rounded-2xl p-4 border flex items-center justify-between gap-4 ${
        currentItems.length >= currentLimit
          ? 'bg-amber-50/90 border-amber-200 text-amber-950'
          : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            currentItems.length >= currentLimit ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {currentItems.length >= currentLimit ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold">
              {currentItems.length >= currentLimit
                ? `Capacity Limit Reached (${currentItems.length}/${currentLimit})`
                : `Slots Available (${currentItems.length}/${currentLimit} used)`}
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              {currentItems.length >= currentLimit
                ? `The ${activeSection === 'heroDeals' ? 'Hero' : 'Flash'} section is strictly limited to ${currentLimit} products. Attempting to add any more will be rejected by the system.`
                : `You can feature ${currentLimit - currentItems.length} more product(s) in this section on the home page.`}
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-white/80 border border-stone-200 shrink-0">
          Limit: {currentLimit} max
        </span>
      </div>

      {/* Main Grid: Currently Featured Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Currently Showing on Home Screen</span>
            <span className="text-xs font-normal text-stone-500">
              ({sectionProducts.length} product{sectionProducts.length !== 1 ? 's' : ''})
            </span>
          </h3>

          <span className="text-xs text-stone-500 italic">
            Clicking these cards on the storefront opens the product details modal
          </span>
        </div>

        {sectionProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500 bg-white">
            <p className="text-sm font-semibold">No products currently featured in this section.</p>
            <p className="text-xs text-stone-400 mt-1">Select products below to feature them on the home screen.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sectionProducts.map((prod, index) => {
              const displayImg =
                (prod.imageUrl && !prod.imageUrl.includes('lh3.googleusercontent.com') && prod.imageUrl) ||
                (Array.isArray(prod.imageDatas) && prod.imageDatas[0] && !prod.imageDatas[0].includes('lh3.googleusercontent.com') && prod.imageDatas[0]) ||
                '/images/products/hybrid-tomato-seeds.png';

              return (
                <div
                  key={prod.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      <img
                        src={displayImg}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/products/hybrid-tomato-seeds.png';
                        }}
                      />
                      <span className="absolute top-1 left-1 bg-[#0B1B30] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block truncate">
                        {prod.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight mt-0.5 line-clamp-2">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 truncate">
                        {prod.unit || '1 unit'} • ₹{prod.price}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Live on Home</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setItemToRemove({ section: activeSection, product: prod })}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                      title="Remove from home screen"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Products to Showcase Panel */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus size={18} className="text-[#FF9F43]" />
              <span>Add Product to {activeSection === 'heroDeals' ? 'Hero Deals' : 'Flash Deals'}</span>
            </h3>
            <p className="text-xs text-stone-500">
              Select any inventory item from the catalog. If the limit of {currentLimit} is reached, the system will reject additions.
            </p>
          </div>

          {/* Search filter for available products */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Filter catalog products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
            />
          </div>
        </div>

        {/* Quick Dropdown Add */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedProdToAdd}
            onChange={(e) => setSelectedProdToAdd(e.target.value)}
            disabled={currentItems.length >= currentLimit}
            className="flex-1 px-4 py-2.5 text-xs font-medium rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1B30] disabled:bg-stone-100 disabled:text-stone-400"
          >
            <option value="">
              {currentItems.length >= currentLimit
                ? `[LIMIT REACHED (${currentLimit}/${currentLimit})] Remove a product to add new one`
                : '-- Select product to feature on Home Screen --'}
            </option>
            {availableProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.category}) — ₹{p.price}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleAttemptAdd()}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs ${
              currentItems.length >= currentLimit
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#0B1B30] text-white hover:bg-slate-800'
            }`}
          >
            <Plus size={15} />
            <span>Feature on Home</span>
          </button>
        </div>

        {/* Available Products Mini Grid */}
        <div className="pt-2">
          <span className="text-xs font-bold text-stone-700 block mb-2">
            Available Inventory Candidates ({availableProducts.length})
          </span>
          <div className="max-h-64 overflow-y-auto no-scrollbar space-y-2 border border-stone-100 rounded-xl p-2 bg-stone-50/50">
            {availableProducts.slice(0, 15).map((p) => {
              const displayImg =
                (p.imageUrl && !p.imageUrl.includes('lh3.googleusercontent.com') && p.imageUrl) ||
                '/images/products/hybrid-tomato-seeds.png';

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60 hover:border-stone-300 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={displayImg}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/products/hybrid-tomato-seeds.png';
                      }}
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 truncate">{p.name}</h5>
                      <span className="text-[10px] text-stone-500">
                        {p.category} • ₹{p.price}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAttemptAdd(p.id)}
                    className="ml-2 px-3 py-1 rounded-lg text-[11px] font-bold bg-stone-100 hover:bg-[#0B1B30] hover:text-white text-stone-700 transition shrink-0"
                  >
                    + Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* REJECTION DESIGNER MODAL */}
      <AnimatePresence>
        {rejectionModal && (
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={() => setRejectionModal(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-xs border border-amber-200">
                <ShieldAlert size={28} />
              </div>

              <div className="mt-4 text-center">
                <h3 className="font-headline text-lg font-extrabold text-slate-950">
                  {rejectionModal.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-stone-600 bg-amber-50/70 p-3.5 rounded-xl border border-amber-100">
                  {rejectionModal.message}
                </p>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  whileTap={buttonTap}
                  onClick={() => setRejectionModal(null)}
                  className="w-full rounded-xl bg-[#0B1B30] px-5 py-3 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
                >
                  Understood (Keep Within Limit)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION REMOVAL DIALOG */}
      <ConfirmDialog
        isOpen={!!itemToRemove}
        title="Remove from Home Screen?"
        message={`Are you sure you want to remove "${itemToRemove?.product?.name}" from the Home Screen showcase? It will remain in the inventory catalog.`}
        confirmText="Remove from Showcase"
        cancelText="Keep on Home"
        isDangerous={false}
        onConfirm={handleConfirmRemove}
        onCancel={() => setItemToRemove(null)}
      />
    </div>
  );
}
