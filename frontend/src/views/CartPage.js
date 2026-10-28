'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, ArrowLeft, CheckCircle2, MapPin, Zap, ShieldCheck, ShoppingBag, Clock, Sparkles, Banknote, CreditCard, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useProducts } from '../contexts/ProductContext';
import { useLocationContext } from '../contexts/LocationContext';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { auth, realtimeDb } from '../config/firebase';
import { ref as rtdbRef, push, set } from 'firebase/database';

const getBackendUrl = () => {
  const raw = (
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_BACKEND_URL) ||
    ''
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
  const { cartItems, removeFromCart, updateCartQuantity, clearCart } = useProducts();
  const {
    location: userLocation,
    isServiceable,
    setLocationModalOpen,
    primaryHub,
  } = useLocationContext();

  const [deliveryInstruction, setDeliveryInstruction] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('instant'); // 'instant' | 'morning' | 'evening'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'address'

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

  useEffect(() => {
    if (userLocation?.name) {
      setShippingAddress((prev) => ({
        ...prev,
        addressLine1: userLocation.name || prev.addressLine1,
      }));
    }
  }, [userLocation]);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
  };

  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const mrpTotal = cartItems.reduce((sum, item) => sum + ((item.mrp || item.price * 1.2) * item.quantity), 0);
  const savings = Math.max(0, mrpTotal - itemTotal);
  const freeDeliveryThreshold = 299;
  const deliveryFee = itemTotal >= freeDeliveryThreshold || itemTotal === 0 ? 0 : 25;
  const handlingFee = itemTotal > 0 ? 4 : 0; // Eco-friendly packaging charge
  const grandTotal = itemTotal + deliveryFee + handlingFee;

  // Save order to Realtime Database
  const saveOrderToDatabase = async (paymentData) => {
    try {
      const ordersRef = rtdbRef(realtimeDb, 'orders');
      const newOrderRef = push(ordersRef);

      const isCOD = (paymentData.paymentMethod || paymentMethod) === 'cod' || String(paymentData.paymentMethod || '').includes('COD');

      const orderDoc = {
        userId: auth.currentUser?.uid || 'guest',
        userEmail: auth.currentUser?.email || '',
        userName: shippingAddress.fullName || auth.currentUser?.displayName || 'Customer',
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
        amount: grandTotal,
        currency: 'INR',
        status: 'placed',
        deliverySlot: deliverySlot === 'instant' ? '12-15 Mins Express' : deliverySlot,
        deliveryInstruction: deliveryInstruction || '',
        shippingAddress: shippingAddress,
        deliveryLocation: userLocation?.name || 'Phagwara Hub',
        createdAt: new Date().toISOString(),
      };

      await set(newOrderRef, orderDoc);
      console.log('✅ Gupta Mart Order saved to Realtime DB:', newOrderRef.key);
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

  const handleProceedToAddress = () => {
    if (!isServiceable) {
      setLocationModalOpen(true);
      showToast('Please select a delivery address within 10 km of Phagwara hub.', 'error');
      return;
    }
    setCheckoutStep('address');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayment = () => {
    if (!validateAddress()) return;
    handleCheckout();
  };

  const handleCheckout = async () => {
    if (paymentLoading) return;
    setPaymentLoading(true);

    try {
      // 1. CASH ON DELIVERY (COD) ORDER PLACEMENT
      if (paymentMethod === 'cod') {
        const codOrderId = 'cod_gm_' + Date.now();
        await saveOrderToDatabase({
          razorpay_order_id: 'cod_' + Date.now(),
          razorpay_payment_id: codOrderId,
          paymentMethod: 'Cash on Delivery (COD)',
        });
        setPaidOrderId(codOrderId);
        setPaymentSuccess(true);
        if (clearCart) clearCart();
        setPaymentLoading(false);
        showToast('Cash on Delivery Order Placed Successfully! Pay on delivery.', 'success');
        return;
      }

      // 2. ONLINE PAYMENT FLOW
      if (!API_URL) {
        // Fallback demo order flow if backend server is not running
        const demoPaymentId = 'pay_gmart_' + Math.random().toString(36).substring(2, 9);
        await saveOrderToDatabase({
          razorpay_order_id: 'order_gmart_' + Date.now(),
          razorpay_payment_id: demoPaymentId,
          paymentMethod: 'Online Payment (Demo)',
        });
        setPaidOrderId(demoPaymentId);
        setPaymentSuccess(true);
        if (clearCart) clearCart();
        setPaymentLoading(false);
        return;
      }

      // 1. Create Razorpay order via Express backend
      const orderRes = await fetch(`${API_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          cartItems: cartItems.map(item => ({
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

      const { orderId, amount, currency, key } = orderData;

      // 2. Open Razorpay payment popup
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "AGRIMART",
        description: 'Certified Seeds, Fertilizers & Farm Inputs',
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_URL}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              await saveOrderToDatabase(response);
              setPaidOrderId(verifyData.paymentId);
              setPaymentSuccess(true);
              if (clearCart) clearCart();
              showToast('Payment successful! Your certified farm inputs are scheduled for dispatch.', 'success');
            } else {
              showToast('Payment verification failed. Please contact AgriMart support.', 'error');
            }
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            showToast('Payment verification failed. Please contact AgriMart support.', 'error');
          }
          setPaymentLoading(false);
        },
        prefill: {
          name: shippingAddress.fullName || '',
          email: auth.currentUser?.email || '',
          contact: shippingAddress.phone || '',
        },
        theme: {
          color: '#142B4A',
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
            showToast('Payment was cancelled.', 'info');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setPaymentLoading(false);
        showToast(`Payment failed: ${response.error.description}`, 'error');
      });
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      // If backend is unavailable, gracefully allow demo fulfillment so user can test UI
      const demoPaymentId = 'pay_gmart_' + Math.random().toString(36).substring(2, 9);
      await saveOrderToDatabase({
        razorpay_order_id: 'order_gmart_' + Date.now(),
        razorpay_payment_id: demoPaymentId,
      });
      setPaidOrderId(demoPaymentId);
      setPaymentSuccess(true);
      if (clearCart) clearCart();
      setPaymentLoading(false);
    }
  };

  const formatPrice = (price) => {
    return '₹' + Math.round(price || 0).toLocaleString('en-IN');
  };

  // Payment success view
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <Navbar />
        <div className="flex items-center justify-center py-16 sm:py-24 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 max-w-md w-full"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9F43]/15 text-[#E27B12] text-xs font-bold uppercase tracking-wider mb-3">
              ⚡ 12-Minute Express Delivery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] mb-2">Order Confirmed!</h2>
            <p className="text-slate-600 text-sm mb-4">
              Your harvest is being handpicked right now at the Gupta Mart Phagwara dark store.
            </p>

            {/* Payment & Delivery Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl mb-6 text-left border border-slate-100 space-y-2">
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
                <span className="text-slate-500 font-semibold">Amount to Pay:</span>
                <span className="font-black text-[#142B4A] text-sm">{formatPrice(grandTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Deliver to:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">
                  {shippingAddress.addressLine1 || userLocation?.name || 'Phagwara'}, {shippingAddress.city}
                </span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="pt-2 border-t border-slate-200 text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-xl flex items-start gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Please keep {formatPrice(grandTotal)} cash or UPI QR scanner ready for our delivery partner.</span>
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="w-24 h-24 rounded-full bg-[#FF9F43]/15 text-[#E27B12] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] mb-3">Your Farm Basket is Empty</h2>
          <p className="text-slate-600 text-sm sm:text-base mb-8 max-w-md mx-auto">
            You haven't added any certified hybrid seeds, fertilizers, or farm inputs to your basket yet.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF9F43] hover:bg-[#E27B12] text-slate-950 font-bold rounded-xl transition shadow-lg shadow-[#FF9F43]/20"
          >
            <Zap className="w-4 h-4 fill-current" />
            Explore Certified Farm Inputs
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
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
            {/* Free Delivery Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                {itemTotal >= freeDeliveryThreshold ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> You unlocked FREE Express Delivery!
                  </span>
                ) : (
                  <span className="text-slate-700">
                    Add <strong className="text-[#E27B12]">₹{freeDeliveryThreshold - itemTotal}</strong> more for FREE Express Delivery
                  </span>
                )}
                <span className="text-slate-400 font-mono">₹{itemTotal} / ₹{freeDeliveryThreshold}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF9F43] to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (itemTotal / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Delivery Slot Selection */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-[#142B4A] mb-3">
                <Clock className="w-4 h-4 text-[#FF9F43]" />
                Select Preferred Delivery Window
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'instant', label: 'Express Delivery', time: '⚡ 12-15 Mins' },
                  { id: 'morning', label: 'Tomorrow Morning', time: '7:00 AM - 9:00 AM' },
                  { id: 'evening', label: 'Tomorrow Evening', time: '5:00 PM - 7:00 PM' },
                ].map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setDeliverySlot(slot.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      deliverySlot === slot.id
                        ? 'border-[#142B4A] bg-[#142B4A]/5 ring-2 ring-[#142B4A]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-500">{slot.label}</span>
                    <span className="text-sm font-bold text-[#142B4A] mt-1">{slot.time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Items Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h1 className="text-xl font-extrabold text-[#142B4A] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#FF9F43]" />
                  Your Grocery Basket
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
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="py-4 flex items-center gap-4"
                    >
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
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg transition font-bold"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-extrabold text-[#142B4A]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg transition font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

          {/* Order Bill Summary */}
          <div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24 space-y-5">
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

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    Delivery Partner Fee
                    {deliveryFee === 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        FREE
                      </span>
                    )}
                  </span>
                  <span className={deliveryFee === 0 ? 'text-emerald-600 font-bold' : 'text-slate-800'}>
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

              {savings > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  Yay! You saved {formatPrice(savings)} on this farm input order.
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
                      Gupta Mart 12-min delivery is only available within 10 km of our Phagwara Dark Pod. You currently have selected <strong>{userLocation?.name || 'Outside Area'}</strong>.
                    </p>
                  </div>

                  <button
                    onClick={() => setLocationModalOpen(true)}
                    className="w-full py-4 bg-[#142B4A] hover:bg-[#1B385D] text-white font-black rounded-2xl transition shadow-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <MapPin className="w-4 h-4 text-[#FF9F43]" />
                    Change to Phagwara Address
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
                <span>⚡ 10-15 Min Phagwara Pod</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Address & Payment Modal */}
      <AnimatePresence>
        {checkoutStep === 'address' && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-5 bg-[#142B4A] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF9F43] text-slate-950 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Delivery &amp; Payment</h3>
                    <p className="text-xs text-slate-300">Delivering in 12-15 mins from Phagwara Hub</p>
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutStep('cart')}
                  className="text-slate-300 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Cash on Delivery (COD) */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                        paymentMethod === 'cod'
                          ? 'border-[#142B4A] bg-[#142B4A]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
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
                    </div>

                    {/* Online Payment */}
                    <div
                      onClick={() => setPaymentMethod('online')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                        paymentMethod === 'online'
                          ? 'border-[#142B4A] bg-[#142B4A]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
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
                    </div>
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
                  {addressErrors.fullName && <p className="text-xs text-red-500 mt-1">{addressErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (for delivery call &amp; OTP) *</label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#142B4A] ${addressErrors.phone ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  />
                  {addressErrors.phone && <p className="text-xs text-red-500 mt-1">{addressErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">House / Flat / Landmark</label>
                  <input
                    type="text"
                    value={shippingAddress.flatBuilding}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, flatBuilding: e.target.value }))}
                    placeholder="e.g. House #14, Near Model Town Park"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address &amp; Area (Phagwara) *</label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                    placeholder="e.g. Model Town, Phagwara"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#142B4A] ${addressErrors.addressLine1 ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  />
                  {addressErrors.addressLine1 && <p className="text-xs text-red-500 mt-1">{addressErrors.addressLine1}</p>}
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

                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 font-medium">
                  ⚡ Gupta Mart Express Pod delivers to <strong>{shippingAddress.addressLine1 || 'Phagwara'}, {shippingAddress.pincode}</strong> within 12-15 minutes.
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setCheckoutStep('cart')}
                  className="flex-1 py-3 px-4 border border-slate-300 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-100"
                >
                  Back to Basket
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={paymentLoading}
                  className="flex-1 py-3 px-4 bg-[#FF9F43] hover:bg-[#E27B12] text-slate-950 rounded-xl font-black text-sm transition shadow-md disabled:opacity-50"
                >
                  {paymentLoading
                    ? 'Placing Order...'
                    : paymentMethod === 'cod'
                    ? `Place COD Order • ${formatPrice(grandTotal)}`
                    : `Pay Online • ${formatPrice(grandTotal)}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </div>
  );
}
