'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Percent,
  Plus,
  Trash2,
  Tag,
  Check,
  AlertCircle,
  X,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Layers,
  IndianRupee,
} from 'lucide-react';
import { useCoupons } from '../contexts/CouponContext';

export default function AdminCouponManager({ showToast }) {
  const { coupons, addCoupon, deleteCoupon, toggleCouponStatus, loading } = useCoupons();

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'
  const [deleteConfirm, setDeleteConfirm] = useState(null); // coupon object or null

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '15',
    minOrderValue: '1000',
    maxDiscountAmount: '',
    description: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Preset Handlers
  const handlePercentPreset = (percent) => {
    setFormData((prev) => ({
      ...prev,
      discountPercentage: String(percent),
    }));
  };

  const handlePriceBandPreset = (band) => {
    setFormData((prev) => ({
      ...prev,
      minOrderValue: String(band),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'code' ? value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') : value,
    }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (!formData.code.trim()) {
        throw new Error('Please enter a coupon code (e.g. KISAN20)');
      }
      const percent = Number(formData.discountPercentage);
      if (!percent || percent <= 0 || percent > 90) {
        throw new Error('Discount percentage must be between 1% and 90%');
      }
      const minOrder = Number(formData.minOrderValue);
      if (isNaN(minOrder) || minOrder < 0) {
        throw new Error('Please enter a valid price band (minimum order value in ₹)');
      }

      await addCoupon({
        code: formData.code.trim(),
        discountPercentage: percent,
        minOrderValue: minOrder,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        description: formData.description.trim() || `${percent}% subsidy discount on orders of ₹${minOrder.toLocaleString('en-IN')} and above`,
      });

      if (showToast) showToast(`Coupon "${formData.code.toUpperCase()}" created successfully!`, 'success');

      // Reset form and close
      setFormData({
        code: '',
        discountPercentage: '15',
        minOrderValue: '1000',
        maxDiscountAmount: '',
        description: '',
      });
      setShowModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    try {
      await deleteCoupon(id);
      if (showToast) showToast(`Coupon "${code}" deleted`, 'success');
      setDeleteConfirm(null);
    } catch (err) {
      if (showToast) showToast('Failed to delete coupon', 'error');
    }
  };

  const handleToggle = async (id, code, currentStatus) => {
    try {
      await toggleCouponStatus(id);
      if (showToast) {
        showToast(
          `Coupon "${code}" ${currentStatus ? 'deactivated' : 'activated'}`,
          'success'
        );
      }
    } catch (err) {
      if (showToast) showToast('Failed to update status', 'error');
    }
  };

  // Filtered Coupons
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
        ? c.isActive !== false
        : c.isActive === false;
    return matchesSearch && matchesFilter;
  });

  const activeCount = coupons.filter((c) => c.isActive !== false).length;
  const maxDiscount = coupons.length > 0 ? Math.max(...coupons.map((c) => c.discountPercentage || 0)) : 0;
  const avgMinOrder =
    coupons.length > 0
      ? Math.round(coupons.reduce((acc, c) => acc + (c.minOrderValue || 0), 0) / coupons.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#142B4A]">
              <Tag size={20} className="text-[#FF9F43]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Coupons</p>
              <p className="text-2xl font-black text-slate-900">{coupons.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active &amp; Redeemable</p>
              <p className="text-2xl font-black text-emerald-700">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Percent size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Highest Discount</p>
              <p className="text-2xl font-black text-amber-700">{maxDiscount}% OFF</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <IndianRupee size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Price Band</p>
              <p className="text-2xl font-black text-purple-700">₹{avgMinOrder.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar: Search, Filter, Create */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (e.g. KISAN200)..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
            />
          </div>

          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition ${
                  filterStatus === status
                    ? 'bg-white text-[#142B4A] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#142B4A] hover:bg-[#1D3E6B] text-white rounded-xl font-bold text-xs shadow-sm transition whitespace-nowrap"
        >
          <Plus size={16} className="text-[#FF9F43]" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Table / Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount %</th>
                <th className="py-3.5 px-4">Price Band (Min Order)</th>
                <th className="py-3.5 px-4">Max Cap</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No coupons found</p>
                    <p className="text-[11px] mt-0.5">Click &ldquo;Create New Coupon&rdquo; to add a promo discount with a price band.</p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isActive = coupon.isActive !== false;
                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[#142B4A] font-extrabold text-xs">
                          <Tag className="w-3.5 h-3.5 text-[#FF9F43]" />
                          {coupon.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-xs">
                          {coupon.discountPercentage}% OFF
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                          <span>Order &ge; ₹{(coupon.minOrderValue || 0).toLocaleString('en-IN')}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {coupon.maxDiscountAmount ? (
                          <span className="font-semibold text-slate-700">
                            Up to ₹{coupon.maxDiscountAmount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No limit</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-500" title={coupon.description}>
                        {coupon.description || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(coupon.id, coupon.code, isActive)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(coupon)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE COUPON MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="bg-[#142B4A] text-white p-5 flex items-start justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-44 h-44 bg-[#FF9F43]/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0C2340] to-[#1E3A8A] border border-blue-400/30 flex items-center justify-center text-[#FF9F43] shadow-md">
                    <Percent size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">Create Discount Coupon</h3>
                    <p className="text-xs text-blue-200/80">Configure percentage and minimum price band</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Coupon Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coupon Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="e.g. KISAN25, FERTILIZER10"
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-mono font-bold uppercase border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Customers can type this exact code during checkout.
                  </p>
                </div>

                {/* Discount Percentage */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Discount Percentage (%) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {formData.discountPercentage || 0}% OFF
                    </span>
                  </div>

                  <input
                    type="number"
                    name="discountPercentage"
                    min="1"
                    max="90"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                    required
                  />

                  {/* Preset Percent Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
                    {[10, 15, 20, 25, 30, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handlePercentPreset(pct)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                          formData.discountPercentage === String(pct)
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Band / Minimum Order Value */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Price Band (Minimum Order Value in ₹) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      Min: ₹{Number(formData.minOrderValue || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="font-extrabold text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="minOrderValue"
                      min="0"
                      step="50"
                      value={formData.minOrderValue}
                      onChange={handleInputChange}
                      placeholder="1000"
                      className="w-full pl-8 pr-4 py-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    The customer&rsquo;s order subtotal must be greater than or equal to this amount for the coupon to apply.
                  </p>

                  {/* Preset Price Band Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Bands:</span>
                    {[0, 499, 999, 1000, 1500, 2000, 2500].map((band) => (
                      <button
                        key={band}
                        type="button"
                        onClick={() => handlePriceBandPreset(band)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                          formData.minOrderValue === String(band)
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {band === 0 ? 'No Min' : `₹${band.toLocaleString('en-IN')}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Maximum Discount Cap (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum Discount Cap (₹) <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="font-extrabold text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      min="1"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      placeholder="e.g. 200, 500 (Leave empty for no upper limit)"
                      className="w-full pl-8 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Terms &amp; Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={`e.g. Get ${formData.discountPercentage || 15}% off on orders above ₹${formData.minOrderValue || 1000}`}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                  />
                </div>

                {/* Live Customer Preview Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Customer Cart Preview
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#FFE8D6] text-[#A74E00] font-black text-xs font-mono">
                        {formData.code.trim() || 'COUPON_CODE'}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700">
                        {formData.discountPercentage || 0}% OFF
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Order &ge; ₹{Number(formData.minOrderValue || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#FF9F43] hover:bg-[#E27B12] text-slate-950 font-black text-xs rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating Coupon...' : 'Save & Publish Coupon'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Delete Coupon?</h4>
                  <p className="text-xs text-slate-500">
                    Are you sure you want to delete coupon <strong>{deleteConfirm.code}</strong>? Customers will no longer be able to redeem it.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.code)}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                >
                  Delete Coupon
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
