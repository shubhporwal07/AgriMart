'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, ArrowLeft, CheckCircle2, MapPin, Zap, ShieldCheck, ShoppingBag, Clock, Sparkles, Banknote, CreditCard, AlertTriangle, Truck, Tag, Percent, Check, AlertCircle, IndianRupee, BookmarkCheck, UserCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useLocationContext } from '../contexts/LocationContext';
import { useCoupons } from '../contexts/CouponContext';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import RazorpaySandboxModal from '../components/RazorpaySandboxModal';
import { auth, realtimeDb } from '../config/firebase';
import { ref as rtdbRef, push, set, get } from 'firebase/database';
import {
  backdropVariants,
  modalVariants,
  cartItemVariants,
  qtyNumberVariants,
  fieldMessageVariants,
  buttonTap,
  iconTap,
  DURATION,
  EASE,
} from '../utils/motion';

const getBackendUrl = () => {
  const raw = (
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_BACKEND_URL) ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : '')
  ).trim();
  if (!raw) return '';
  let url = raw;
  if (!/^https?:\/\//i.test(url)) {
    url = url.includes('localhost') ? `http://${url}` : `https://${url}`;
  }
  return url.replace(/\/+$/, '');
};

const BACKEND_URL = getBackendUrl();
const API_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '';

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, removeFromCart, updateCartQuantity, clearCart, storageHydrated } = useProducts();
  const {
    location: userLocation,
    isServiceable,
    setLocationModalOpen,
    primaryHub,
  } = useLocationContext();

  const [deliveryType, setDeliveryType] = useState('express'); // 'express' | 'standard'
  const [deliveryInstruction, setDeliveryInstruction] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'address'
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [sandboxOrderData, setSandboxOrderData] = useState(null);
  const [confirmedAmount, setConfirmedAmount] = useState(0);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);

  // Discount Coupons & Price Band State
  const { activeCoupons, validateCoupon } = useCoupons();
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [showCouponsList, setShowCouponsList] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    flatBuilding: '',
    addressLine1: userLocation?.name || 'Model Town',
    landmark: '',
    city: 'Phagwara',
    state: 'Punjab',
    pincode: '144401',
  });
  const [addressErrors, setAddressErrors] = useState({});

  // 1. Auto-fill saved address from localStorage and Firebase RTDB for logged-in user
  useEffect(() => {
    if (!user) {
      setHasSavedAddress(false);
      return;
    }

    let loaded = false;
    const localKey = `agrimart_saved_address_${user.uid}`;
    if (typeof window !== 'undefined') {
      const savedLocal = localStorage.getItem(localKey) || localStorage.getItem('agrimart_saved_address');
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (parsed && typeof parsed === 'object') {
            setShippingAddress((prev) => ({
              ...prev,
              ...parsed,
              fullName: parsed.fullName || prev.fullName || user.displayName || '',
              phone: parsed.phone || prev.phone || user.phoneNumber || '',
              addressLine1: parsed.addressLine1 || userLocation?.name || prev.addressLine1,
            }));
            setHasSavedAddress(true);
            loaded = true;
          }
        } catch (err) {
          console.warn('Failed parsing local address:', err);
        }
      }
    }

    // Also fetch from Firebase Realtime Database
    try {
      const userAddressRef = rtdbRef(realtimeDb, `users/${user.uid}/savedAddress`);
      get(userAddressRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setShippingAddress((prev) => ({
              ...prev,
              ...data,
              fullName: data.fullName || prev.fullName || user.displayName || '',
              phone: data.phone || prev.phone || user.phoneNumber || '',
              addressLine1: data.addressLine1 || userLocation?.name || prev.addressLine1,
            }));
            setHasSavedAddress(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem(localKey, JSON.stringify(data));
            }
          } else if (!loaded && (user.displayName || user.phoneNumber)) {
            setShippingAddress((prev) => ({
              ...prev,
              fullName: prev.fullName || user.displayName || '',
              phone: prev.phone || user.phoneNumber || '',
            }));
          }
        })
        .catch((e) => {
          console.warn('Firebase RTDB address read:', e.message);
        });
    } catch (e) {
      console.warn('RTDB address fetch error:', e);
    }
  }, [user]);

  // 1b. Auto-persist address to localStorage whenever user types valid address details
  useEffect(() => {
    if (user && shippingAddress.fullName && shippingAddress.phone && shippingAddress.addressLine1) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`agrimart_saved_address_${user.uid}`, JSON.stringify(shippingAddress));
        localStorage.setItem('agrimart_saved_address', JSON.stringify(shippingAddress));
      }
    }
  }, [user, shippingAddress]);

  // 2. Handle auto-recovery to address step when returning from login
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const stepParam = searchParams?.get('step');
      const pendingCheckout = sessionStorage.getItem('agrimart_pending_checkout');
      if (stepParam === 'address' || pendingCheckout === 'true') {
        sessionStorage.removeItem('agrimart_pending_checkout');
        setCheckoutStep('address');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [user, searchParams]);

  useEffect(() => {
    if (userLocation?.name && !hasSavedAddress) {
      setShippingAddress((prev) => ({
        ...prev,
        addressLine1: userLocation.name || prev.addressLine1,
      }));
    }
  }, [userLocation, hasSavedAddress]);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
  };

  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const mrpTotal = cartItems.reduce((sum, item) => sum + ((item.mrp || item.price * 1.2) * item.quantity), 0);
  const savings = Math.max(0, mrpTotal - itemTotal);
  const distanceKm = userLocation?.distanceKm ?? 0.5;
  const isExpressEligible = distanceKm <= 10.0;
  const activeDeliveryType = (!isExpressEligible && deliveryType === 'express') ? 'standard' : deliveryType;

  // Coupon Discount Calculation based on Price Band & Percentage
  let couponDiscountAmount = 0;
  if (appliedCoupon && itemTotal > 0) {
    if (itemTotal >= (appliedCoupon.minOrderValue || 0)) {
      couponDiscountAmount = Math.round((itemTotal * appliedCoupon.discountPercentage) / 100);
      if (appliedCoupon.maxDiscountAmount && couponDiscountAmount > appliedCoupon.maxDiscountAmount) {
        couponDiscountAmount = appliedCoupon.maxDiscountAmount;
      }
    }
  }

  // Automatic coupon invalidation check if cart subtotal drops below the coupon's price band
  useEffect(() => {
    if (appliedCoupon && itemTotal > 0 && itemTotal < (appliedCoupon.minOrderValue || 0)) {
      const removedCode = appliedCoupon.code;
      const minRequired = appliedCoupon.minOrderValue;
      setTimeout(() => {
        setAppliedCoupon(null);
        showToast(
          `Coupon ${removedCode} removed: Order subtotal fell below ₹${minRequired.toLocaleString('en-IN')}`,
          'info'
        );
      }, 0);
    }
  }, [itemTotal, appliedCoupon]);

  const handleApplyCoupon = (codeToApply) => {
    setCouponError('');
    const code = (codeToApply || couponCodeInput || '').trim();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const result = validateCoupon(code, itemTotal);
    if (!result.valid) {
      setCouponError(result.error);
      showToast(result.error, 'error');
      return;
    }

    setAppliedCoupon({
      ...result.coupon,
      discountAmount: result.discountAmount,
    });
    setCouponCodeInput('');
    setCouponError('');
    showToast(
      `🎉 Coupon "${result.coupon.code}" applied! You saved ₹${result.discountAmount.toLocaleString('en-IN')}`,
      'success'
    );
  };

  const handleRemoveCoupon = () => {
    if (appliedCoupon) {
      const prevCode = appliedCoupon.code;
      setAppliedCoupon(null);
      setCouponError('');
      showToast(`Coupon "${prevCode}" removed`, 'info');
    }
  };

  const calculateExpressFee = (km) => (km <= 5.0 ? 50 : km <= 7.5 ? 100 : 150);
  const expressFee = calculateExpressFee(distanceKm);

  // Standard fee: base is 0 if itemTotal >= 1000 else 20.
  // Plus distance surcharge if distance > 15 km (+₹50 per 10 km bracket beyond 15 km)
  const standardBaseFee = itemTotal >= 1000 ? 0 : 20;
  let standardDistanceSurcharge = 0;
  if (distanceKm > 15.0) {
    const extraKm = distanceKm - 15.0;
    const brackets = Math.ceil(extraKm / 10.0);
    standardDistanceSurcharge = brackets * 50;
  }
  const standardFee = standardBaseFee + standardDistanceSurcharge;

  const freeDeliveryThreshold = 1000;
  const deliveryFee = itemTotal === 0 ? 0 : (activeDeliveryType === 'express' ? expressFee : standardFee);
  const handlingFee = itemTotal > 0 ? 4 : 0; // Eco-friendly packaging charge
  const grandTotal = Math.max(0, itemTotal - couponDiscountAmount + deliveryFee + handlingFee);

  // Save order to Realtime Database
  const saveOrderToDatabase = async (paymentData) => {
    try {
      const ordersRef = rtdbRef(realtimeDb, 'orders');
      const newOrderRef = push(ordersRef);

      const isCOD = (paymentData.paymentMethod || paymentMethod) === 'cod' || String(paymentData.paymentMethod || '').includes('COD');

      const orderDoc = {
        userId: user?.uid || auth.currentUser?.uid || 'guest',
        userEmail: (user?.email || auth.currentUser?.email || shippingAddress.email || '').trim().toLowerCase(),
        userName: shippingAddress.fullName || user?.displayName || auth.currentUser?.displayName || 'Customer',
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          mrp: item.mrp || item.price,
          packSize: item.packSize || item.weight || '1 unit',
          quantity: item.quantity,
          imageUrl: item.imageUrl || item.imageData || '',
          category: item.category || 'groceries',
        })),
        razorpayOrderId: paymentData.razorpay_order_id || 'cod_order',
        razorpayPaymentId: paymentData.razorpay_payment_id || `COD-${Date.now()}`,
        paymentMethod: isCOD ? 'Cash on Delivery (COD)' : 'Online Payment (UPI/Card)',
        paymentStatus: isCOD ? 'Pending (Pay on Delivery)' : 'Paid',
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
        couponDiscount: couponDiscountAmount,
        discountPercentage: appliedCoupon ? appliedCoupon.discountPercentage : 0,
        amount: grandTotal,
        currency: 'INR',
        status: 'placed',
        deliverySlot: activeDeliveryType === 'express' ? 'Express Delivery (Fast Parcel Dispatch)' : 'Standard Delivery (Evening 8 PM Vehicle Dispatch)',
        deliveryType: activeDeliveryType,
        deliveryFee: deliveryFee,
        deliveryInstruction: deliveryInstruction || '',
        shippingAddress: shippingAddress,
        deliveryLocation: userLocation?.name || 'AgriMart Hub @ LPU',
        createdAt: new Date().toISOString(),
      };

      await set(newOrderRef, orderDoc);
      console.log('✅ AgriMart Order saved to Realtime DB:', newOrderRef.key);
      return newOrderRef.key;
    } catch (error) {
      console.error('Failed to save order to Database:', error);
      return null;
    }
  };

  const validateAddress = () => {
    const errors = {};
    if (!shippingAddress.fullName.trim()) errors.fullName = 'Full name is required';
    if (!shippingAddress.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) errors.phone = 'Enter valid 10-digit mobile number';
    if (!shippingAddress.addressLine1.trim()) errors.addressLine1 = 'Street & area are required';
    if (!shippingAddress.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) errors.pincode = 'Enter 6-digit pincode';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const persistUserAddress = async (address) => {
    if (!user) return;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`agrimart_saved_address_${user.uid}`, JSON.stringify(address));
        localStorage.setItem('agrimart_saved_address', JSON.stringify(address));
      }
      const userAddressRef = rtdbRef(realtimeDb, `users/${user.uid}/savedAddress`);
      await set(userAddressRef, {
        ...address,
        updatedAt: new Date().toISOString(),
      });
      setHasSavedAddress(true);
      console.log('✅ Shipping address saved to user profile');
    } catch (err) {
      console.warn('Failed saving address to Firebase RTDB:', err);
    }
  };

  const handleProceedToAddress = () => {
    // 1. Mandatory User Authentication Check
    if (!user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('agrimart_pending_checkout', 'true');
      }
      showToast('Please sign in to proceed with your farm delivery & checkout.', 'info');
      router.push('/login?redirect=/cart&step=address');
      return;
    }

    // 2. Serviceability Check
    if (!isServiceable) {
      setLocationModalOpen(true);
      showToast('Please select a delivery address within 30 km of AgriMart Hub @ LPU.', 'error');
      return;
    }

    setCheckoutStep('address');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayment = () => {
    if (!validateAddress()) return;
    persistUserAddress(shippingAddress);
    handleCheckout();
  };

  const handlePaymentSuccess = async (response) => {
    setPaymentLoading(true);
    try {
      let paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
      if (API_URL) {
        try {
          const verifyRes = await fetch(`${API_URL}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || '',
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.paymentId) paymentId = verifyData.paymentId;
        } catch (vErr) {
          console.warn('Backend payment verification fallback:', vErr);
        }
      }

      await saveOrderToDatabase(response);
      setConfirmedAmount(grandTotal);
      setPaidOrderId(paymentId);
      setPaymentSuccess(true);
      setSandboxModalOpen(false);
      setCheckoutStep('cart');
      if (clearCart) clearCart();
      showToast('Payment successful! Your certified farm inputs are scheduled for dispatch.', 'success');
    } catch (err) {
      console.error('Payment completion error:', err);
      showToast('Error completing order. Please contact AgriMart support.', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentFailure = (errorData) => {
    setPaymentLoading(false);
    showToast(errorData?.error?.description || 'Payment was cancelled or declined.', 'error');
  };

  const openLiveRazorpayPopup = async (orderId, amount, currency, key) => {
    try {
      setPaymentLoading(true);

      const customKey = typeof window !== 'undefined' ? localStorage.getItem('agrimart_custom_razorpay_key') : null;
      const activeKey = customKey || key || 'rzp_test_1DP5mmOlF5G5ag';
      const isDummyKey = !activeKey || activeKey === 'rzp_test_1DP5mmOlF5G5ag' || activeKey === 'rzp_test_agrimart';

      // If active key is the dummy placeholder, don't trigger the broken official popup that shows "No appropriate payment method found"
      if (isDummyKey) {
        setSandboxOrderData({
          orderId: orderId || 'order_agri_' + Date.now(),
          amount: amount || Math.round(grandTotal * 100),
          currency: currency || 'INR',
          key: activeKey,
          initialView: 'key_notice',
        });
        setSandboxModalOpen(true);
        setPaymentLoading(false);
        showToast('Official Razorpay requires your personal Test Key. Use AgriMart Sandbox or enter your key.', 'info');
        return;
      }

      if (typeof window !== 'undefined' && !window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error('Failed to load Razorpay payment SDK'));
          document.body.appendChild(script);
        });
      }

      // STRICT VALIDATION: Only pass order_id if it's an authentic Razorpay order ID (created via orders.create API, format order_XXXXXXXXXXXXXX)
      // Passing fake/local IDs like "order_agri_..." to Razorpay causes immediate 400 Bad Request / "No appropriate payment method found"
      const isOfficialOrderId = typeof orderId === 'string' && /^order_[a-zA-Z0-9]{12,}$/.test(orderId) && !orderId.startsWith('order_agri_');

      const options = {
        key: activeKey,
        amount: amount || Math.round(grandTotal * 100),
        currency: currency || 'INR',
        name: 'AGRIMART',
        description: 'Certified Seeds, Fertilizers & Farm Inputs',
        ...(isOfficialOrderId ? { order_id: orderId } : {}),
        handler: async function (response) {
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: shippingAddress.fullName || '',
          email: auth.currentUser?.email || 'kisan@agrimart.farm',
          contact: shippingAddress.phone || '',
        },
        theme: {
          color: '#142B4A',
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
            showToast('Official Razorpay modal closed. Switched to AgriMart Sandbox Gateway.', 'info');
            setSandboxModalOpen(true);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setPaymentLoading(false);
        showToast(`Payment failed: ${response.error?.description || 'Declined'}`, 'error');
        setSandboxModalOpen(true);
      });
      rzp.open();
    } catch (e) {
      console.error('Razorpay popup error:', e);
      setPaymentLoading(false);
      showToast('Switched to AgriMart Verified Sandbox Gateway.', 'info');
      setSandboxModalOpen(true);
    }
  };

  const handleCheckout = async () => {
    if (paymentLoading) return;
    setPaymentLoading(true);

    try {
      // 1. CASH ON DELIVERY (COD) ORDER PLACEMENT
      if (paymentMethod === 'cod') {
        const codOrderId = 'cod_agri_' + Date.now();
        await saveOrderToDatabase({
          razorpay_order_id: 'cod_' + Date.now(),
          razorpay_payment_id: codOrderId,
          paymentMethod: 'Cash on Delivery (COD)',
        });
        setConfirmedAmount(grandTotal);
        setPaidOrderId(codOrderId);
        setPaymentSuccess(true);
        if (clearCart) clearCart();
        setPaymentLoading(false);
        showToast('Cash on Delivery Order Placed Successfully! Pay on delivery.', 'success');
        return;
      }

      // 2. ONLINE PAYMENT FLOW
      if (!API_URL) {
        // Fallback to sandbox modal if backend server URL not configured
        setSandboxOrderData({
          orderId: 'order_agri_' + Date.now(),
          amount: Math.round(grandTotal * 100),
          currency: 'INR',
          key: 'rzp_test_agrimart',
        });
        setSandboxModalOpen(true);
        setPaymentLoading(false);
        return;
      }

      // Create order via Express backend
      const orderRes = await fetch(`${API_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          cartItems: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const { orderId, amount, currency, key, gatewayMode } = orderData;

      if (gatewayMode === 'razorpay_live') {
        // Real authenticated Razorpay account configured
        await openLiveRazorpayPopup(orderId, amount, currency, key);
      } else {
        // Open AgriMart Razorpay Sandbox Gateway
        setSandboxOrderData({ orderId, amount, currency, key });
        setSandboxModalOpen(true);
        setPaymentLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // Seamlessly open sandbox fallback if server encountered issues
      setSandboxOrderData({
        orderId: 'order_agri_' + Date.now(),
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        key: 'rzp_test_agrimart',
      });
      setSandboxModalOpen(true);
      setPaymentLoading(false);
    }
  };

  const formatPrice = (price) => {
    return '₹' + Math.round(price || 0).toLocaleString('en-IN');
  };

  // Payment success view
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF5EB]">
        <Navbar />
        <div className="flex items-center justify-center py-16 sm:py-24 px-4">
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: DURATION.normal, ease: EASE.out }}
            className="text-center bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 max-w-md w-full"
          >
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.24, ease: EASE.out }}
              className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9F43]/15 text-[#E27B12] text-xs font-bold uppercase tracking-wider mb-3">
              {activeDeliveryType === 'express' ? '⚡ Express Parcel Dispatch' : '🚚 Standard Route (8 PM Dispatch)'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] mb-2">Order Confirmed!</h2>
            <p className="text-slate-600 text-sm mb-4">
              Your certified inputs are being processed right now at AgriMart Kisan Hub @ LPU.
            </p>

            {/* Payment & Delivery Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl mb-6 text-left border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Delivery Speed:</span>
                <span className="font-extrabold text-[#142B4A]">
                  {activeDeliveryType === 'express'
                    ? `Express Dispatch (⚡ ${distanceKm} km radius)`
                    : `Standard Vehicle (🚚 Evening 8 PM Dispatch • ${distanceKm} km)`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Payment Mode:</span>
                <span className="font-extrabold text-[#142B4A] flex items-center gap-1">
                  {paymentMethod === 'cod' ? (
                    <>
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Cash on Delivery (COD)</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Paid Online</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">
                  {paymentMethod === 'cod' ? 'Amount to Pay on Delivery:' : 'Amount Paid:'}
                </span>
                <span className="font-black text-[#142B4A] text-sm">
                  {formatPrice(confirmedAmount || grandTotal)}
                </span>
              </div>
              {couponDiscountAmount > 0 && appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                  <span className="font-bold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon Savings ({appliedCoupon.code}):</span>
                  </span>
                  <span className="font-black text-emerald-700">− {formatPrice(couponDiscountAmount)} ({appliedCoupon.discountPercentage}% OFF)</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Deliver to:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">
                  {shippingAddress.addressLine1 || userLocation?.name || 'Phagwara'}, {shippingAddress.city}
                </span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="pt-2 border-t border-slate-200 text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-xl flex items-start gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Please keep {formatPrice(confirmedAmount || grandTotal)} cash or UPI QR scanner ready for our delivery partner.</span>
                </div>
              )}
            </div>

            {paidOrderId && (
              <div className="p-2.5 bg-slate-50 rounded-xl mb-6 text-[11px] font-mono text-slate-500">
                Order ID: {paidOrderId}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/orders')}
                className="w-full py-3.5 bg-[#142B4A] text-white rounded-xl hover:bg-[#0c1c30] transition font-bold text-sm shadow-md"
              >
                Track Live Order
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-bold text-sm"
              >
                Back to Shopping
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!storageHydrated) {
    return (
      <div className="min-h-screen bg-[#FAF5EB]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-28 text-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#142B4A] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#5A6B82]">Loading your farm basket...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF5EB]">
        <Navbar />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.normal, ease: EASE.out }}
          className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-[#FF9F43]/15 text-[#E27B12] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] mb-3">Your Farm Basket is Empty</h2>
          <p className="text-slate-600 text-sm sm:text-base mb-8 max-w-md mx-auto">
            You haven't added any certified hybrid seeds, fertilizers, or farm inputs to your basket yet.
          </p>
          <motion.button
            whileTap={buttonTap}
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF9F43] hover:bg-[#E27B12] text-slate-950 font-bold rounded-xl transition-all duration-150 shadow-lg shadow-[#FF9F43]/20"
          >
            <Zap className="w-4 h-4 fill-current" />
            Explore Certified Farm Inputs
          </motion.button>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5EB]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#142B4A] hover:text-[#FF9F43] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Zap className="w-3.5 h-3.5 fill-current" />
            AgriMart Direct Farm Dispatch Active
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Delivery Bar (Free Standard Delivery on ₹1,000+) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                {itemTotal >= 1000 ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> You unlocked FREE Standard Delivery!
                  </span>
                ) : (
                  <span className="text-slate-700">
                    Add <strong className="text-[#E27B12]">₹{1000 - itemTotal}</strong> more for FREE Standard Delivery
                  </span>
                )}
                <span className="text-slate-400 font-mono">₹{itemTotal} / ₹1,000</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF9F43] to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (itemTotal / 1000) * 100)}%` }}
                />
              </div>
            </div>

            {/* Delivery Option Selection */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#142B4A]">
                  <Truck className="w-4 h-4 text-[#FF9F43]" />
                  Select Delivery Mode
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Hub: {primaryHub?.name || 'AgriMart Kisan Hub @ LPU'} ({distanceKm} km away)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Express Delivery Option */}
                {isExpressEligible ? (
                  <button
                    type="button"
                    id="delivery-type-express-btn"
                    onClick={() => setDeliveryType('express')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                      activeDeliveryType === 'express'
                        ? 'border-[#FF9F43] bg-amber-50/40 ring-2 ring-[#FF9F43]/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#FF9F43]/15 text-[#E27B12] flex items-center justify-center font-black text-sm">
                          ⚡
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E27B12]">
                            Fast Dispatch (&le;10 km)
                          </span>
                          <h4 className="text-sm font-extrabold text-[#142B4A]">Express Delivery</h4>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#FF9F43] text-slate-950">
                        ₹{expressFee}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      Immediate parcel dispatch from AgriMart Hub @ LPU.
                      <span className="block text-[11px] text-slate-500 mt-1 font-medium">
                        {distanceKm <= 5.0
                          ? `₹50 extra (within 5 km radius • you: ${distanceKm} km)`
                          : distanceKm <= 7.5
                          ? `₹100 extra (5.1–7.5 km radius • you: ${distanceKm} km)`
                          : `₹150 extra (7.6–10 km radius • you: ${distanceKm} km)`}
                      </span>
                    </p>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/80 text-left relative flex flex-col justify-between opacity-75">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center font-black text-sm">
                          ⚡
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Express Delivery
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-500">Under 10 km Only</h4>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-500">
                        Unavailable
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">
                      Express delivery is limited to 10 km of LPU Hub. Address is {distanceKm} km away. Standard delivery auto-applied.
                    </p>
                  </div>
                )}

                {/* Standard Delivery Option */}
                <button
                  type="button"
                  id="delivery-type-standard-btn"
                  onClick={() => setDeliveryType('standard')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                    activeDeliveryType === 'standard'
                      ? 'border-[#142B4A] bg-[#142B4A]/5 ring-2 ring-[#142B4A]/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#142B4A] flex items-center justify-center font-black text-sm">
                        🚚
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Evening 8 PM Vehicle
                        </span>
                        <h4 className="text-sm font-extrabold text-[#142B4A]">Standard Delivery</h4>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                      itemTotal >= 1000 && standardDistanceSurcharge === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {itemTotal >= 1000 && standardDistanceSurcharge === 0 ? 'FREE' : `₹${standardFee}`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 leading-snug space-y-1">
                    <p>
                      {distanceKm > 15.0
                        ? `₹${standardDistanceSurcharge} distance surcharge applied (>15 km from LPU hub • ${distanceKm} km).`
                        : (itemTotal >= 1000 ? '🎉 FREE delivery unlocked (Order ≥ ₹1,000)' : '₹20 fee on orders under ₹1,000 (Free on ₹1,000+)')}
                    </p>
                    <div className="p-1.5 bg-amber-50 rounded-lg text-[11px] text-amber-900 font-semibold flex items-center gap-1">
                      <span>🚚</span>
                      <span>Dispatches daily at 8:00 PM. Order after 8 PM delivered tomorrow after 8 PM.</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Cart Items Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h1 className="text-xl font-extrabold text-[#142B4A] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#FF9F43]" />
                  Your Farm Basket
                  <span className="text-xs font-normal text-slate-500">({cartItems.length} items)</span>
                </h1>
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition"
                >
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout="position"
                      variants={cartItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="overflow-hidden"
                    >
                      <div className="py-4 flex items-center gap-4">
                        {/* Product Thumbnail */}
                        <div className="w-20 h-20 rounded-2xl bg-[#F7F9FC] border border-slate-100 overflow-hidden flex-shrink-0 relative">
                          <img
                            src={item.imageUrl || item.imageData || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {item.category?.replace('-', ' ') || 'Fresh'}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">{item.packSize || item.weight || '1 unit'}</span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[#142B4A] truncate">{item.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-base font-extrabold text-[#142B4A]">{formatPrice(item.price)}</span>
                            {item.mrp && item.mrp > item.price && (
                              <span className="text-xs text-slate-400 line-through">₹{item.mrp}</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-[#F7F9FC] border border-slate-200 rounded-xl overflow-hidden p-1">
                            <motion.button
                              type="button"
                              whileTap={iconTap}
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg transition-colors duration-150 font-bold"
                              aria-label="Decrease quantity"
                            >
                              −
                            </motion.button>
                            <div className="w-8 flex items-center justify-center overflow-hidden">
                              <AnimatePresence mode="popLayout" initial={false}>
                                <motion.span
                                  key={item.quantity}
                                  variants={qtyNumberVariants}
                                  initial="initial"
                                  animate="animate"
                                  exit="exit"
                                  className="text-center text-sm font-extrabold text-[#142B4A] inline-block"
                                >
                                  {item.quantity}
                                </motion.span>
                              </AnimatePresence>
                            </div>
                            <motion.button
                              type="button"
                              whileTap={iconTap}
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg transition-colors duration-150 font-bold"
                              aria-label="Increase quantity"
                            >
                              +
                            </motion.button>
                          </div>
                          <motion.button
                            type="button"
                            whileTap={iconTap}
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors duration-150 p-1 rounded-lg hover:bg-rose-50"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Delivery Note */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Delivery instructions (optional)
                </label>
                <input
                  type="text"
                  value={deliveryInstruction}
                  onChange={(e) => setDeliveryInstruction(e.target.value)}
                  placeholder="e.g. Leave with security guard, don't ring the bell..."
                  className="w-full px-4 py-2.5 bg-[#F7F9FC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                />
              </div>
            </div>
          </div>

          {/* Order Bill Summary & Coupons */}
          <div className="space-y-4 sticky top-24">
            {/* Coupons & Offers Section */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Percent className="w-4 h-4 text-[#FF9F43]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#142B4A]">Coupons &amp; Offers</h3>
                    <p className="text-[11px] text-slate-500">Apply promo code or price band discounts</p>
                  </div>
                </div>
                {activeCoupons.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCouponsList(!showCouponsList)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    {showCouponsList ? 'Hide Offers' : `View All (${activeCoupons.length})`}
                  </button>
                )}
              </div>

              {/* Coupon Input Box */}
              {!appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => {
                          setCouponCodeInput(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Enter coupon code (e.g. KISAN200)"
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-4 py-2 bg-[#142B4A] hover:bg-[#1D3E6B] text-white font-bold text-xs rounded-xl transition shadow-xs"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span className="leading-snug">{couponError}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Applied Coupon Pill */
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-emerald-950">{appliedCoupon.code}</span>
                        <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-800 px-1.5 py-0.2 rounded">
                          {appliedCoupon.discountPercentage}% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Saved {formatPrice(couponDiscountAmount)} on this order
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 underline px-1"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Available Coupons Dropdown / List */}
              <AnimatePresence>
                {showCouponsList && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 space-y-2 border-t border-slate-100 overflow-hidden"
                  >
                    {activeCoupons.map((coupon) => {
                      const isEligible = itemTotal >= (coupon.minOrderValue || 0);
                      const isCurrentlyApplied = appliedCoupon?.code === coupon.code;
                      const diff = (coupon.minOrderValue || 0) - itemTotal;

                      return (
                        <div
                          key={coupon.id}
                          className={`p-3 rounded-2xl border transition-all ${
                            isCurrentlyApplied
                              ? 'border-emerald-500 bg-emerald-50/50'
                              : isEligible
                              ? 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                              : 'border-slate-200/60 bg-slate-50/20 opacity-80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[#142B4A]">
                                  {coupon.code}
                                </span>
                                <span className="text-xs font-extrabold text-emerald-700">
                                  {coupon.discountPercentage}% OFF
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                                {coupon.description || `Valid on orders above ₹${(coupon.minOrderValue || 0).toLocaleString('en-IN')}`}
                              </p>
                              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                                <IndianRupee className="w-3 h-3 text-slate-400" />
                                <span>Price Band: Order &ge; ₹{(coupon.minOrderValue || 0).toLocaleString('en-IN')}</span>
                              </div>
                            </div>

                            {isCurrentlyApplied ? (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 shrink-0">
                                <Check className="w-3.5 h-3.5" /> Applied
                              </span>
                            ) : isEligible ? (
                              <button
                                type="button"
                                onClick={() => handleApplyCoupon(coupon.code)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shrink-0"
                              >
                                Apply
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                                Add ₹{diff.toLocaleString('en-IN')} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bill Details Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
              <h2 className="text-lg font-extrabold text-[#142B4A] pb-3 border-b border-slate-100">
                Bill Details
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Items Total (MRP)</span>
                  <span className="font-medium text-slate-800">{formatPrice(mrpTotal)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Product Discount</span>
                    <span>− {formatPrice(savings)}</span>
                  </div>
                )}

                {/* Applied Coupon Discount Line */}
                {appliedCoupon && couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-black">
                        {appliedCoupon.discountPercentage}% OFF
                      </span>
                    </span>
                    <span>− {formatPrice(couponDiscountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    Delivery Fee ({activeDeliveryType === 'express' ? `Express • ${distanceKm} km` : (distanceKm > 15.0 ? `Standard • ${distanceKm} km (+₹${standardDistanceSurcharge})` : 'Standard Route')})
                    {deliveryFee === 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        FREE
                      </span>
                    )}
                  </span>
                  <span className={deliveryFee === 0 ? 'text-emerald-600 font-bold' : 'text-slate-800 font-bold'}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Handling &amp; Eco Bag</span>
                  <span className="font-medium text-slate-800">{formatPrice(handlingFee)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-extrabold text-[#142B4A]">To Pay</span>
                    <p className="text-[11px] text-slate-400">Inclusive of all taxes</p>
                  </div>
                  <span className="text-2xl font-black text-[#142B4A]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {(savings + couponDiscountAmount) > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  Yay! You saved {formatPrice(savings + couponDiscountAmount)} on this certified farm input order.
                </div>
              )}

              {/* Serviceability Check for Checkout */}
              {!isServiceable ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Delivery Unavailable at Selected Location</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-snug">
                      AgriMart delivery is available up to 30 km from AgriMart Hub @ LPU. You currently have selected <strong>{userLocation?.name || 'Outside Area'}</strong> ({distanceKm} km away).
                    </p>
                  </div>

                  <button
                    onClick={() => setLocationModalOpen(true)}
                    className="w-full py-4 bg-[#142B4A] hover:bg-[#1B385D] text-white font-black rounded-2xl transition shadow-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <MapPin className="w-4 h-4 text-[#FF9F43]" />
                    Change to Serviceable Address (&le;30 km)
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleProceedToAddress}
                  disabled={paymentLoading}
                  className="w-full py-4 bg-[#FF9F43] hover:bg-[#E27B12] text-slate-950 font-black rounded-2xl transition shadow-lg shadow-[#FF9F43]/25 flex items-center justify-center gap-2 text-base"
                >
                  Proceed to Delivery &amp; Payment
                  <Zap className="w-4 h-4 fill-current" />
                </button>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-400 text-xs">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Safe Checkout
                </span>
                <span>•</span>
                <span>💵 Cash on Delivery Available</span>
                <span>•</span>
                <span>⚡ Express &amp; Standard Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Address & Payment Modal */}
      <AnimatePresence>
        {checkoutStep === 'address' && (
          <motion.div
            key="checkout-backdrop"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setCheckoutStep('cart')}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              key="checkout-dialog"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-5 bg-[#142B4A] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF9F43] text-slate-950 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Delivery &amp; Payment</h3>
                    <p className="text-xs text-slate-300">
                      {activeDeliveryType === 'express'
                        ? `⚡ Express Parcel Dispatch (${distanceKm} km radius from LPU Hub)`
                        : '🚚 Standard Farm Vehicle (Daily 8:00 PM Dispatch)'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutStep('cart')}
                  className="text-slate-300 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
                {/* Saved Address Status Indicator */}
                {hasSavedAddress && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-fadeIn">
                    <div className="flex items-center gap-2 font-bold">
                      <BookmarkCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Saved Delivery Address Loaded</span>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-200/60 px-2 py-0.5 rounded-full">
                      Saved in Profile
                    </span>
                  </div>
                )}

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Cash on Delivery (COD) */}
                    <button
                      type="button"
                      id="pay-method-cod-btn"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 text-left ${
                        paymentMethod === 'cod'
                          ? 'border-[#142B4A] bg-[#142B4A]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        id="radio-cod"
                        name="payMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 text-[#142B4A] focus:ring-[#142B4A]"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-[#142B4A]">Cash on Delivery</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            COD
                          </span>
                        </div>
                        <span className="text-[10px] text-[#5A6B82] mt-0.5 leading-snug">
                          Pay cash or UPI on doorstep. No advance payment.
                        </span>
                      </div>
                    </button>

                    {/* Online Payment */}
                    <button
                      type="button"
                      id="pay-method-online-btn"
                      onClick={() => setPaymentMethod('online')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 text-left ${
                        paymentMethod === 'online'
                          ? 'border-[#142B4A] bg-[#142B4A]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        id="radio-online"
                        name="payMethod"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                        className="mt-1 text-[#142B4A] focus:ring-[#142B4A]"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-[#142B4A]">Online Payment</span>
                          <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            UPI/Card
                          </span>
                        </div>
                        <span className="text-[10px] text-[#5A6B82] mt-0.5 leading-snug">
                          Pay instantly via UPI QR, Cards, or NetBanking.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#142B4A] ${addressErrors.fullName ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  />
                  <AnimatePresence>
                    {addressErrors.fullName && (
                      <motion.p variants={fieldMessageVariants} initial="initial" animate="animate" exit="exit" className="text-xs text-red-500 mt-1 overflow-hidden">
                        {addressErrors.fullName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (for delivery call &amp; OTP) *</label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#142B4A] ${addressErrors.phone ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  />
                  <AnimatePresence>
                    {addressErrors.phone && (
                      <motion.p variants={fieldMessageVariants} initial="initial" animate="animate" exit="exit" className="text-xs text-red-500 mt-1 overflow-hidden">
                        {addressErrors.phone}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">House / Flat / Landmark</label>
                  <input
                    type="text"
                    value={shippingAddress.flatBuilding}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, flatBuilding: e.target.value }))}
                    placeholder="e.g. House #14, Near Model Town Park"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address &amp; Area (Phagwara) *</label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                    placeholder="e.g. Model Town, Phagwara"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#142B4A] ${addressErrors.addressLine1 ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  />
                  <AnimatePresence>
                    {addressErrors.addressLine1 && (
                      <motion.p variants={fieldMessageVariants} initial="initial" animate="animate" exit="exit" className="text-xs text-red-500 mt-1 overflow-hidden">
                        {addressErrors.addressLine1}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="6-digit PIN"
                      maxLength={6}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#142B4A] ${addressErrors.pincode ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    />
                  </div>
                </div>

                {appliedCoupon && couponDiscountAmount > 0 && (
                  <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-between border border-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Coupon {appliedCoupon.code} Applied</span>
                    </span>
                    <span className="text-emerald-700">− {formatPrice(couponDiscountAmount)} ({appliedCoupon.discountPercentage}% OFF)</span>
                  </div>
                )}

                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 font-medium">
                  {activeDeliveryType === 'express' ? (
                    <>⚡ <strong>Express Parcel Dispatch:</strong> Immediate dispatch scheduled from AgriMart Hub @ LPU to <strong>{shippingAddress.addressLine1 || 'Phagwara'}, {shippingAddress.pincode}</strong> ({distanceKm} km radius).</>
                  ) : (
                    <>🚚 <strong>Standard Delivery:</strong> Dispatched via evening 8:00 PM farm vehicle from AgriMart Hub @ LPU to <strong>{shippingAddress.addressLine1 || 'Phagwara'}, {shippingAddress.pincode}</strong> ({distanceKm} km away{distanceKm > 15.0 ? ` • +₹${standardDistanceSurcharge} distance surcharge` : ''}).</>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <motion.button
                  type="button"
                  whileTap={buttonTap}
                  onClick={() => setCheckoutStep('cart')}
                  className="flex-1 py-3 px-4 border border-slate-300 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors duration-150"
                >
                  Back to Basket
                </motion.button>
                <motion.button
                  type="button"
                  id="pay-submit-btn"
                  whileTap={buttonTap}
                  onClick={handleProceedToPayment}
                  disabled={paymentLoading}
                  className="flex-1 py-3 px-4 bg-[#FF9F43] hover:bg-[#E27B12] text-slate-950 rounded-xl font-black text-sm transition-colors duration-150 shadow-md disabled:opacity-50"
                >
                  {paymentLoading
                    ? 'Placing Order...'
                    : paymentMethod === 'cod'
                    ? `Place COD Order • ${formatPrice(grandTotal)}`
                    : `Pay Online • ${formatPrice(grandTotal)}`}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AgriMart Certified Razorpay Test Sandbox Modal */}
      <RazorpaySandboxModal
        isOpen={sandboxModalOpen}
        onClose={() => {
          setSandboxModalOpen(false);
          setPaymentLoading(false);
        }}
        amount={sandboxOrderData?.amount || Math.round(grandTotal * 100)}
        orderId={sandboxOrderData?.orderId}
        customerName={shippingAddress.fullName || 'Kisan Farmer'}
        customerPhone={shippingAddress.phone || '9876543210'}
        customerEmail={auth.currentUser?.email || 'farmer@agrimart.farm'}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        currentKey={sandboxOrderData?.key}
        initialView={sandboxOrderData?.initialView || 'gateway'}
        onOpenLiveRazorpay={(customKey) => {
          setSandboxModalOpen(false);
          openLiveRazorpayPopup(
            sandboxOrderData?.orderId,
            sandboxOrderData?.amount,
            sandboxOrderData?.currency,
            customKey || sandboxOrderData?.key
          );
        }}
      />

      <Footer />
      <AnimatePresence>
        {toast.show && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        )}
      </AnimatePresence>
    </div>
  );
}
