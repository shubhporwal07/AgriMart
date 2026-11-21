'use client';
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { get, onValue, push, ref as rtdbRef, remove, set, update } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { DEFAULT_GROCERY_PRODUCTS } from '../data/defaultProducts';

const ProductContext = createContext(null);
const PRODUCTS_CACHE_KEY = 'agrimart_seeds_products_v7';
const CART_STORAGE_KEY = 'agrimart_cart_v2';
const LOCAL_PRODUCTS_KEY = 'agrimart_seeds_local_v7';
const WISHLIST_STORAGE_KEY = 'agrimart_wishlist_v1';
const DB_TIMEOUT_MS = 25000;

export const DEFAULT_AGRI_CATEGORIES = [
  'Vegetable Seeds',
  'Grain & Field Crop Seeds',
  'Organic Manure & Compost',
  'NPK & Water Soluble Fertilizers',
  'Micronutrients & Plant Growth',
  'Bio-Pesticides & Fungicides',
  'Farm Sprayers & Agri Tools',
  'Soil Health & Testing Kits',
];

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

  // Collect all image sources, filter out invalid/broken links, and deduplicate strictly
  const rawImages = [
    ...(Array.isArray(data.imageDatas) ? data.imageDatas : []),
    data.imageUrl,
    data.imageData,
  ].filter(
    (img) => img && typeof img === 'string' && !img.includes('lh3.googleusercontent.com') && img.trim() !== ''
  );

  const productNameLower = (data.name || '').toLowerCase();
  const productIdLower = (id || data.id || '').toLowerCase();
  const isChilli = productIdLower.includes('chilli') || productNameLower.includes('chilli');
  const isWheat = productIdLower.includes('wheat') || productNameLower.includes('wheat');

  const filteredImages = rawImages.filter((img) => {
    if (img.includes('1588252303782-cb80119abd6d') && !isChilli) return false;
    if (img.includes('1574323347407-f5e1ad6d020b') && !isWheat) return false;
    return true;
  });

  const uniqueImageDatas = Array.from(new Set(filteredImages.length > 0 ? filteredImages : rawImages));
  const primaryImage = uniqueImageDatas[0] || data.imageUrl || '/images/products/hybrid-tomato-seeds.png';
  const finalImageDatas = uniqueImageDatas.length > 0 ? uniqueImageDatas : [primaryImage];

  return {
    id: id || data.id || `agri-${Date.now()}`,
    name: data.name || 'Certified Agri Input',
    category: data.category || 'Vegetable Seeds',
    brand: data.brand || 'AgriMart Select',
    unit: data.unit || data.packSize || '1 unit',
    price,
    mrp: mrp < price ? price : mrp,
    discount,
    rating: typeof data.rating === 'number' ? data.rating : 5.0,
    reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
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
    imageUrl: primaryImage,
    imageDatas: finalImageDatas,
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

const readWishlistStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeWishlistStorage = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

// Pure filter & sort computation (derived via useMemo — avoids stale closures and loop bugs)
const computeFilteredProducts = (sourceProducts, currentFilters, currentSort) => {
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
    } else if (
      typeof currentFilters.category === 'string' &&
      currentFilters.category.trim() &&
      currentFilters.category !== 'all'
    ) {
      result = result.filter((p) => p.category === currentFilters.category);
    }
  }

  // Price range filter
  if (Array.isArray(currentFilters.priceRange) && currentFilters.priceRange.length > 0) {
    result = result.filter((p) => {
      return currentFilters.priceRange.some((range) => {
        if (range === 'under-200' || range === 'under-50' || range === 'below-50') return p.price < 200;
        if (range === '200-500' || range === '50-150' || range === '150-300') return p.price >= 200 && p.price <= 500;
        if (range === '500-1000') return p.price > 500 && p.price <= 1000;
        if (range === 'above-1000' || range === '1000+' || range === 'above-300' || range === '300+') {
          return p.price > 1000 || (range.includes('300') && p.price > 300);
        }
        return true;
      });
    });
  }

  // Certifications & Agricultural Standards filter
  if (Array.isArray(currentFilters.dietary) && currentFilters.dietary.length > 0) {
    result = result.filter((p) => {
      return currentFilters.dietary.some((tag) => {
        if (tag === 'icar') return p.dietaryTags && p.dietaryTags.some((t) => /icar|nsc|govt/i.test(t));
        if (tag === 'npop' || tag === 'organic') {
          return p.isOrganic || (p.dietaryTags && p.dietaryTags.some((t) => /organic|npop|bio/i.test(t)));
        }
        if (tag === 'water-soluble' || tag === 'hydroponic') {
          return p.dietaryTags && p.dietaryTags.some((t) => /soluble|drip|hydroponic/i.test(t));
        }
        if (tag === 'bio-certified' || tag === 'vegan' || tag === 'gluten-free') {
          return p.dietaryTags && p.dietaryTags.some((t) => /fco|bio|certified|germination/i.test(t));
        }
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
      break;
  }

  return result;
};

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => readProductsCache());
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

  // Cart & Wishlist state (hydrated after mount to avoid SSR/localStorage mismatch)
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartNotice, setCartNotice] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistNotice, setWishlistNotice] = useState(null);

  useEffect(() => {
    setCartItems(readCartStorage());
    setWishlistItems(readWishlistStorage());
    setStorageHydrated(true);
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    writeCartStorage(cartItems);
  }, [cartItems, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    writeWishlistStorage(wishlistItems);
  }, [wishlistItems, storageHydrated]);

  // Dynamic Categories Management
  const [customCategories, setCustomCategories] = useState([]);

  // Compute union of all categories (defaults + custom + any from products)
  const categories = useMemo(() => {
    const set = new Set(DEFAULT_AGRI_CATEGORIES);
    customCategories.forEach((c) => {
      const name = typeof c === 'string' ? c : c?.name;
      if (name && name.trim()) set.add(name.trim());
    });
    products.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [customCategories, products]);

  // Load custom categories from localStorage and Firebase RTDB
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('agrimart_custom_categories_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setCustomCategories(parsed);
        }
      } catch (err) {
        console.warn('Local categories read error:', err);
      }
    }

    try {
      const catsRef = rtdbRef(realtimeDb, 'categories');
      const unsubscribe = onValue(catsRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list = Object.keys(val).map((k) => ({ ...val[k], id: k }));
          setCustomCategories(list);
          if (typeof window !== 'undefined') {
            localStorage.setItem('agrimart_custom_categories_v1', JSON.stringify(list));
          }
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firebase RTDB categories subscription error:', err);
    }
  }, []);

  const addCategory = async (categoryName, extra = {}) => {
    const name = (categoryName || '').trim();
    if (!name) throw new Error('Category name cannot be empty');
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      return name;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = {
      id: `cat_${Date.now()}`,
      name,
      slug,
      description: extra.description || `${name} certified agricultural inputs`,
      icon: extra.icon || 'agriculture',
      createdAt: new Date().toISOString(),
    };

    const next = [...customCategories, newCat];
    setCustomCategories(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrimart_custom_categories_v1', JSON.stringify(next));
    }

    try {
      const catRef = rtdbRef(realtimeDb, `categories/${newCat.id}`);
      await set(catRef, newCat);
    } catch (err) {
      console.warn('Realtime Database category sync warning:', err.message);
    }

    return name;
  };

  const deleteCategory = async (categoryName) => {
    const targetName = (categoryName || '').trim();
    const next = customCategories.filter(
      (c) => (typeof c === 'string' ? c : c.name).toLowerCase() !== targetName.toLowerCase()
    );
    setCustomCategories(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrimart_custom_categories_v1', JSON.stringify(next));
    }

    try {
      const catToDelete = customCategories.find(
        (c) => (typeof c === 'string' ? c : c.name).toLowerCase() === targetName.toLowerCase()
      );
      if (catToDelete?.id) {
        const catRef = rtdbRef(realtimeDb, `categories/${catToDelete.id}`);
        await remove(catRef);
      }
    } catch (err) {
      console.warn('Realtime Database category removal warning:', err.message);
    }
  };

  // Home Screen Showcase Curation (Hero Deals limit: 2, Flash Deals limit: 6)
  const HOME_SHOWCASE_LIMITS = {
    heroDeals: 2,
    flashDeals: 6,
  };

  const DEFAULT_HOME_SHOWCASE = {
    heroDeals: ['agri-kisan-starter-kit', 'agri-soil-booster-combo'],
    flashDeals: [
      'agri-hybrid-tomato-seeds',
      'agri-teja-chilli-seeds',
      'agri-pure-vermicompost-25kg',
      'agri-npk-19-19-19',
      'agri-cold-pressed-neem-oil',
      'agri-dap-granular-fertilizer',
    ],
  };

  const [homeShowcase, setHomeShowcase] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('agrimart_home_showcase_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            return {
              heroDeals: Array.isArray(parsed.heroDeals) ? parsed.heroDeals.slice(0, 2) : DEFAULT_HOME_SHOWCASE.heroDeals,
              flashDeals: Array.isArray(parsed.flashDeals) ? parsed.flashDeals.slice(0, 6) : DEFAULT_HOME_SHOWCASE.flashDeals,
            };
          }
        }
      } catch (err) {
        console.warn('Error reading local home showcase:', err);
      }
    }
    return DEFAULT_HOME_SHOWCASE;
  });

  // Subscribe to site_settings/home_showcase in Firebase RTDB
  useEffect(() => {
    try {
      const showcaseRef = rtdbRef(realtimeDb, 'site_settings/home_showcase');
      const unsubscribe = onValue(showcaseRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const updated = {
              heroDeals: Array.isArray(val.heroDeals) ? val.heroDeals.slice(0, 2) : DEFAULT_HOME_SHOWCASE.heroDeals,
              flashDeals: Array.isArray(val.flashDeals) ? val.flashDeals.slice(0, 6) : DEFAULT_HOME_SHOWCASE.flashDeals,
            };
            setHomeShowcase(updated);
            if (typeof window !== 'undefined') {
              localStorage.setItem('agrimart_home_showcase_v1', JSON.stringify(updated));
            }
          }
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Home showcase RTDB error:', err);
    }
  }, []);

  const addToHomeShowcase = async (section, productId) => {
    const validSections = ['heroDeals', 'flashDeals'];
    if (!validSections.includes(section)) {
      throw new Error(`Invalid section "${section}". Must be "heroDeals" or "flashDeals".`);
    }
    const limit = HOME_SHOWCASE_LIMITS[section] || 2;
    const currentList = Array.isArray(homeShowcase[section]) ? homeShowcase[section] : [];

    if (currentList.includes(productId)) {
      throw new Error('This product is already featured in this home screen section.');
    }

    if (currentList.length >= limit) {
      const sectionName = section === 'heroDeals' ? 'Hero Promotional Deals (max 2)' : 'Today\'s Flash Deals (max 6)';
      throw new Error(`Limit reached! The ${sectionName} section cannot exceed ${limit} products. Please remove an existing item first to make room.`);
    }

    const nextList = [...currentList, productId];
    const nextShowcase = {
      ...homeShowcase,
      [section]: nextList,
    };

    setHomeShowcase(nextShowcase);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrimart_home_showcase_v1', JSON.stringify(nextShowcase));
    }

    try {
      const showcaseRef = rtdbRef(realtimeDb, 'site_settings/home_showcase');
      await set(showcaseRef, nextShowcase);
    } catch (err) {
      console.warn('Realtime Database home showcase sync warning:', err.message);
    }

    return { success: true };
  };

  const removeFromHomeShowcase = async (section, productId) => {
    const currentList = Array.isArray(homeShowcase[section]) ? homeShowcase[section] : [];
    const nextList = currentList.filter((id) => id !== productId);

    const nextShowcase = {
      ...homeShowcase,
      [section]: nextList,
    };

    setHomeShowcase(nextShowcase);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrimart_home_showcase_v1', JSON.stringify(nextShowcase));
    }

    try {
      const showcaseRef = rtdbRef(realtimeDb, 'site_settings/home_showcase');
      await set(showcaseRef, nextShowcase);
    } catch (err) {
      console.warn('Realtime Database home showcase sync warning:', err.message);
    }

    return { success: true };
  };

  const updateHomeShowcase = async (newConfig) => {
    if (!newConfig || typeof newConfig !== 'object') {
      throw new Error('Invalid home showcase configuration.');
    }

    const hero = Array.isArray(newConfig.heroDeals) ? newConfig.heroDeals : homeShowcase.heroDeals;
    const flash = Array.isArray(newConfig.flashDeals) ? newConfig.flashDeals : homeShowcase.flashDeals;

    if (hero.length > HOME_SHOWCASE_LIMITS.heroDeals) {
      throw new Error(`Hero Deals section limit exceeded! Maximum ${HOME_SHOWCASE_LIMITS.heroDeals} items allowed.`);
    }
    if (flash.length > HOME_SHOWCASE_LIMITS.flashDeals) {
      throw new Error(`Flash Deals section limit exceeded! Maximum ${HOME_SHOWCASE_LIMITS.flashDeals} items allowed.`);
    }

    const nextShowcase = { heroDeals: hero, flashDeals: flash };
    setHomeShowcase(nextShowcase);

    if (typeof window !== 'undefined') {
      localStorage.setItem('agrimart_home_showcase_v1', JSON.stringify(nextShowcase));
    }

    try {
      const showcaseRef = rtdbRef(realtimeDb, 'site_settings/home_showcase');
      await set(showcaseRef, nextShowcase);
    } catch (err) {
      console.warn('Realtime Database home showcase sync warning:', err.message);
    }

    return { success: true };
  };

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

  // Derive filtered & sorted products cleanly whenever products, filters, or sortBy change
  const filteredProducts = useMemo(
    () => computeFilteredProducts(products, filters, sortBy),
    [products, filters, sortBy]
  );

  // Reset pagination to page 1 when filters or sort order change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // Subscribe to Realtime Database once on mount
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
        } else {
          // If RTDB is empty, seed default items so user sees a rich store
          const defaults = DEFAULT_GROCERY_PRODUCTS.map((p) => normalizeProductData(p.id, p));
          writeProductsCache(defaults);
          setProducts(defaults);
        }
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.warn('Realtime Database notice (using local/default grocery catalog):', err?.message);
        const fallback = loadLocalProducts();
        setProducts(fallback);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Update filter helper (stable reference, pure state update)
  const updateFilter = useCallback((filterType, value, isChecked) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (filterType === 'inStockOnly') {
        updated.inStockOnly = isChecked !== undefined ? Boolean(isChecked) : Boolean(value);
      } else if (filterType === 'minRating') {
        const numericVal = value === null || value === undefined ? null : Number(value);
        if (isChecked !== undefined) {
          updated.minRating = isChecked ? numericVal : null;
        } else {
          updated.minRating = prev.minRating === numericVal ? null : numericVal;
        }
      } else if (filterType === 'searchQuery') {
        updated.searchQuery = typeof value === 'string' ? value : '';
      } else if (filterType === 'category') {
        const currentList = Array.isArray(prev.category) ? prev.category : [];
        if (Array.isArray(value)) {
          updated.category = value;
        } else if (isChecked !== undefined) {
          updated.category = isChecked
            ? [...currentList.filter((c) => c !== value), value]
            : currentList.filter((item) => item !== value);
        } else {
          const exists = currentList.includes(value);
          updated.category = exists
            ? currentList.filter((item) => item !== value)
            : [...currentList, value];
        }
      } else if (filterType === 'priceRange') {
        const currentList = Array.isArray(prev.priceRange) ? prev.priceRange : [];
        if (isChecked !== undefined) {
          updated.priceRange = isChecked
            ? [...currentList.filter((r) => r !== value), value]
            : currentList.filter((item) => item !== value);
        } else {
          const exists = currentList.includes(value);
          updated.priceRange = exists
            ? currentList.filter((item) => item !== value)
            : [...currentList, value];
        }
      } else if (filterType === 'dietary') {
        const currentList = Array.isArray(prev.dietary) ? prev.dietary : [];
        if (isChecked !== undefined) {
          updated.dietary = isChecked
            ? [...currentList.filter((d) => d !== value), value]
            : currentList.filter((item) => item !== value);
        } else {
          const exists = currentList.includes(value);
          updated.dietary = exists
            ? currentList.filter((item) => item !== value)
            : [...currentList, value];
        }
      } else {
        const currentList = Array.isArray(prev[filterType]) ? prev[filterType] : [];
        if (isChecked !== undefined) {
          updated[filterType] = isChecked
            ? [...currentList.filter((x) => x !== value), value]
            : currentList.filter((item) => item !== value);
        } else {
          updated[filterType] = value;
        }
      }
      return updated;
    });
  }, []);

  const setSearchQuery = useCallback((query) => {
    updateFilter('searchQuery', query, true);
  }, [updateFilter]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      category: [],
      priceRange: [],
      dietary: [],
      inStockOnly: false,
      minRating: null,
      searchQuery: '',
    });
  }, []);

  // Nav category slug helper (stable reference — NEVER re-triggers when user modifies filters)
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

    setFilters((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(newFilters)) return prev;
      return newFilters;
    });
  }, []);

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
        imageDatas: imageDatas.length > 0 ? imageDatas : [productData.imageUrl || 'https://via.placeholder.com/400x400?text=AgriMart'],
      });

      await withTimeout(
        set(newProductRef, normalized),
        DB_TIMEOUT_MS,
        'Save to Realtime Database timed out. Saved locally.'
      );

      const next = [normalized, ...products];
      setProducts(next);
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
        imageDatas: imageDatas.length > 0 ? imageDatas : [productData.imageUrl || 'https://via.placeholder.com/400x400?text=AgriMart'],
      });

      const next = [localProduct, ...products];
      saveLocalProducts(next);
      setProducts(next);
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
    setLoading(false);
  };

  // Wishlist Functions
  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
    setWishlistNotice({
      id: `wl-add-${product.id}-${Date.now()}`,
      action: 'added',
      name: product.name,
    });
  };

  const removeFromWishlist = (productId) => {
    const existing = wishlistItems.find((p) => p.id === productId);
    setWishlistItems((prev) => prev.filter((p) => p.id !== productId));
    setWishlistNotice({
      id: `wl-rem-${productId}-${Date.now()}`,
      action: 'removed',
      name: existing?.name || 'Item',
    });
  };

  const clearWishlistNotice = useCallback(() => {
    setWishlistNotice(null);
  }, []);

  const isInWishlist = (productId) => wishlistItems.some((p) => p.id === productId);

  const wishlistCount = wishlistItems.length;

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

  const clearCartNotice = useCallback(() => {
    setCartNotice(null);
  }, []);

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
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    storageHydrated,
    wishlistItems,
    wishlistCount,
    wishlistNotice,
    addToWishlist,
    removeFromWishlist,
    clearWishlistNotice,
    isInWishlist,
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
    categories,
    customCategories,
    addCategory,
    deleteCategory,
    homeShowcase,
    homeLimits: HOME_SHOWCASE_LIMITS,
    addToHomeShowcase,
    removeFromHomeShowcase,
    updateHomeShowcase,
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
