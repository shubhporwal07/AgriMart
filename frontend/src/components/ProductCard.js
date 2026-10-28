import { motion } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';
import { useLocationContext } from '../contexts/LocationContext';

export default function ProductCard({
  product,
  onViewDetails,
  onEdit,
  onDelete,
  isAdmin = false,
}) {
  const { addToCart, updateCartQuantity, getItemQuantity } = useProducts();

  let locationCtx = null;
  try {
    locationCtx = useLocationContext();
  } catch {
    locationCtx = null;
  }
  const isServiceable = locationCtx ? locationCtx.isServiceable : true;
  const setLocationModalOpen = locationCtx ? locationCtx.setLocationModalOpen : () => {};

  const qty = getItemQuantity(product.id);
  const isSoldOut = product.inStock === false;

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isSoldOut) return;
    if (!isServiceable) {
      setLocationModalOpen(true);
      return;
    }
    addToCart(product, 1);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateCartQuantity(product.id, qty + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateCartQuantity(product.id, qty - 1);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      await onDelete(product.id);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(product);
  };

  const discountPercent =
    typeof product.discount === 'string'
      ? product.discount
      : typeof product.discount === 'number' && product.discount > 0
      ? `${product.discount}% OFF`
      : (product.mrp && product.mrp > product.price
        ? `${Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF`
        : '');

  const displayImage =
    (Array.isArray(product.imageDatas) && product.imageDatas[0]) ||
    product.imageData ||
    product.imageUrl ||
    '/images/products/hybrid-tomato-seeds.png';

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl p-3.5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative border border-[#CBD5E1]/50 cursor-pointer ${
        isSoldOut ? 'opacity-65' : ''
      }`}
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-1 mb-2">
        {discountPercent ? (
          <span className="bg-[#FFE8D6] text-[#A74E00] font-headline text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider shadow-sm">
            {discountPercent}
          </span>
        ) : (
          <span className="bg-[#EDF2F7] text-[#142B4A] text-[10px] px-2 py-0.5 rounded-full font-bold">
            Fresh
          </span>
        )}

        {isAdmin ? (
          <div className="flex items-center gap-1 z-10" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleEditClick}
              className="bg-[#142B4A] text-white text-[10px] px-2 py-0.5 rounded hover:bg-[#1B385D]"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded hover:bg-rose-700"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              alert(`Added ${product.name} to wishlist!`);
            }}
            className="text-slate-400 hover:text-[#E27B12] transition-colors p-1 rounded-full hover:bg-slate-50"
            title="Save to Wishlist"
          >
            <span className="material-symbols-outlined text-[18px]">favorite</span>
          </button>
        )}
      </div>

      {/* Product Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#EDF2F7] mb-3 flex items-center justify-center">
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Farm+Fresh';
          }}
        />

        {/* Delivery Serviceability Badge */}
        {isServiceable ? (
          <span className="absolute bottom-2 left-2 bg-white/95 text-[#142B4A] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-[13px] text-[#FF9F43]">local_shipping</span>
            <span>{product.deliveryTime || '⚡ Fast Dispatch'}</span>
          </span>
        ) : (
          <span className="absolute bottom-2 left-2 bg-rose-600/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[11px]">location_off</span>
            <span>Unavailable in Area</span>
          </span>
        )}

        {isSoldOut && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white text-rose-600 font-extrabold text-xs px-3 py-1 rounded-md uppercase tracking-wider shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Meta: Rating and Unit */}
      <div className="flex items-center justify-between text-xs mb-1">
        <div className="flex items-center gap-1 text-[#FF9F43]">
          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="font-bold text-[#263449]">{product.rating || '4.8'}</span>
          <span className="text-[#74777E] text-[11px]">({product.reviewCount || '120'})</span>
        </div>
        <span className="text-[11px] font-medium text-[#5A6B82] bg-slate-100 px-1.5 py-0.2 rounded truncate max-w-[120px]">
          {product.packSize || product.unit || product.weight || '1 unit'}
        </span>
      </div>

      {/* Product Title */}
      <h3 className="font-headline text-[14px] font-bold text-[#142B4A] group-hover:text-[#E27B12] transition-colors line-clamp-2 min-h-[38px] leading-snug">
        {product.name}
      </h3>

      {/* Sourcing / Brand micro-label */}
      <p className="text-[11px] text-[#5A6B82] mt-0.5 truncate">
        {product.brand || 'AgriMart Select'} • {product.origin?.split(',')[0] || 'Certified Lot'}
      </p>

      {/* Bottom Pricing & Add / Stepper CTA */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="font-price text-base font-extrabold text-[#142B4A] leading-tight">
            ₹{product.price}
          </span>
          {product.mrp && product.mrp > product.price ? (
            <span className="text-[11px] text-[#74777E] line-through leading-tight">
              ₹{product.mrp}
            </span>
          ) : (
            <span className="text-[10px] text-[#5A6B82] uppercase leading-tight font-semibold">
              Standard MRP
            </span>
          )}
        </div>

        {/* Stepper Button */}
        {isSoldOut ? (
          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg cursor-not-allowed">
            OUT OF STOCK
          </span>
        ) : qty > 0 ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center bg-[#142B4A] text-white rounded-lg shadow-sm overflow-hidden"
          >
            <button
              onClick={handleDecrement}
              className="px-2 py-1.5 hover:bg-[#1B385D] transition-colors flex items-center justify-center"
              aria-label="Decrease quantity"
            >
              <span className="material-symbols-outlined text-[14px]">remove</span>
            </button>
            <span className="px-2 font-bold text-xs">{qty}</span>
            <button
              onClick={handleIncrement}
              className="px-2 py-1.5 hover:bg-[#1B385D] transition-colors flex items-center justify-center"
              aria-label="Increase quantity"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
            </button>
          </div>
        ) : !isServiceable ? (
          <button
            onClick={handleAdd}
            aria-label="Not deliverable to selected area"
            className="bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 font-headline text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm flex items-center gap-1"
            title="Outside 10 km hub. Tap to change location."
          >
            <span>Unavailable</span>
            <span className="material-symbols-outlined text-[13px]">pin_drop</span>
          </button>
        ) : (
          <button
            onClick={handleAdd}
            aria-label="Add to Cart"
            className="bg-white border-2 border-[#142B4A] text-[#142B4A] hover:bg-[#142B4A] hover:text-white font-headline text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-sm"
          >
            ADD
          </button>
        )}
      </div>
    </motion.article>
  );
}
