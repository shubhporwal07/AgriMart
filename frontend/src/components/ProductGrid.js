'use client';
import { useState } from 'react';
import ProductCard from './ProductCard';
import { SkeletonCardGrid } from './SkeletonLoader';
import { useProducts } from '../contexts/ProductContext';

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
      <div className="min-w-0 flex-1 py-2">
        <div className="mb-6 h-12 bg-slate-200/60 rounded-xl animate-pulse" />
        <SkeletonCardGrid count={8} />
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200">
        <div className="w-16 h-16 rounded-full bg-[#FFE8D6] text-[#A74E00] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">search_off</span>
        </div>
        <h3 className="font-headline text-xl font-bold text-[#142B4A]">No groceries found</h3>
        <p className="mt-1 text-sm text-[#5A6B82] max-w-sm">
          We could not find any produce matching your current filters or search terms.
        </p>
        <button
          onClick={clearAllFilters}
          className="mt-5 bg-[#142B4A] hover:bg-[#1B385D] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  return (
    <div className="min-w-0 flex-1">
      {/* Top Toolbar */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-[#CBD5E1]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-headline text-lg font-extrabold text-[#142B4A]">
              {filters.category?.length > 0 ? filters.category.join(', ') : 'All Grocery Items'}
            </span>
            <span className="text-xs text-[#5A6B82] font-semibold">
              (Showing {startItem}–{endItem} of {filteredProducts.length})
            </span>
          </div>

          {filters.searchQuery && (
            <p className="text-xs text-[#E27B12] font-bold mt-1">
              Search results for "{filters.searchQuery}"
            </p>
          )}
        </div>

        {/* Sort & Layout Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          <div className="flex items-center gap-2 bg-[#EDF2F7] px-3 py-1.5 rounded-xl border border-slate-200">
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

          <div className="hidden sm:flex items-center bg-[#EDF2F7] p-1 rounded-xl">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                layoutMode === 'grid'
                  ? 'bg-white text-[#142B4A] shadow-sm'
                  : 'text-[#74777E] hover:text-[#142B4A]'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              onClick={() => setLayoutMode('compact')}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                layoutMode === 'compact'
                  ? 'bg-white text-[#142B4A] shadow-sm'
                  : 'text-[#74777E] hover:text-[#142B4A]'
              }`}
              title="Compact View"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div
        className={`grid gap-4 mb-8 ${
          layoutMode === 'compact'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
        }`}
      >
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-6">
          <button
            type="button"
            onClick={() => {
              setCurrentPage(Math.max(1, currentPage - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`h-9 min-w-[2.25rem] rounded-xl text-xs font-bold transition ${
                currentPage === page
                  ? 'bg-[#142B4A] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setCurrentPage(Math.min(totalPages, currentPage + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
