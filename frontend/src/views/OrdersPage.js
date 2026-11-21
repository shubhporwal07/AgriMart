'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  ChevronDown,
  ShoppingBag,
  Search,
  LogIn,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { OrderListSkeleton } from '../components/SkeletonLoader';
import { auth, realtimeDb } from '../config/firebase';
import { ref as rtdbRef, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { accordionVariants, buttonTap, EASE } from '../utils/motion';

const statusSteps = [
  { key: 'placed', label: 'Order Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing at Hub', icon: Clock },
  { key: 'shipped', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered to Farm', icon: Package },
];

function getStatusIndex(status) {
  const norm = (status || '').toLowerCase();
  if (norm === 'placed' || norm === 'paid' || norm === 'confirmed') return 0;
  if (norm === 'processing') return 1;
  if (norm === 'shipped' || norm === 'out_for_delivery') return 2;
  if (norm === 'delivered') return 3;
  return 0;
}

function formatPrice(price) {
  return '₹' + (price || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(timestamp) {
  if (!timestamp) return '—';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const currentStep = getStatusIndex(order.status);

  const getStatusBadge = (status) => {
    const norm = (status || '').toLowerCase();
    if (norm === 'delivered') {
      return { label: 'Delivered', bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    }
    if (norm === 'shipped' || norm === 'out_for_delivery') {
      return { label: 'Out for Delivery', bg: 'bg-blue-50 text-blue-700 border border-blue-200' };
    }
    if (norm === 'processing') {
      return { label: 'Processing', bg: 'bg-amber-50 text-amber-700 border border-amber-200' };
    }
    return { label: 'Order Confirmed', bg: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold' };
  };

  const badge = getStatusBadge(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Order Header */}
      <div
        className="p-5 sm:p-6 cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B1B30] text-[#FF9F43] shadow-xs shrink-0">
              <Package className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] text-stone-500 font-bold tracking-wider uppercase">
                Order Reference
              </p>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {order.razorpayOrderId || order.id}
              </p>
              {order.userEmail && (
                <p className="text-[11px] text-stone-500 truncate max-w-xs sm:max-w-md">
                  Ordered by: <span className="font-semibold text-slate-800">{order.userName || 'Customer'}</span> ({order.userEmail})
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center">
            <div className="text-right">
              <p className="text-[11px] text-stone-500 font-medium">Total Paid</p>
              <p className="text-base sm:text-lg font-black text-[#142B4A]">{formatPrice(order.amount)}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-stone-500 font-medium">Date &amp; Time</p>
              <p className="text-xs font-semibold text-stone-700">{formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badge.bg}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {badge.label}
              </span>
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2, ease: EASE.inOut }}
                className="ml-2 inline-flex text-stone-400"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.span>
            </div>
          </div>
        </div>

        {/* Date on mobile */}
        <p className="text-xs text-stone-500 mt-2 sm:hidden">{formatDate(order.createdAt)}</p>
      </div>

      {/* Expanded Details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            variants={accordionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 p-5 sm:p-6 bg-stone-50/40 space-y-6">
              {/* Status Tracker */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Dispatch &amp; Delivery Tracking</span>
                </p>
                <div className="flex items-center justify-between relative px-2 sm:px-6">
                  {/* Progress line */}
                  <div className="absolute top-5 left-8 right-8 h-1 bg-stone-200" />
                  <div
                    className="absolute top-5 left-8 h-1 bg-[#0B1B30] transition-all duration-500"
                    style={{ width: `calc(${(currentStep / (statusSteps.length - 1)) * 100}% - 40px)` }}
                  />

                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= currentStep;
                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-all ${
                            isActive
                              ? 'bg-[#0B1B30] border-[#0B1B30] text-white shadow-sm'
                              : 'bg-white border-stone-200 text-stone-400'
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <p className={`mt-2 text-[10px] sm:text-xs font-bold text-center ${
                          isActive ? 'text-[#0B1B30]' : 'text-stone-400'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-[#FF9F43]" />
                  <span>Certified Farm Products in Order ({order.items?.length || 0})</span>
                </p>
                <div className="space-y-2.5">
                  {(order.items || []).map((item, idx) => {
                    const displayImg =
                      (item.imageUrl && !item.imageUrl.includes('lh3.googleusercontent.com') && item.imageUrl) ||
                      '/images/products/hybrid-tomato-seeds.png';

                    return (
                      <div key={idx} className="flex items-center gap-3.5 bg-white border border-stone-200 rounded-2xl p-3 shadow-xs">
                        <img
                          src={displayImg}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/products/hybrid-tomato-seeds.png';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.name}</p>
                          <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-slate-700">Qty: {item.quantity}</span>
                            {(item.packSize || item.weight) && (
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                {item.packSize || item.weight}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm font-black text-slate-900 whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Delivery Address Info */}
              <div className="pt-4 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
                  <p className="text-stone-500 font-semibold mb-1">Payment Details</p>
                  <p className="font-extrabold text-emerald-700">{order.paymentMethod || 'Online Payment'}</p>
                  <p className="font-mono text-[11px] text-stone-600 mt-0.5">
                    ID: {order.razorpayPaymentId || order.id || '—'}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">Status: <strong className="text-slate-800">{order.paymentStatus || 'Paid'}</strong></p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
                  <p className="text-stone-500 font-semibold mb-1">Delivery Dispatch</p>
                  <p className="font-bold text-slate-900">{order.deliverySlot || 'Standard Delivery'}</p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Hub: <strong>{order.deliveryLocation || 'AgriMart Hub @ LPU'}</strong>
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
                  <p className="text-stone-500 font-semibold mb-1">Shipping Destination</p>
                  <p className="font-bold text-slate-900 truncate">
                    {order.shippingAddress?.fullName || order.userName || 'Customer'}
                  </p>
                  <p className="text-[11px] text-stone-600 leading-snug line-clamp-2 mt-0.5">
                    {order.shippingAddress?.addressLine1 || order.shippingAddress?.flatBuilding || ''}
                    {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ''}
                    {order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ''}
                  </p>
                  {order.shippingAddress?.phone && (
                    <p className="text-[11px] text-stone-500 font-mono mt-1">
                      Ph: {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize active user from AuthContext or direct Firebase Auth
  useEffect(() => {
    if (authUser) {
      setActiveUser(authUser);
      return;
    }

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setActiveUser(fbUser);
      } else {
        // Check localStorage if any user email was remembered
        const rememberedEmail = typeof window !== 'undefined'
          ? localStorage.getItem('agrimart_user_email') || localStorage.getItem('userEmail')
          : null;
        if (rememberedEmail) {
          setActiveUser({ email: rememberedEmail, uid: 'local' });
        } else {
          setActiveUser(null);
        }
      }
    });

    return () => unsub();
  }, [authUser]);

  // Real-time subscription to orders in Firebase Realtime Database
  useEffect(() => {
    let unsubscribe = null;
    try {
      const ordersRef = rtdbRef(realtimeDb, 'orders');
      unsubscribe = onValue(
        ordersRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));

            // Sort newest orders first
            list.sort((a, b) => {
              const timeA = new Date(a.createdAt || 0).getTime();
              const timeB = new Date(b.createdAt || 0).getTime();
              return timeB - timeA;
            });

            setAllOrders(list);
          } else {
            setAllOrders([]);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Realtime Database orders error:', error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Orders subscription error:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const currentEmail = (
    activeUser?.email ||
    authUser?.email ||
    auth.currentUser?.email ||
    (mounted && typeof window !== 'undefined' ? localStorage.getItem('agrimart_user_email') || localStorage.getItem('userEmail') : '') ||
    ''
  ).trim().toLowerCase();

  const currentUid = activeUser?.uid || authUser?.uid || auth.currentUser?.uid || '';

  // Filter orders matching logged-in user OR manual search lookup
  const matchedOrders = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();

    return allOrders.filter((order) => {
      const orderEmail = (order.userEmail || order.shippingAddress?.email || '').trim().toLowerCase();
      const orderPhone = (order.shippingAddress?.phone || order.phone || '').trim();
      const orderUid = order.userId || '';
      const orderId = (order.id || '').toLowerCase();
      const rzpId = (order.razorpayOrderId || '').toLowerCase();

      // 1. If customer typed a manual search/lookup:
      if (query) {
        if (orderEmail && orderEmail.includes(query)) return true;
        if (orderPhone && orderPhone.includes(query)) return true;
        if (orderId && orderId.includes(query)) return true;
        if (rzpId && rzpId.includes(query)) return true;
        if (order.userName && order.userName.toLowerCase().includes(query)) return true;
        return false;
      }

      // 2. Otherwise match logged-in user by email or UID
      if (currentEmail && orderEmail && orderEmail === currentEmail) return true;
      if (currentUid && orderUid && orderUid === currentUid && orderUid !== 'guest') return true;
      if (currentEmail && orderPhone && currentEmail.includes(orderPhone)) return true;

      return false;
    });
  }, [allOrders, currentEmail, currentUid, searchFilter]);

  const isUserAuthenticated = !!activeUser || isAuthenticated;

  return (
    <div className="min-h-screen bg-[#FAF5EB] font-sans text-[#263449]">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 space-y-6">
        {/* Header Navigation */}
        <div>
          <Link
            href="/dashboard"
            prefetch={true}
            className="inline-flex items-center gap-2 text-stone-600 hover:text-[#142B4A] mb-3 transition text-xs sm:text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Crop Input Catalog
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#142B4A]">
                MY AGRI &amp; FARM ORDERS
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-stone-500">
                Track certified seeds, fertilizers, and village doorstep dispatches
              </p>
            </div>

            {currentEmail && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-stone-200 shadow-xs text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-stone-500">Account:</span>
                <span className="font-bold text-slate-900">{currentEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search & Lookup Bar */}
        <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Look up order by email (e.g. pranavsinghkia@gmail.com), phone, or Order ID..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
            />
          </div>
          {searchFilter && (
            <button
              type="button"
              onClick={() => setSearchFilter('')}
              className="text-xs text-stone-500 hover:text-stone-800 underline font-semibold shrink-0"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Not Logged In Notice Banner */}
        {!isUserAuthenticated && !currentEmail && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <LogIn size={18} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                  Viewing in Guest Mode
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Sign in with your email (e.g. <strong>pranavsinghkia@gmail.com</strong>) to keep your orders synced, or use the lookup box above.
                </p>
              </div>
            </div>

            <Link
              href="/login?redirect=/orders"
              className="px-4 py-2 bg-[#0B1B30] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition whitespace-nowrap shadow-xs"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {/* Smooth Loading → Content Transition */}
        <AnimatePresence mode="wait">
          {!mounted || loading ? (
            <motion.div
              key="orders-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <OrderListSkeleton count={3} />
            </motion.div>
          ) : matchedOrders.length === 0 ? (
            <motion.div
              key="orders-empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: EASE.out }}
              className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 shadow-xs"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-5 border border-amber-100">
                <Package className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1.5">No Orders Found</h2>
              <p className="text-xs sm:text-sm text-stone-500 mb-6 max-w-md leading-relaxed">
                {searchFilter
                  ? `No orders matching "${searchFilter}". Please check the email, phone number, or Order ID.`
                  : currentEmail
                  ? `No previous orders found for ${currentEmail}. When you place an order, dispatch tracking will appear here.`
                  : 'Sign in to view your past orders, or search by your email above.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {!isUserAuthenticated && (
                  <Link
                    href="/login?redirect=/orders"
                    className="px-5 py-2.5 bg-[#0B1B30] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-xs"
                  >
                    Sign In
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  prefetch={true}
                  className="px-5 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 transition"
                >
                  Browse Seeds &amp; Fertilizers
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="orders-list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: EASE.out }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs font-bold text-stone-600 px-1">
                <span>
                  {matchedOrders.length} Order{matchedOrders.length !== 1 ? 's' : ''} Found
                </span>
                <span className="text-emerald-700 font-medium">● Live Tracking Connected</span>
              </div>

              {matchedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
