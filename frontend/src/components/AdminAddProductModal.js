'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';

export default function AdminAddProductModal({
  isOpen,
  onClose,
  editProduct = null,
  onSaved = null,
}) {
  const [loading, setLoading] = useState(false);
  const { addProduct, editProduct: updateProduct } = useProducts();

  const agriCategories = [
    'Vegetable Seeds',
    'Grain & Field Crop Seeds',
    'Organic Manure & Compost',
    'NPK & Water Soluble Fertilizers',
    'Micronutrients & Plant Growth',
    'Bio-Pesticides & Fungicides',
    'Farm Sprayers & Agri Tools',
    'Soil Health & Testing Kits',
  ];

  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetable Seeds',
    brand: 'AgriMart Certified',
    unit: '10g Pouch (~3,000 seeds)',
    price: '',
    mrp: '',
    discount: '',
    deliveryTime: '⚡ Fast Dispatch',
    inStock: true,
    stockCount: 50,
    isOrganic: true,
    dietaryTag: 'ICAR & NSC Certified',
    origin: 'ICAR Recognized Seeds Research Farm, Phagwara Hub',
    shelfLife: '18 months from packaging date. Viability tested.',
    storageInstructions: 'Store in dry seed warehouse at <18°C. Protect from moisture & insects.',
    fssaiLicence: 'Seed Lic: DL-AGRI-10020043 / FCO: FCO-PB-4401',
    manufacturerDetails: 'Certified & Packed by Gupta AgriMart Logistics, Central Kisan Hub #01, Phagwara, Kapurthala - 144401.',
    description: '',
    highlights: '',
    germination: '85% Min.',
    purity: '98% Min.',
    geneticPurity: '99% Min.',
    season: 'Kharif & Rabi',
    activeNutrient: '100% Water Soluble / Active',
    imageUrl: '',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name || '',
        category: editProduct.category || 'Vegetable Seeds',
        brand: editProduct.brand || 'AgriMart Certified',
        unit: editProduct.unit || editProduct.packSize || '10g Pouch (~3,000 seeds)',
        price: editProduct.price || '',
        mrp: editProduct.mrp || editProduct.price || '',
        discount: editProduct.discount || '',
        deliveryTime: editProduct.deliveryTime || editProduct.deliverySlot || '⚡ Fast Dispatch',
        inStock: editProduct.inStock !== undefined ? editProduct.inStock : true,
        stockCount: editProduct.stockCount || 50,
        isOrganic: !!editProduct.isOrganic,
        dietaryTag: Array.isArray(editProduct.dietaryTags) ? editProduct.dietaryTags[0] : (editProduct.dietaryTag || 'ICAR & NSC Certified'),
        origin: editProduct.origin || 'ICAR Recognized Seeds Research Farm',
        shelfLife: editProduct.shelfLife || '18 months from packaging date.',
        storageInstructions: editProduct.storageInstructions || 'Store in dry seed warehouse at <18°C.',
        fssaiLicence: editProduct.fssaiLicence || 'Seed Lic: DL-AGRI-10020043',
        manufacturerDetails: editProduct.manufacturerDetails || 'Gupta AgriMart Kisan Hub #01, Phagwara.',
        description: editProduct.description || '',
        highlights: Array.isArray(editProduct.highlights) ? editProduct.highlights.join('\n') : (editProduct.highlights || ''),
        germination: editProduct.nutritionalFacts?.['Germination Rate'] || editProduct.nutritionalFacts?.Energy || '85% Min.',
        purity: editProduct.nutritionalFacts?.['Physical Purity'] || editProduct.nutritionalFacts?.Protein || '98% Min.',
        geneticPurity: editProduct.nutritionalFacts?.['Genetic Purity'] || editProduct.nutritionalFacts?.Carbohydrates || '99% Min.',
        season: editProduct.nutritionalFacts?.['Crop Season'] || editProduct.nutritionalFacts?.Fat || 'Kharif & Rabi',
        activeNutrient: editProduct.nutritionalFacts?.['Active Nutrient / Solubility'] || editProduct.nutritionalFacts?.['Dietary Fiber'] || '100% Active',
        imageUrl: editProduct.imageUrl || '',
      });
      const existingImages = editProduct.imageDatas || (editProduct.imageData ? [editProduct.imageData] : []);
      setImagePreviews(existingImages);
    } else {
      setFormData({
        name: '',
        category: 'Vegetable Seeds',
        brand: 'AgriMart Certified',
        unit: '10g Pouch (~3,000 seeds)',
        price: '',
        mrp: '',
        discount: '',
        deliveryTime: '⚡ Fast Dispatch',
        inStock: true,
        stockCount: 50,
        isOrganic: true,
        dietaryTag: 'ICAR & NSC Certified',
        origin: 'ICAR Recognized Seeds Research Farm, Phagwara Hub',
        shelfLife: '18 months from packaging date. Viability tested.',
        storageInstructions: 'Store in dry seed warehouse at <18°C. Protect from moisture & insects.',
        fssaiLicence: 'Seed Lic: DL-AGRI-10020043 / FCO: FCO-PB-4401',
        manufacturerDetails: 'Certified & Packed by Gupta AgriMart Logistics, Central Kisan Hub #01, Phagwara, Kapurthala - 144401.',
        description: '',
        highlights: 'High germination rate (>85% lab tested)\nSeed Act 1966 & FCO 1985 certified\nFast farm gate direct dispatch',
        germination: '85% Min.',
        purity: '98% Min.',
        geneticPurity: '99% Min.',
        season: 'Kharif & Rabi',
        activeNutrient: '100% Water Soluble / Active',
        imageUrl: '',
      });
      setImagePreviews([]);
    }
    setImageFiles([]);
    setError('');
    setSuccess('');
  }, [editProduct, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setImagePreviews((prev) => [...prev, ev.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Product title is required.');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Please provide a valid price.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const priceNum = parseFloat(formData.price);
      const mrpNum = formData.mrp ? parseFloat(formData.mrp) : priceNum;
      const discountStr =
        formData.discount || (mrpNum > priceNum ? `${Math.round(((mrpNum - priceNum) / mrpNum) * 100)}% OFF` : '');

      const highlightsList = formData.highlights
        ? formData.highlights.split('\n').map((s) => s.trim()).filter(Boolean)
        : ['High germination rate (>85% lab tested)', 'Seed Act 1966 & FCO 1985 certified', 'Direct-to-farm dispatch'];

      const payload = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        unit: formData.unit,
        price: priceNum,
        mrp: mrpNum,
        discount: discountStr,
        deliveryTime: formData.deliveryTime,
        inStock: formData.inStock,
        stockCount: parseInt(formData.stockCount, 10) || 50,
        isOrganic: formData.isOrganic,
        dietaryTags: [formData.dietaryTag].filter(Boolean),
        origin: formData.origin,
        shelfLife: formData.shelfLife,
        storageInstructions: formData.storageInstructions,
        fssaiLicence: formData.fssaiLicence,
        manufacturerDetails: formData.manufacturerDetails,
        description: formData.description || `${formData.name} certified high-yield seed/fertilizer standard.`,
        highlights: highlightsList,
        nutritionalFacts: {
          'Germination Rate': formData.germination,
          'Physical Purity': formData.purity,
          'Genetic Purity': formData.geneticPurity,
          'Crop Season': formData.season,
          'Active Nutrient / Solubility': formData.activeNutrient,
        },
        imageUrl: formData.imageUrl || (imagePreviews[0] || ''),
        imageData: imagePreviews[0] || '',
        imageDatas: imagePreviews,
      };

      if (editProduct) {
        await updateProduct(editProduct.id, payload, imageFiles);
        setSuccess('Product updated successfully!');
      } else {
        await addProduct(payload, imageFiles);
        setSuccess('Farm product published to AgriMart successfully!');
      }

      setTimeout(() => {
        onSaved?.();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

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
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-100 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F7F9FC]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#142B4A] text-[#FF9F43] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">
                  {editProduct ? 'edit' : 'agriculture'}
                </span>
              </div>
              <h2 className="font-headline font-extrabold text-lg text-[#142B4A]">
                {editProduct ? 'Edit Agricultural Product' : 'Add New Seed or Fertilizer'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(92vh-80px)] space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{success}</span>
              </div>
            )}

            {/* Step 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="font-headline text-xs font-extrabold text-[#142B4A] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="material-symbols-outlined text-[16px] text-[#FF9F43]">label</span>
                <span>1. Product Overview (Seed / Fertilizer Details)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Hybrid F1 High-Yield Tomato Seeds"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agri Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A] bg-white"
                  >
                    {agriCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g. AgriMart Certified, IFFCO, Mahyco, Bayer"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pack Size / Weight *
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="e.g. 10g Pouch (~3,000 seeds), 25 kg Bag, 1 Litre"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Pricing, Delivery & Stock */}
            <div className="space-y-4">
              <h3 className="font-headline text-xs font-extrabold text-[#142B4A] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="material-symbols-outlined text-[16px] text-[#FF9F43]">payments</span>
                <span>2. Pricing & Farm Dispatch Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Farmer Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="249"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    placeholder="350"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subsidy / Discount Badge
                  </label>
                  <input
                    type="text"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="e.g. 28% OFF"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dispatch Slot Badge
                  </label>
                  <input
                    type="text"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    placeholder="⚡ Fast Dispatch"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-[#142B4A]"
                  />
                  <span>Product is In Stock & Available for Direct Dispatch</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-800">
                  <input
                    type="checkbox"
                    name="isOrganic"
                    checked={formData.isOrganic}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-[#142B4A]"
                  />
                  <span>100% Certified Organic / Bio-Input</span>
                </label>
              </div>
            </div>

            {/* Step 3: Seed Act & FCO Compliance Specifications */}
            <div className="space-y-4">
              <h3 className="font-headline text-xs font-extrabold text-[#142B4A] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="material-symbols-outlined text-[16px] text-[#FF9F43]">verified</span>
                <span>3. Seed Act, FCO License & Quality Standards</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Research Center / Origin Hub
                  </label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="e.g. ICAR Research Center, Phagwara Hub"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seed License / FCO Approval Number
                  </label>
                  <input
                    type="text"
                    name="fssaiLicence"
                    value={formData.fssaiLicence}
                    onChange={handleInputChange}
                    placeholder="Seed Lic: DL-AGRI-10020043 / FCO-PB-4401"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shelf Life & Germination Viability
                  </label>
                  <input
                    type="text"
                    name="shelfLife"
                    value={formData.shelfLife}
                    onChange={handleInputChange}
                    placeholder="e.g. 18 months from packaging date. Viability tested."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Farm Storage Guidelines
                  </label>
                  <input
                    type="text"
                    name="storageInstructions"
                    value={formData.storageInstructions}
                    onChange={handleInputChange}
                    placeholder="e.g. Store in dry ventilated warehouse at <18°C."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Description & Agronomy Guide
                </label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe seed variety, disease tolerance, expected yield, and cultivation method..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Agronomic Highlights (1 per line)
                </label>
                <textarea
                  name="highlights"
                  rows={3}
                  value={formData.highlights}
                  onChange={handleInputChange}
                  placeholder="High germination rate (>85% lab tested)&#10;Resistant to early blight & fruit borer&#10;ICAR & Seed Act 1966 certified"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                />
              </div>
            </div>

            {/* Step 4: Agronomic Facts & Lab Parameters */}
            <div className="space-y-4">
              <h3 className="font-headline text-xs font-extrabold text-[#142B4A] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="material-symbols-outlined text-[16px] text-[#FF9F43]">science</span>
                <span>4. Certified Lab Parameters & Agronomy</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Germination</label>
                  <input
                    type="text"
                    name="germination"
                    value={formData.germination}
                    onChange={handleInputChange}
                    placeholder="85% Min."
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phys. Purity</label>
                  <input
                    type="text"
                    name="purity"
                    value={formData.purity}
                    onChange={handleInputChange}
                    placeholder="98% Min."
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gen. Purity</label>
                  <input
                    type="text"
                    name="geneticPurity"
                    value={formData.geneticPurity}
                    onChange={handleInputChange}
                    placeholder="99% Min."
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Crop Season</label>
                  <input
                    type="text"
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    placeholder="Kharif & Rabi"
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Active / Soluble</label>
                  <input
                    type="text"
                    name="activeNutrient"
                    value={formData.activeNutrient}
                    onChange={handleInputChange}
                    placeholder="100% Soluble"
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Images */}
            <div className="space-y-4">
              <h3 className="font-headline text-xs font-extrabold text-[#142B4A] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="material-symbols-outlined text-[16px] text-[#FF9F43]">image</span>
                <span>5. Product Studio Visuals</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Image Web URL (Optional direct link)
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://images.example.com/seeds.jpg"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#142B4A]"
                />
              </div>

              {/* File upload */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#142B4A] transition-colors text-center bg-[#F7F9FC]">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  id="agri-image-upload"
                  className="hidden"
                />
                <label htmlFor="agri-image-upload" className="cursor-pointer flex flex-col items-center">
                  <span className="material-symbols-outlined text-[32px] text-[#142B4A] mb-1">
                    cloud_upload
                  </span>
                  <span className="text-xs font-bold text-[#142B4A]">
                    Click to upload seed or fertilizer packaging photos
                  </span>
                  <span className="text-[11px] text-[#5A6B82] mt-0.5">
                    JPEG, PNG, WebP supported (auto-optimized for fast farm portal loading)
                  </span>
                </label>
              </div>

              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className="flex gap-3 overflow-x-auto py-2">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                      <img src={preview} alt="Upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#142B4A] hover:bg-[#1B385D] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>{editProduct ? 'Update Agri Product' : 'Publish to AgriMart'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
