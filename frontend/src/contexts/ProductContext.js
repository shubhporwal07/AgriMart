'use client';
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { get, onValue, push, ref as rtdbRef, remove, set, update } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { DEFAULT_GROCERY_PRODUCTS } from '../data/defaultProducts';

const ProductContext = createContext(null);
const PRODUCTS_CACHE_KEY = 'agrimart_seeds_products_v5';
const CART_STORAGE_KEY = 'agrimart_cart_v2';
const LOCAL_PRODUCTS_KEY = 'agrimart_seeds_local_v5';
const DB_TIMEOUT_MS = 25000;

// Compress image helper
const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxWidth = 1200;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = e.target.result;
  };
  reader.onerror = () => reject(new Error('Failed to read file'));
  reader.readAsDataURL(file);
});

const normalizeProductData = (id, data = {}) => {
  const price = typeof data.price === 'number' ? data.price : parseFloat(data.price || 0);
  const mrp = typeof data.mrp === 'number' ? data.mrp : parseFloat(data.mrp || price || 0);
  const discount = data.discount || (mrp > price ? `${Math.round(((mrp - price) / mrp) * 100)}% OFF` : '');

  const imageDatas = Array.isArray(data.imageDatas) && data.imageDatas.length > 0
    ? data.imageDatas
    : (data.imageData ? [data.imageData] : (data.imageUrl ? [data.imageUrl] : []));

  return {
    id: id || data.id || `agri-${Date.now()}`,
    name: data.name || 'Certified Agri Input',
    category: data.category || 'Vegetable Seeds',
    brand: data.brand || 'AgriMart Select',
    unit: data.unit || data.packSize || '1 unit',
    price,
    mrp: mrp < price ? price : mrp,
    discount,
    rating: typeof data.rating === 'number' ? data.rating : 4.8,
    reviewCount: data.reviewCount || 340,
    deliveryTime: data.deliveryTime || '⚡ Fast Farm Dispatch',
    inStock: data.inStock !== undefined ? !!data.inStock : true,
    stockCount: typeof data.stockCount === 'number' ? data.stockCount : 100,
    isOrganic: !!data.isOrganic,
    dietaryTags: Array.isArray(data.dietaryTags) ? data.dietaryTags : (data.dietaryTag ? [data.dietaryTag] : ['95%+ Germination', 'ICAR Tested']),
    shelfLife: data.shelfLife || '18 months from batch packing date. Store in cool, dry conditions.',
    storageInstructions: data.storageInstructions || 'Store in airtight original pack away from direct sunlight and dampness.',
    origin: data.origin || 'Certified Agricultural Research Stations & Hubs',
    fssaiLicence: data.fssaiLicence || data.seedLicence || 'Seed Lic: AGRI/SEED/DL-8841',
    manufacturerDetails: data.manufacturerDetails || 'Marketed & Distributed by AgriMart Agritech Solutions Pvt. Ltd.',
    description: data.description || 'Certified high-yield agricultural inputs tested under Seed Act 1966 and FCO 1985 guidelines for maximum stand uniformity and harvest yield.',
    highlights: Array.isArray(data.highlights) && data.highlights.length > 0 ? data.highlights : [
      '100% verified germination rate and batch purity',
      'Govt. Seed Act 1966 & FCO 1985 compliant',
      'Direct doorstep farm delivery across India',
    ],
    nutritionalFacts: data.nutritionalFacts || {
      'Germination Standard': '90%+ Certified',
      'Physical Purity': '98% Min',
      'Specification': 'FCO / Seed Act Compliant',
    },
    imageUrl: imageDatas[0] || data.imageUrl || '/images/products/hybrid-tomato-seeds.png',
    imageDatas,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
};

const readProductsCache = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_GROCERY_PRODUCTS.map((p) => normalizeProductData(p.id, p));
  }
  try {
    const raw = sessionStorage.getItem(PRODUCTS_CACHE_KEY) || localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return DEFAULT_GROCERY_PRODUCTS.map((p) => normalizeProductData(p.id, p));
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_GROCERY_PRODUCTS.map((p) => normalizeProductData(p.id, p));
    }
    return parsed.map((product) => normalizeProductData(product.id, product));
  } catch {
    return DEFAULT_GROCERY_PRODUCTS.map((p) => normalizeProductData(p.id, p));
  }
};

const writeProductsCache = (items) => {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify(items);
    sessionStorage.setItem(PRODUCTS_CACHE_KEY, payload);
    localStorage.setItem(PRODUCTS_CACHE_KEY, payload);
  } catch {
    // ignore quota failure
  }
};

const readCartStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCartStorage = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => readProductsCache());
  const [filteredProducts, setFilteredProducts] = useState(() => readProductsCache());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    category: [],
    priceRange: [],
    dietary: [],
    inStockOnly: false,
    minRating: null,
    searchQuery: '',
  });

  const [sortBy, setSortBy] = useState('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Cart state
  const [cartItems, setCartItems] = useState(() => readCartStorage());
  const [cartNotice, setCartNotice] = useState(null);

  useEffect(() => {
    writeCartStorage(cartItems);
  }, [cartItems]);

  const withTimeout = (promise, timeoutMs, timeoutMessage) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      }),
    ]);
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const isPermissionDeniedError = (err) => {
    const msg = String(err?.message || '').toLowerCase();
    const code = String(err?.code || '').toLowerCase();
    return msg.includes('permission_denied') || msg.includes('permission denied') || code.includes('permission-denied');
  };

  const loadLocalProducts = () => {
    if (typeof window === 'undefined') {
      return DEFAULT_GROCERY_PRODUCTS.map((p) => normalizeProductData(p.id, p));
    }
    try {
      const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (!raw) return DEFAULT_GROCERY_PRODUCTS.map((p) => normalizeProductData(p.id, p));
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return DEFAULT_GROCERY_PRODUCTS.map((p) => normalizeProductData(p.id, p));
      }
      return parsed.map((p) => normalizeProductData(p.id, p));
    } catch {
      return DEFAULT_GROCERY_PRODUCTS.map((p) => normalizeProductData(p.id, p));
    }
  };

  const saveLocalProducts = (items) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  // Filter & Sort Logic
  const applyFiltersAndSort = useCallback((sourceProducts, currentFilters = filters, currentSort = sortBy) => {
    let result = [...sourceProducts];

    // Search query filter
    if (currentFilters.searchQuery && currentFilters.searchQuery.trim()) {
      const q = currentFilters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (currentFilters.category) {
      if (Array.isArray(currentFilters.category) && currentFilters.category.length > 0) {
        result = result.filter((p) => currentFilters.category.includes(p.category));
      } else if (typeof currentFilters.category === 'string' && currentFilters.category.trim() && currentFilters.category !== 'all') {
        result = result.filter((p) => p.category === currentFilters.category);
      }
    }

    // Price range filter
    if (currentFilters.priceRange && currentFilters.priceRange.length > 0) {
      result = result.filter((p) => {
        return currentFilters.priceRange.some((range) => {
          if (range === 'under-200' || range === 'under-50' || range === 'below-50') return p.price < 200;
          if (range === '200-500' || range === '50-150' || range === '150-300') return p.price >= 200 && p.price <= 500;
          if (range === '500-1000') return p.price > 500 && p.price <= 1000;
          if (range === 'above-1000' || range === '1000+' || range === 'above-300' || range === '300+') return p.price > 1000 || (range.includes('300') && p.price > 300);
          return true;
        });
      });
    }

    // Certifications & Agricultural Standards filter
    if (currentFilters.dietary && currentFilters.dietary.length > 0) {
      result = result.filter((p) => {
        return currentFilters.dietary.some((tag) => {
          if (tag === 'icar') return p.dietaryTags && p.dietaryTags.some(t => /icar|nsc|govt/i.test(t));
          if (tag === 'npop' || tag === 'organic') return p.isOrganic || (p.dietaryTags && p.dietaryTags.some(t => /organic|npop|bio/i.test(t)));
          if (tag === 'water-soluble' || tag === 'hydroponic') return p.dietaryTags && p.dietaryTags.some(t => /soluble|drip|hydroponic/i.test(t));
          if (tag === 'bio-certified' || tag === 'vegan' || tag === 'gluten-free') return p.dietaryTags && p.dietaryTags.some(t => /fco|bio|certified|germination/i.test(t));
          return true;
        });
      });
    }

    // In Stock Only - strict: must be inStock === true AND stockCount > 0
    if (currentFilters.inStockOnly) {
      result = result.filter((p) => p.inStock === true && (p.stockCount === undefined || p.stockCount > 0));
    }

    // Min Rating
    if (currentFilters.minRating) {
      result = result.filter((p) => (p.rating || 0) >= Number(currentFilters.minRating));
    }

    // Sorting
    switch (currentSort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'discount':
        result.sort((a, b) => {
          const discA = a.mrp && a.price ? (a.mrp - a.price) / a.mrp : 0;
          const discB = b.mrp && b.price ? (b.mrp - b.price) / b.mrp : 0;
          return discB - discA;
        });
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'recommended':
      default:
        // Keep natural curated order
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [filters, sortBy]);

  // Subscribe to Realtime Database
  useEffect(() => {
    let isMounted = true;
    const productsRef = rtdbRef(realtimeDb, 'products');

    const unsubscribe = onValue(
      productsRef,
      (snapshot) => {
        if (!isMounted) return;
        const val = snapshot.val();
        if (val && Object.keys(val).length > 0) {
          const list = Object.entries(val).map(([id, data]) => normalizeProductData(id, data));
          writeProductsCache(list);
          setProducts(list);
          applyFiltersAndSort(list);
        } else {
          // If RTDB is empty, seed default items so user sees a rich store
          const defaults = DEFAULT_GROCERY_PRODUCTS.map((p) => normalizeProductData(p.id, p));
          writeProductsCache(defaults);
          setProducts(defaults);
          applyFiltersAndSort(defaults);
        }
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.warn('Realtime Database notice (using local/default grocery catalog):', err?.message);
        const fallback = loadLocalProducts();
        setProducts(fallback);
        applyFiltersAndSort(fallback);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [applyFiltersAndSort]);

  // Update filter helper
  const updateFilter = (filterType, value, isChecked) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (filterType === 'inStockOnly') {
        updated.inStockOnly = isChecked !== undefined ? Boolean(isChecked) : Boolean(value);
      } else if (filterType === 'minRating') {
        if (isChecked !== undefined) {
          updated.minRating = isChecked ? Number(value) : null;
        } else {
          updated.minRating = prev.minRating === Number(value) ? null : Number(value);
        }
      } else if (filterType === 'searchQuery') {
        updated.searchQuery = typeof value === 'string' ? value : '';
      } else if (filterType === 'category') {
        if (Array.isArray(value)) {
          updated.category = value;
        } else if (isChecked !== undefined) {
          if (isChecked) {
            updated.category = [...(updated.category || []).filter((c) => c !== value), value];
          } else {
            updated.category = (updated.category || []).filter((item) => item !== value);
          }
        } else {
          const exists = (updated.category || []).includes(value);
          updated.category = exists
            ? (updated.category || []).filter((item) => item !== value)
            : [...(updated.category || []), value];
        }
      } else if (filterType === 'priceRange') {
        if (isChecked !== undefined) {
          if (isChecked) {
            updated.priceRange = [...(updated.priceRange || []).filter((r) => r !== value), value];
          } else {
            updated.priceRange = (updated.priceRange || []).filter((item) => item !== value);
          }
        } else {
          const exists = (updated.priceRange || []).includes(value);
          updated.priceRange = exists
            ? (updated.priceRange || []).filter((item) => item !== value)
            : [...(updated.priceRange || []), value];
        }
      } else if (filterType === 'dietary') {
        if (isChecked !== undefined) {
          if (isChecked) {
            updated.dietary = [...(updated.dietary || []).filter((d) => d !== value), value];
          } else {
            updated.dietary = (updated.dietary || []).filter((item) => item !== value);
          }
        } else {
          const exists = (updated.dietary || []).includes(value);
          updated.dietary = exists
            ? (updated.dietary || []).filter((item) => item !== value)
            : [...(updated.dietary || []), value];
        }
      } else {
        if (isChecked !== undefined) {
          if (isChecked) {
            updated[filterType] = [...(updated[filterType] || []).filter((x) => x !== value), value];
          } else {
            updated[filterType] = (updated[filterType] || []).filter((item) => item !== value);
          }
        } else {
          updated[filterType] = value;
        }
      }
      applyFiltersAndSort(products, updated, sortBy);
      return updated;
    });
  };

  const setSearchQuery = (query) => {
    updateFilter('searchQuery', query, true);
  };

  const clearAllFilters = () => {
    const cleared = {
      category: [],
      priceRange: [],
      dietary: [],
      inStockOnly: false,
      minRating: null,
      searchQuery: '',
    };
    setFilters(cleared);
    applyFiltersAndSort(products, cleared, sortBy);
  };

  // Nav category slug helper
  const applyNavCategorySlug = useCallback((slug) => {
    const map = {
      all: [],
      'vegetable-seeds': ['Vegetable Seeds'],
      'field-crop-seeds': ['Grain & Crop Seeds'],
      'grain-crop-seeds': ['Grain & Crop Seeds'],
      'organic-fertilizers': ['Organic Manure & Compost'],
      'chemical-npk': ['NPK & Water Soluble'],
      'micronutrients': ['Micronutrients & Growth'],
      'bio-pesticides': ['Bio-Pesticides & Fungicides'],
      'sprayers-tools': ['Farm Tools & Sprayers'],
      'soil-kits': ['Soil Health Kits'],
      'sowing-season-deals': ['Vegetable Seeds', 'Grain & Crop Seeds'],
      'soil-doctor': ['Soil Health Kits', 'Organic Manure & Compost'],
      'soil-nutrition-corner': ['Soil Health Kits', 'Organic Manure & Compost', 'NPK & Water Soluble'],
      // Aliases
      'hybrid-seeds': ['Vegetable Seeds', 'Grain & Crop Seeds'],
      'fruits-vegetables': ['Vegetable Seeds'],
      'staples-grains': ['Grain & Crop Seeds'],
      'daily-deals': [],
      'organic-corner': ['Organic Manure & Compost'],
    };
    const key = String(slug || 'all').toLowerCase().trim();
    const categories = map[key] || [];
    const newFilters = {
      category: categories,
      priceRange: [],
      dietary: key === 'organic-corner' ? ['organic'] : [],
      inStockOnly: false,
      minRating: null,
      searchQuery: '',
    };
    setFilters(newFilters);
    applyFiltersAndSort(products, newFilters, sortBy);
  }, [products, sortBy, applyFiltersAndSort]);

  // Add Product (Admin)
  const addProduct = async (productData, imageFiles = []) => {
    setLoading(true);
    setError(null);
    try {
      const productsRef = rtdbRef(realtimeDb, 'products');
      const newProductRef = push(productsRef);
      const productId = newProductRef.key;

      let imageDatas = [];
      if (Array.isArray(imageFiles) && imageFiles.length > 0) {
        for (const file of imageFiles) {
          try {
            const compressed = await compressImage(file);
            imageDatas.push(compressed);
          } catch {
            imageDatas.push(await fileToDataUrl(file));
          }
        }
      }
      if (productData.imageUrl && !imageDatas.includes(productData.imageUrl)) {
        imageDatas.unshift(productData.imageUrl);
      }

      const normalized = normalizeProductData(productId, {
        ...productData,
        imageDatas: imageDatas.length > 0 ? imageDatas : [productData.imageUrl || 'https://via.placeholder.com/400x400?text=Gupta+Mart'],
      });

      await withTimeout(
        set(newProductRef, normalized),
        DB_TIMEOUT_MS,
        'Save to Realtime Database timed out. Saved locally.'
      );

      const next = [normalized, ...products];
      setProducts(next);
      applyFiltersAndSort(next);
      return normalized;
    } catch (err) {
      console.warn('Realtime Database fallback for addProduct:', err);
      const localId = `local_${Date.now()}`;
      let imageDatas = [];
      if (Array.isArray(imageFiles) && imageFiles.length > 0) {
        for (const file of imageFiles) {
          try {
            const compressed = await compressImage(file);
            imageDatas.push(compressed);
          } catch {
            imageDatas.push(await fileToDataUrl(file));
          }
        }
      }
      if (productData.imageUrl && !imageDatas.includes(productData.imageUrl)) {
        imageDatas.unshift(productData.imageUrl);
      }

      const localProduct = normalizeProductData(localId, {
        ...productData,
        imageDatas: imageDatas.length > 0 ? imageDatas : [productData.imageUrl || 'https://via.placeholder.com/400x400?text=Gupta+Mart'],
      });

      const next = [localProduct, ...products];
      saveLocalProducts(next);
      setProducts(next);
      applyFiltersAndSort(next);
      return localProduct;
    } finally {
      setLoading(false);
    }
  };

  // Edit Product (Admin)
  const editProduct = async (productId, productData, imageFiles = []) => {
    setLoading(true);
    setError(null);
    try {
      const existing = products.find((p) => p.id === productId);
      let imageDatas = existing?.imageDatas || [];

      if (Array.isArray(imageFiles) && imageFiles.length > 0) {
        for (const file of imageFiles) {
          try {
            const compressed = await compressImage(file);
            imageDatas.push(compressed);
          } catch {
            imageDatas.push(await fileToDataUrl(file));
          }
        }
      }
      if (productData.imageUrl && !imageDatas.includes(productData.imageUrl)) {
        imageDatas.unshift(productData.imageUrl);
      }

      const updated = normalizeProductData(productId, {
        ...existing,
        ...productData,
        imageDatas,
        updatedAt: new Date().toISOString(),
      });

      await withTimeout(
        update(rtdbRef(realtimeDb, `products/${productId}`), updated),
        DB_TIMEOUT_MS,
        'Update timed out.'
      );

      const next = products.map((p) => (p.id === productId ? updated : p));
      setProducts(next);
      applyFiltersAndSort(next);
      return updated;
    } catch (err) {
      console.warn('Realtime Database fallback for editProduct:', err);
      const existing = products.find((p) => p.id === productId);
      const updated = normalizeProductData(productId, {
        ...existing,
        ...productData,
        updatedAt: new Date().toISOString(),
      });
      const next = products.map((p) => (p.id === productId ? updated : p));
      saveLocalProducts(next);
      setProducts(next);
      applyFiltersAndSort(next);
      return updated;
    } finally {
      setLoading(false);
    }
  };

  // Delete Product (Admin)
  const deleteProduct = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      await withTimeout(
        remove(rtdbRef(realtimeDb, `products/${productId}`)),
        DB_TIMEOUT_MS,
        'Delete timed out.'
      );
    } catch (err) {
      console.warn('RTDB remove fallback:', err);
    }
    const next = products.filter((p) => p.id !== productId);
    saveLocalProducts(next);
    setProducts(next);
    applyFiltersAndSort(next);
    setLoading(false);
  };

  // Cart Functions
  const addToCart = (product, quantity = 1) => {
    setCartNotice({
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
    });

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find((p) => p.id === productId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const clearCartNotice = () => {
    setCartNotice(null);
  };

  // Total cart calculation
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  }, [cartItems]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const value = {
    products,
    filteredProducts,
    paginatedProducts,
    loading,
    error,
    filters,
    updateFilter,
    setSearchQuery,
    clearAllFilters,
    applyNavCategorySlug,
    sortBy,
    setSortBy: (newSort) => {
      setSortBy(newSort);
      applyFiltersAndSort(products, filters, newSort);
    },
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    cartItems,
    cartCount,
    cartTotal,
    cartNotice,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getItemQuantity,
    clearCart,
    clearCartNotice,
    addProduct,
    editProduct,
    deleteProduct,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
