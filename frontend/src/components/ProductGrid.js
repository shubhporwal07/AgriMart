'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { SkeletonCardGrid } from './SkeletonLoader';
import { useProducts } from '../contexts/ProductContext';
import { DURATION, EASE, buttonTap, iconTap } from '../utils/motion';

export default function ProductGrid({ onViewDetails, onEdit, onDelete, isAdmin = false }) {
  const {
    paginatedProducts,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredProducts,
    itemsPerPage,
    loading,
    sortBy,
    setSortBy,
    filters,
    clearAllFilters,
  } = useProducts();

  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'compact'

  if (loading) {
    return (
      <motion.div
        key="grid-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="min-w-0 flex-1 py-2"
      >
        <div className="mb-6 h-12 bg-slate-200/60 rounded-xl animate-pulse" />
        <SkeletonCardGrid count={8} />
      </motion.div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <motion.div
        key="grid-empty"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.normal, ease: EASE.out }}
        className="flex flex-1 flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200"
      >
        <div className="w-16 h-16 rounded-full bg-[#FFE8D6] text-[#A74E00] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">search_off</span>
        </div>
        <h3 className="font-headline text-xl font-bold text-[#142B4A]">No certified farm inputs found</h3>
        <p className="mt-1 text-sm text-[#5A6B82] max-w-sm">
          We could not find any farm inputs matching your current filters or search terms.
        </p>
        <motion.button
          whileTap={buttonTap}
          onClick={clearAllFilters}
          className="mt-5 bg-[#142B4A] hover:bg-[#1B385D] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-150 shadow-sm"
        >
          Reset All Filters
        </motion.button>
      </motion.div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: EASE.out }}
      className="min-w-0 flex-1"
    >
      {/* Top Toolbar */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-[#CBD5E1]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-headline text-lg font-extrabold text-[#142B4A]">
              {filters.category?.length > 0 ? filters.category.join(', ') : 'All Farm Inputs'}
            </span>
            <span className="text-xs text-[#5A6B82] font-semibold">
              (Showing {startItem}–{endItem} of {filteredProducts.length})
            </span>
          </div>

          <AnimatePresence>
            {filters.searchQuery && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: EASE.out }}
                className="text-xs text-[#E27B12] font-bold mt-1"
              >
                Search results for "{filters.searchQuery}"
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Sort & Layout Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          <div className="flex items-center gap-2 bg-[#EDF2F7] px-3 py-1.5 rounded-xl border border-slate-200 transition-colors duration-150 focus-within:border-[#142B4A]/40 focus-within:bg-white">
            <label htmlFor="sortDropdown" className="text-xs text-[#5A6B82] font-semibold whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sortDropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[#142B4A] focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Biggest Discount</option>
              <option value="newest">Newly Harvested</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center bg-[#EDF2F7] p-1 rounded-xl relative">
            <motion.button
              type="button"
              whileTap={iconTap}
              onClick={() => setLayoutMode('grid')}
              className={`relative z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150 ${
                layoutMode === 'grid'
                  ? 'text-[#142B4A]'
                  : 'text-[#74777E] hover:text-[#142B4A]'
              }`}
              title="Grid View"
            >
              {layoutMode === 'grid' && (
                <motion.span
                  layoutId="gridLayoutPill"
                  transition={{ duration: 0.18, ease: EASE.out }}
                  className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                />
              )}
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </motion.button>
            <motion.button
              type="button"
              whileTap={iconTap}
              onClick={() => setLayoutMode('compact')}
              className={`relative z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150 ${
                layoutMode === 'compact'
                  ? 'text-[#142B4A]'
                  : 'text-[#74777E] hover:text-[#142B4A]'
              }`}
              title="Compact View"
            >
              {layoutMode === 'compact' && (
                <motion.span
                  layoutId="gridLayoutPill"
                  transition={{ duration: 0.18, ease: EASE.out }}
                  className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                />
              )}
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Product Cards Grid — smooth transitions across filter, sort & pagination */}
      <motion.div
        key={`page-${currentPage}-${layoutMode}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: EASE.out }}
        className={`grid gap-4 mb-8 ${
          layoutMode === 'compact'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
        }`}
      >
        {paginatedProducts.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            index={idx}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        ))}
      </motion.div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-6">
          <motion.button
            type="button"
            whileTap={currentPage > 1 ? buttonTap : undefined}
            onClick={() => {
              setCurrentPage(Math.max(1, currentPage - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all duration-150 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40"
          >
            Previous
          </motion.button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              type="button"
              whileTap={buttonTap}
              onClick={() => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`h-9 min-w-[2.25rem] rounded-xl text-xs font-bold transition-all duration-150 ${
                currentPage === page
                  ? 'bg-[#142B4A] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {page}
            </motion.button>
          ))}

          <motion.button
            type="button"
            whileTap={currentPage < totalPages ? buttonTap : undefined}
            onClick={() => {
              setCurrentPage(Math.min(totalPages, currentPage + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all duration-150 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40"
          >
            Next
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
