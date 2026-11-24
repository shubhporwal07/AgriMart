'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import { accordionVariants, buttonTap, EASE } from '../utils/motion';

export default function SidebarFilters({ className = '' }) {
  const { filters, updateFilter, clearAllFilters, products, categories: contextCategories } = useProducts();
  const { t, translateCategory, isHindi } = useLanguage();

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    dietary: true,
    rating: true,
  });

  const toggleSection = (sec) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const defaultCategoryList = [
    'Vegetable Seeds',
    'Grain & Crop Seeds',
    'Organic Manure & Compost',
    'NPK & Water Soluble',
    'Micronutrients & Growth',
    'Bio-Pesticides & Fungicides',
    'Farm Tools & Sprayers',
    'Soil Health Kits',
  ];

  const activeCategoryNames = useMemo(() => {
    const base = Array.isArray(contextCategories) && contextCategories.length > 0 ? contextCategories : defaultCategoryList;
    const set = new Set(base);
    (products || []).forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [contextCategories, products]);

  const categories = useMemo(() => {
    return activeCategoryNames.map((catName) => {
      const count = (products || []).filter((p) => {
        if (!p.category) return false;
        if (p.category === catName) return true;
        return (
          p.category.toLowerCase().includes(catName.toLowerCase()) ||
          catName.toLowerCase().includes(p.category.toLowerCase())
        );
      }).length;
      return {
        name: catName,
        count: count,
      };
    });
  }, [activeCategoryNames, products]);

  const pricePresets = [
    { id: 'under-200', label: isHindi ? '₹200 से कम' : 'Under ₹200' },
    { id: '200-500', label: isHindi ? '₹200–₹500' : '₹200–₹500' },
    { id: '500-1000', label: isHindi ? '₹500–₹1,000' : '₹500–₹1,000' },
    { id: 'above-1000', label: isHindi ? '₹1,000+' : '₹1,000+' },
  ];

  const dietaryTags = [
    { id: 'icar', label: isHindi ? 'आईसीएआर एवं एनएससी प्रमाणित' : 'ICAR & NSC Certified', icon: 'verified' },
    { id: 'npop', label: isHindi ? 'एनपीओपी 100% जैविक' : 'NPOP 100% Organic', icon: 'eco' },
    { id: 'water-soluble', label: isHindi ? '100% जल में घुलनशील (ड्रिप)' : '100% Water Soluble (Drip)', icon: 'water_drop' },
    { id: 'bio-certified', label: isHindi ? 'एफसीओ 1985 अनुपालन' : 'FCO 1985 Compliant', icon: 'shield' },
  ];

  const selectedCategories = Array.isArray(filters.category) ? filters.category : [];
  const selectedPriceRanges = Array.isArray(filters.priceRange) ? filters.priceRange : [];
  const selectedDietary = Array.isArray(filters.dietary) ? filters.dietary : [];

  const activeCount =
    selectedCategories.length +
    selectedPriceRanges.length +
    selectedDietary.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.minRating ? 1 : 0);

  return (
    <aside
      className={`w-full lg:w-72 shrink-0 bg-white rounded-2xl p-5 shadow-sm border border-[#CBD5E1]/40 ${className}`}
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#142B4A] text-[20px]">tune</span>
          <h2 className="font-headline text-base text-[#142B4A] font-extrabold">{t('filters.title', 'Filters')}</h2>
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.span
                key="active-badge"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15, ease: EASE.out }}
                className="bg-[#FFE8D6] text-[#A74E00] text-[11px] font-bold px-2 py-0.5 rounded-full"
              >
                {activeCount} {isHindi ? 'सक्रिय' : 'Active'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={buttonTap}
              transition={{ duration: 0.15 }}
              onClick={clearAllFilters}
              className="text-xs text-[#E27B12] hover:text-[#A74E00] font-bold tracking-wide transition-colors duration-150"
            >
              {t('filters.clearAll', 'Clear All')}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* In Stock Only Switch */}
      <div className="my-4 p-3 bg-[#F7F9FC] rounded-xl flex items-center justify-between border border-[#CBD5E1]/40 transition-colors duration-150 hover:border-[#CBD5E1]">
        <div className="flex flex-col">
          <span className="text-xs text-[#142B4A] font-bold">{t('filters.inStockOnly', 'In Stock Only')}</span>
          <span className="text-[11px] text-[#5A6B82]">{isHindi ? 'स्टॉक से बाहर उत्पाद छुपाएं' : 'Hide sold-out essentials'}</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.inStockOnly}
            onChange={(e) => updateFilter('inStockOnly', null, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-200 transition-colors duration-200 peer-checked:bg-[#142B4A]"></div>
        </label>
      </div>

      <div className="space-y-5">
        {/* Categories Section */}
        <div className="border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between cursor-pointer mb-2.5 text-left group"
            aria-expanded={expandedSections.categories}
          >
            <h3 className="font-headline text-xs font-bold text-[#142B4A] uppercase tracking-wider group-hover:text-[#E27B12] transition-colors duration-150">
              Agri Categories & Inputs
            </h3>
            <motion.span
              animate={{ rotate: expandedSections.categories ? 180 : 0 }}
              transition={{ duration: 0.2, ease: EASE.inOut }}
              className="material-symbols-outlined text-[#74777E] text-[18px] inline-block"
            >
              expand_more
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {expandedSections.categories && (
              <motion.div
                variants={accordionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1 pt-0.5">
                  {categories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.name);
                    return (
                      <label
                        key={cat.name}
                        className="flex items-center justify-between text-xs text-[#263449] group cursor-pointer hover:text-[#142B4A] transition-colors duration-150 py-0.5"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => updateFilter('category', cat.name, e.target.checked)}
                            className="w-4 h-4 rounded text-[#142B4A] focus:ring-[#142B4A] border-slate-300 transition-colors duration-150 cursor-pointer"
                          />
                          <span className={`transition-colors duration-150 ${isChecked ? 'font-bold text-[#142B4A]' : ''}`}>
                            {translateCategory(cat.name)}
                          </span>
                        </span>
                        <span className="text-[10px] text-[#5A6B82] bg-slate-100 px-1.5 py-0.2 rounded-full">
                          {cat.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Range Section */}
        <div className="border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between cursor-pointer mb-2.5 text-left group"
            aria-expanded={expandedSections.price}
          >
            <h3 className="font-headline text-xs font-bold text-[#142B4A] uppercase tracking-wider group-hover:text-[#E27B12] transition-colors duration-150">
              {t('filters.priceTitle', 'Price Range')}
            </h3>
            <motion.span
              animate={{ rotate: expandedSections.price ? 180 : 0 }}
              transition={{ duration: 0.2, ease: EASE.inOut }}
              className="material-symbols-outlined text-[#74777E] text-[18px] inline-block"
            >
              expand_more
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {expandedSections.price && (
              <motion.div
                variants={accordionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pricePresets.map((preset) => {
                    const isSelected = selectedPriceRanges.includes(preset.id);
                    return (
                      <motion.button
                        key={preset.id}
                        type="button"
                        whileTap={buttonTap}
                        onClick={() => updateFilter('priceRange', preset.id, !isSelected)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all duration-150 ${
                          isSelected
                            ? 'bg-[#142B4A] text-white shadow-sm'
                            : 'bg-[#EDF2F7] text-[#5A6B82] hover:bg-slate-200 hover:text-[#142B4A]'
                        }`}
                      >
                        {preset.label}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dietary & Certifications */}
        <div className="border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('dietary')}
            className="w-full flex items-center justify-between cursor-pointer mb-2.5 text-left group"
            aria-expanded={expandedSections.dietary}
          >
            <h3 className="font-headline text-xs font-bold text-[#142B4A] uppercase tracking-wider group-hover:text-[#E27B12] transition-colors duration-150">
              Certifications & Standards
            </h3>
            <motion.span
              animate={{ rotate: expandedSections.dietary ? 180 : 0 }}
              transition={{ duration: 0.2, ease: EASE.inOut }}
              className="material-symbols-outlined text-[#74777E] text-[18px] inline-block"
            >
              expand_more
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {expandedSections.dietary && (
              <motion.div
                variants={accordionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="space-y-2 pt-0.5">
                  {dietaryTags.map((tag) => {
                    const isChecked = selectedDietary.includes(tag.id);
                    return (
                      <label
                        key={tag.id}
                        className="flex items-center justify-between text-xs text-[#263449] cursor-pointer hover:text-[#142B4A] transition-colors duration-150 py-0.5"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => updateFilter('dietary', tag.id, e.target.checked)}
                            className="w-4 h-4 rounded text-[#142B4A] focus:ring-[#142B4A] border-slate-300 cursor-pointer"
                          />
                          <span className="flex items-center gap-1 font-semibold">
                            <span className="material-symbols-outlined text-[#E27B12] text-[16px]">
                              {tag.icon}
                            </span>
                            {tag.label}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ratings Filter */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('rating')}
            className="w-full flex items-center justify-between cursor-pointer mb-2.5 text-left group"
            aria-expanded={expandedSections.rating}
          >
            <h3 className="font-headline text-xs font-bold text-[#142B4A] uppercase tracking-wider group-hover:text-[#E27B12] transition-colors duration-150">
              Customer Ratings
            </h3>
            <motion.span
              animate={{ rotate: expandedSections.rating ? 180 : 0 }}
              transition={{ duration: 0.2, ease: EASE.inOut }}
              className="material-symbols-outlined text-[#74777E] text-[18px] inline-block"
            >
              expand_more
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {expandedSections.rating && (
              <motion.div
                variants={accordionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="space-y-2 text-xs pt-0.5">
                  {[4.0, 3.0].map((r) => {
                    const isSelected = Number(filters.minRating) === r;
                    return (
                      <label
                        key={r}
                        className="flex items-center justify-between cursor-pointer hover:text-[#142B4A] transition-colors duration-150 py-0.5"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ratingFilter"
                            checked={isSelected}
                            onChange={() => {}}
                            onClick={() => updateFilter('minRating', r, !isSelected)}
                            className="w-4 h-4 text-[#142B4A] focus:ring-[#142B4A] cursor-pointer"
                          />
                          <span className="flex items-center gap-1">
                            <span
                              className="material-symbols-outlined text-[#FF9F43] text-[16px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                            <span className={`font-bold ${isSelected ? 'text-[#142B4A]' : 'text-[#263449]'}`}>
                              {r.toFixed(1)} {isHindi ? 'एवं अधिक' : '& above'}
                            </span>
                          </span>
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-[#E27B12] font-bold">On</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AgriMart Germination Shield Banner */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#142B4A] to-[#1B385D] text-white">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="material-symbols-outlined text-[#FF9F43] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified_user
          </span>
          <span className="font-headline text-xs font-bold text-white">AgriMart Germination Shield</span>
        </div>
        <p className="text-[11px] text-slate-200 leading-relaxed">
          Minimum 85%-95% guaranteed germination on all seed batches with lab test certificates. 100% FCO & Seed Act compliant.
        </p>
      </div>
    </aside>
  );
}
