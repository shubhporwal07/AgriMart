import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';
import { useLocationContext } from '../contexts/LocationContext';

export default function ProductDetailsModal({ product, onClose, onSelectProduct }) {
  const { addToCart, updateCartQuantity, getItemQuantity, products } = useProducts();

  let locationCtx = null;
  try {
    locationCtx = useLocationContext();
  } catch {
    locationCtx = null;
  }
  const isServiceable = locationCtx ? locationCtx.isServiceable : true;
  const userLocation = locationCtx ? locationCtx.location : { name: 'Phagwara' };
  const setLocationModalOpen = locationCtx ? locationCtx.setLocationModalOpen : () => {};

  const [activeTab, setActiveTab] = useState('highlights');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
    setActiveTab('highlights');
  }, [product?.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!product) return null;

  const qty = getItemQuantity(product.id);
  const isSoldOut = product.inStock === false;

  const allImages =
    Array.isArray(product.imageDatas) && product.imageDatas.length > 0
      ? product.imageDatas
      : product.imageData
      ? [product.imageData]
      : [product.imageUrl || 'https://via.placeholder.com/500x500?text=Gupta+Mart'];

  const currentImage = allImages[currentImageIndex] || allImages[0];

  const discountVal =
    product.mrp && product.mrp > product.price ? product.mrp - product.price : 0;
  const discountPercent =
    product.discount ||
    (discountVal > 0 ? `${Math.round((discountVal / product.mrp) * 100)}% OFF` : '');

  // Related products from same category
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-100 my-auto"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F7F9FC]">
            <div className="flex items-center gap-2">
              <span className="bg-[#142B4A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {product.category}
              </span>
              <span className="text-xs text-[#5A6B82] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#FF9F43]">local_shipping</span>
                ⚡ Fast Farm Dispatch
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-sm"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(92vh-80px)]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Column: Images (5 Cols) */}
              <div className="md:col-span-5 flex flex-col gap-3">
                <div className="relative w-full aspect-square rounded-2xl bg-[#EDF2F7] overflow-hidden flex items-center justify-center border border-[#CBD5E1]/50">
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {discountPercent && (
                    <span className="absolute top-3 left-3 bg-[#FF9F43] text-[#142B4A] text-xs font-headline font-extrabold px-2.5 py-1 rounded-full shadow-md">
                      {discountPercent}
                    </span>
                  )}
                  {product.isOrganic && (
                    <span className="absolute bottom-3 left-3 bg-white/95 text-[#A74E00] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-orange-100">
                      <span className="material-symbols-outlined text-[15px]">eco</span>
                      Certified Organic
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                          currentImageIndex === idx
                            ? 'border-[#142B4A] shadow-md scale-105'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Blinkit Trust Badges */}
                <div className="mt-2 bg-[#F7F9FC] rounded-2xl p-4 border border-[#CBD5E1]/40 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs text-[#263449]">
                    <span className="material-symbols-outlined text-[#FF9F43] text-[20px]">
                      verified
                    </span>
                    <div>
                      <span className="font-bold block">100% Farm Fresh Guarantee</span>
                      <span className="text-[11px] text-[#5A6B82]">
                        Direct from verified local cultivators
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#263449]">
                    <span className="material-symbols-outlined text-[#FF9F43] text-[20px]">
                      currency_exchange
                    </span>
                    <div>
                      <span className="font-bold block">Instant No-Questions Refund</span>
                      <span className="text-[11px] text-[#5A6B82]">
                        Not fresh? Tap for instant UPI refund
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Details & Blinkit Tabs (7 Cols) */}
              <div className="md:col-span-7 flex flex-col">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#E27B12]">
                  {product.brand || 'Gupta Mart Select'}
                </span>
                <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#142B4A] mt-1 leading-snug">
                  {product.name}
                </h1>
                <p className="text-sm text-[#5A6B82] font-semibold mt-1">
                  Pack Size: <span className="text-[#263449] font-bold">{product.unit}</span>
                </p>

                {/* Rating & Review */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                    <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span>{product.rating || '4.9'}</span>
                  </div>
                  <span className="text-xs text-[#5A6B82]">
                    ({product.reviewCount || '890'} verified reviews)
                  </span>
                </div>

                {/* Price Block */}
                <div className="mt-4 p-4 rounded-2xl bg-[#EDF2F7] border border-[#CBD5E1]/60 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-price text-3xl font-extrabold text-[#142B4A]">
                        ₹{product.price}
                      </span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="text-sm text-[#74777E] line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                    </div>
                    {discountVal > 0 && (
                      <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                        You save ₹{discountVal} ({discountPercent})
                      </span>
                    )}
                    <span className="text-[10px] text-[#5A6B82]">Inclusive of all taxes</span>
                  </div>

                  {/* Add / Stepper */}
                  <div>
                    {isSoldOut ? (
                      <span className="bg-slate-200 text-slate-500 font-bold text-xs px-4 py-2.5 rounded-xl block">
                        Sold Out
                      </span>
                    ) : qty > 0 ? (
                      <div className="flex items-center bg-[#142B4A] text-white rounded-xl shadow-md overflow-hidden">
                        <button
                          onClick={() => updateCartQuantity(product.id, qty - 1)}
                          className="px-3.5 py-2.5 hover:bg-[#1B385D] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                        <span className="px-3.5 font-bold text-sm">{qty}</span>
                        <button
                          onClick={() => updateCartQuantity(product.id, qty + 1)}
                          className="px-3.5 py-2.5 hover:bg-[#1B385D] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      </div>
        ) : !isServiceable ? (
                      <button
                        onClick={() => setLocationModalOpen(true)}
                        className="bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 font-headline text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        title="Outside 10 km Phagwara hub. Tap to change location."
                      >
                        <span className="material-symbols-outlined text-[18px]">location_off</span>
                        <span>Unavailable in Area</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="bg-[#142B4A] hover:bg-[#1B385D] text-white font-headline text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          add_shopping_cart
                        </span>
                        <span>ADD TO CART</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Blinkit Unserviceable Warning Banner */}
                {!isServiceable && (
                  <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-rose-800">
                      <span className="material-symbols-outlined text-[20px] text-rose-600 shrink-0">
                        location_off
                      </span>
                      <div>
                        <span className="font-bold block">Delivery currently unavailable in {userLocation?.name || 'this area'}</span>
                        <span className="text-[11px] text-rose-600">AgriMart delivers within 10 km of our Central Kisan Dispatch Hub.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setLocationModalOpen(true)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shrink-0 shadow-sm transition-colors"
                    >
                      Change Area
                    </button>
                  </div>
                )}

                {/* Detailed Information Tabs */}
                <div className="mt-6">
                  {/* Tab Headers */}
                  <div className="flex border-b border-slate-200 gap-4 overflow-x-auto no-scrollbar">
                    {[
                      { key: 'highlights', label: 'Highlights' },
                      { key: 'nutrition', label: 'Agronomy & Nutrients' },
                      { key: 'storage', label: 'Sowing & Storage' },
                      { key: 'manufacturer', label: 'License & Standards' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-2.5 text-xs font-bold transition-all relative whitespace-nowrap ${
                          activeTab === tab.key
                            ? 'text-[#142B4A] border-b-2 border-[#142B4A]'
                            : 'text-[#5A6B82] hover:text-[#142B4A]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab 1: Highlights */}
                  {activeTab === 'highlights' && (
                    <div className="py-4 space-y-3">
                      <p className="text-xs text-[#263449] leading-relaxed">
                        {product.description}
                      </p>
                      {Array.isArray(product.highlights) && product.highlights.length > 0 && (
                        <ul className="space-y-1.5">
                          {product.highlights.map((h, i) => (
                            <li key={i} className="text-xs text-[#5A6B82] flex items-start gap-2">
                              <span className="material-symbols-outlined text-[#FF9F43] text-[16px] shrink-0 mt-0.5">
                                check_circle
                              </span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Agronomy & Nutrients */}
                  {activeTab === 'nutrition' && (
                    <div className="py-4">
                      <div className="bg-[#F7F9FC] rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-200/60 text-[#142B4A] font-bold">
                              <th className="p-2.5">Agri Parameter / Element</th>
                              <th className="p-2.5">Certified Standard</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {product.nutritionalFacts &&
                              Object.entries(product.nutritionalFacts).map(([key, val]) => (
                                <tr key={key} className="hover:bg-white transition-colors">
                                  <td className="p-2.5 font-medium text-[#263449]">{key}</td>
                                  <td className="p-2.5 text-[#5A6B82] font-semibold">{val}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-[#74777E] mt-2 italic">
                        *Guaranteed laboratory analysis verified under Seed Act 1966 & Fertilizer Control Order (FCO) 1985.
                      </p>
                    </div>
                  )}

                  {/* Tab 3: Storage & Sowing */}
                  {activeTab === 'storage' && (
                    <div className="py-4 space-y-3 text-xs">
                      <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl">
                        <span className="font-bold text-amber-900 block mb-1">
                          Shelf Life & Viability
                        </span>
                        <p className="text-[#5A6B82]">
                          {product.shelfLife || '18 months from packaging date.'}
                        </p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                        <span className="font-bold text-slate-900 block mb-1">
                          Farm Storage & Sowing Instructions
                        </span>
                        <p className="text-[#5A6B82]">
                          {product.storageInstructions ||
                            'Keep in cool, dry ventilated farm storehouse. Protect from moisture and direct sun.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Manufacturer / License */}
                  {activeTab === 'manufacturer' && (
                    <div className="py-4 space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-[#142B4A] block">Country of Origin</span>
                        <span className="text-[#5A6B82]">India</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#142B4A] block">Research Center / Origin Hub</span>
                        <span className="text-[#5A6B82]">{product.origin}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#142B4A] block">Seed Act / FCO License Number</span>
                        <span className="font-mono text-[#5A6B82]">{product.fssaiLicence}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#142B4A] block">Packer & Seed Producer</span>
                        <span className="text-[#5A6B82]">{product.manufacturerDetails}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">
                          <strong>Kisan Agronomist Advisory:</strong> AgriMart Support & Soil Doctor, Toll-Free Kisan Helpline 1800-AGRI-MART or email advisory@agrimart.farm.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related Products Section */}
            {related.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="font-headline font-extrabold text-base text-[#142B4A] mb-4">
                  Customers Also Bought from {product.category}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {related.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectProduct?.(item)}
                      className="group bg-[#F7F9FC] rounded-2xl p-3 border border-slate-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="w-full aspect-square rounded-xl bg-white overflow-hidden mb-2">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h4 className="text-xs font-bold text-[#142B4A] line-clamp-1 group-hover:text-[#E27B12]">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-[#5A6B82]">{item.unit}</span>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200">
                        <span className="font-price font-extrabold text-xs text-[#142B4A]">
                          ₹{item.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item, 1);
                          }}
                          className="text-[10px] bg-white border border-[#142B4A] text-[#142B4A] px-2 py-0.5 rounded font-bold hover:bg-[#142B4A] hover:text-white transition-colors"
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
