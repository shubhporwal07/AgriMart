'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Key,
  Info,
  Check,
} from 'lucide-react';

export default function RazorpaySandboxModal({
  isOpen,
  onClose,
  amount, // in paise
  orderId,
  customerName = 'Customer',
  customerPhone = '9876543210',
  customerEmail = 'customer@agrimart.farm',
  onSuccess,
  onFailure,
  onOpenLiveRazorpay,
  currentKey = 'rzp_test_1DP5mmOlF5G5ag',
  initialView = 'gateway',
}) {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('farmer@okhdfcbank');
  const [cardData, setCardData] = useState({
    number: '4111 1111 1111 1111',
    holder: customerName || 'Kisan Farmer',
    expiry: '12/28',
    cvv: '123',
  });

  // Key Configuration State
  const [view, setView] = useState('gateway'); // 'gateway' | 'key_config'
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keySavedMessage, setKeySavedMessage] = useState('');
  const [keyErrorMessage, setKeyErrorMessage] = useState('');

  const displayAmount = Math.round((amount || 0) / 100);

  useEffect(() => {
    if (customerName) {
      setCardData((prev) => ({ ...prev, holder: customerName }));
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agrimart_custom_razorpay_key');
      if (stored) setCustomKeyInput(stored);
    }
  }, [customerName]);

  useEffect(() => {
    if (initialView === 'key_notice') {
      setView('key_config');
    } else {
      setView('gateway');
    }
  }, [initialView, isOpen]);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setProcessingStep(1);

    setTimeout(() => {
      setProcessingStep(2);
    }, 600);

    setTimeout(() => {
      setProcessingStep(3);
    }, 1200);

    setTimeout(() => {
      setIsProcessing(false);
      const mockPaymentId = 'pay_' + Math.random().toString(36).substring(2, 11);
      const mockSignature = 'sig_' + Math.random().toString(36).substring(2, 16);
      if (onSuccess) {
        onSuccess({
          razorpay_payment_id: mockPaymentId,
          razorpay_order_id: orderId || 'order_mock_' + Date.now(),
          razorpay_signature: mockSignature,
          method: activeTab,
        });
      }
    }, 1600);
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (onFailure) {
        onFailure({
          error: {
            code: 'BAD_REQUEST_ERROR',
            description: 'Payment was declined by issuing bank (Simulated Test Decline)',
          },
        });
      }
    }, 800);
  };

  const handleSaveCustomKey = async (e) => {
    e.preventDefault();
    const trimmed = customKeyInput.trim();
    if (!trimmed || !trimmed.startsWith('rzp_')) {
      setKeyErrorMessage('Please enter a valid Razorpay Key ID starting with "rzp_test_" or "rzp_live_"');
      return;
    }
    setKeyErrorMessage('');

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('agrimart_custom_razorpay_key', trimmed);
      }
      // Update backend if reachable
      try {
        await fetch('http://localhost:5000/api/set-razorpay-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyId: trimmed }),
        });
      } catch (err) {
        console.warn('Backend key update notification failed:', err);
      }

      setKeySavedMessage('Key saved successfully!');
      setTimeout(() => setKeySavedMessage(''), 3000);

      // Launch official popup with new key if requested
      if (onOpenLiveRazorpay) {
        onOpenLiveRazorpay(trimmed);
      }
    } catch (err) {
      console.error('Failed to save key:', err);
    }
  };

  const handleClearCustomKey = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agrimart_custom_razorpay_key');
    }
    setCustomKeyInput('');
    setKeySavedMessage('Reverted to default test mode.');
    setTimeout(() => setKeySavedMessage(''), 3000);
  };

  const hasCustomKey = Boolean(customKeyInput && customKeyInput.startsWith('rzp_') && customKeyInput !== 'rzp_test_1DP5mmOlF5G5ag');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-[#142B4A] text-white p-5 flex items-start justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#FF9F43]/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0C2340] to-[#1E3A8A] border border-blue-400/30 flex items-center justify-center shadow-md">
                <span className="font-extrabold text-[#FF9F43] text-lg tracking-wider">₹</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-white">AGRIMART</h3>
                  <span className="bg-[#FF9F43] text-[#142B4A] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {view === 'key_config' ? 'API Setup' : 'Razorpay Sandbox'}
                  </span>
                </div>
                <p className="text-xs text-blue-200/80">Certified Seeds &amp; Farm Inputs Checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="text-right">
                <div className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Price Summary</div>
                <div className="text-xl font-black text-[#FF9F43]">₹{displayAmount.toLocaleString('en-IN')}</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors ml-2 disabled:opacity-40"
                aria-label="Close payment modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User & Contact Bar */}
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>Paying as: <strong>{customerPhone}</strong> ({customerName})</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit Test Sandbox</span>
            </div>
          </div>

          {/* KEY CONFIGURATION / NOTICE VIEW */}
          {view === 'key_config' && (
            <div className="p-6 overflow-y-auto no-scrollbar space-y-5 animate-fadeIn">
              {/* Notice Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 space-y-1">
                  <h4 className="font-extrabold text-amber-900 text-sm">
                    Why did Razorpay say &ldquo;No appropriate payment method found&rdquo;?
                  </h4>
                  <p className="leading-relaxed text-amber-800">
                    Razorpay&rsquo;s official checkout popup (<code>checkout.js</code>) requires an active merchant account.
                    The public demo key (<code>rzp_test_1DP5...</code>) has no active payment methods enabled on Razorpay&rsquo;s servers, causing Razorpay to display that error.
                  </p>
                </div>
              </div>

              {/* Two Options Card */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Option 1 (Recommended - Ready Now)
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Zero Setup
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Use AgriMart Interactive Sandbox Gateway
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Test full checkout with interactive UPI apps (GPay, PhonePe, Paytm, QR Code scan), Cards (Visa, Mastercard, RuPay), and Netbanking with authentic database order generation!
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('gateway')}
                    className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Use AgriMart Sandbox Gateway</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#142B4A] tracking-wider flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-[#FF9F43]" /> Option 2 (For Real Razorpay Keys)
                    </span>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      Official Popup
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Enter Your Own Razorpay Test Key ID
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Get your free Key ID from <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">dashboard.razorpay.com</a> in <strong>Test Mode</strong> and paste it below:
                  </p>

                  <form onSubmit={handleSaveCustomKey} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customKeyInput}
                        onChange={(e) => {
                          setCustomKeyInput(e.target.value);
                          if (keyErrorMessage) setKeyErrorMessage('');
                        }}
                        placeholder="rzp_test_XXXXXXXXXXXXXXXX"
                        className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#142B4A] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition whitespace-nowrap"
                      >
                        Launch Popup
                      </button>
                    </div>
                    {keyErrorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 font-medium flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{keyErrorMessage}</span>
                      </motion.div>
                    )}
                    {hasCustomKey && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Custom Key Active
                        </span>
                        <button
                          type="button"
                          onClick={handleClearCustomKey}
                          className="text-[11px] text-rose-600 hover:underline"
                        >
                          Clear &amp; Reset Key
                        </button>
                      </div>
                    )}
                    {keySavedMessage && (
                      <p className="text-[11px] text-emerald-600 font-semibold">{keySavedMessage}</p>
                    )}
                  </form>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setView('gateway')}
                className="w-full py-2.5 text-center text-xs text-slate-500 hover:text-slate-800 font-semibold transition"
              >
                &larr; Back to AgriMart Payment Methods
              </button>
            </div>
          )}

          {/* MAIN INTERACTIVE GATEWAY VIEW */}
          {view === 'gateway' && (
            <>
              {/* Processing Screen */}
              {isProcessing ? (
                <div className="p-8 flex flex-col items-center justify-center space-y-6 text-center my-auto min-h-[340px]">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#FF9F43] animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-[#142B4A]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base text-[#142B4A]">
                      {processingStep === 1 && 'Authorizing Payment Token...'}
                      {processingStep === 2 && 'Connecting to Kisan Bank Gateway...'}
                      {processingStep === 3 && 'Confirming Certified Order Dispatch...'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Simulated 256-Bit SSL Encrypted Verification • Do not close
                    </p>
                  </div>

                  <div className="w-48 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(processingStep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Payment Method Selector Tabs */}
                  <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => setActiveTab('upi')}
                      className={`py-3 px-2 text-xs font-extrabold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                        activeTab === 'upi'
                          ? 'border-[#FF9F43] text-[#142B4A] bg-white shadow-xs'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-[#FF9F43]" />
                      <span>UPI &amp; QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('card')}
                      className={`py-3 px-2 text-xs font-extrabold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                        activeTab === 'card'
                          ? 'border-[#FF9F43] text-[#142B4A] bg-white shadow-xs'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#FF9F43]" />
                      <span>Cards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('netbanking')}
                      className={`py-3 px-2 text-xs font-extrabold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                        activeTab === 'netbanking'
                          ? 'border-[#FF9F43] text-[#142B4A] bg-white shadow-xs'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#FF9F43]" />
                      <span>NetBanking</span>
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="p-6 overflow-y-auto no-scrollbar max-h-[380px] space-y-4">
                    {/* 1. UPI TAB */}
                    {activeTab === 'upi' && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* Interactive QR Code Simulator */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex flex-col items-center justify-center shrink-0 relative group">
                            {/* Stylized QR Code Representation */}
                            <div className="w-full h-full grid grid-cols-5 gap-1 p-1 bg-slate-900 rounded-lg">
                              <div className="bg-white rounded-xs col-span-2 row-span-2" />
                              <div className="bg-white rounded-xs" />
                              <div className="bg-white rounded-xs col-span-2 row-span-2" />
                              <div className="bg-white rounded-xs" />
                              <div className="bg-white rounded-xs" />
                              <div className="bg-white rounded-xs col-span-2 row-span-2" />
                              <div className="bg-white rounded-xs" />
                              <div className="bg-white rounded-xs" />
                              <div className="bg-[#FF9F43] rounded-xs col-span-2 row-span-2" />
                            </div>
                            <span className="text-[9px] font-black text-slate-600 mt-1 uppercase tracking-wider">
                              Scan &amp; Pay
                            </span>
                          </div>

                          <div className="space-y-1 text-center sm:text-left">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Instant UPI QR Active
                            </div>
                            <h4 className="text-xs font-black text-[#142B4A]">
                              Scan with Any UPI App
                            </h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              GPay, PhonePe, Paytm, BHIM, CRED or your mobile banking app.
                            </p>
                          </div>
                        </div>

                        {/* UPI App Selection */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">
                            Or Choose UPI App
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: 'gpay', name: 'Google Pay', icon: '🌐' },
                              { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                              { id: 'paytm', name: 'Paytm', icon: '🔷' },
                              { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳' },
                            ].map((app) => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => setSelectedUpiApp(app.id)}
                                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                                  selectedUpiApp === app.id
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                                }`}
                              >
                                <span className="text-xl">{app.icon}</span>
                                <span className="text-[10px] font-semibold">{app.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom UPI ID */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            UPI ID / VPA
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="mobile@okhdfcbank"
                              className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                            />
                            <button
                              type="button"
                              onClick={handleSimulatePayment}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                            >
                              Verify &amp; Pay
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. CARD TAB */}
                    {activeTab === 'card' && (
                      <div className="space-y-3.5 animate-fadeIn">
                        {/* Quick Card Presets */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 overflow-x-auto pb-1">
                          <span className="font-bold shrink-0">Test Cards:</span>
                          <button
                            type="button"
                            onClick={() =>
                              setCardData((prev) => ({ ...prev, number: '4111 1111 1111 1111' }))
                            }
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold shrink-0"
                          >
                            Visa
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCardData((prev) => ({ ...prev, number: '5123 4567 8901 2345' }))
                            }
                            className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold shrink-0"
                          >
                            Mastercard
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCardData((prev) => ({ ...prev, number: '6071 2345 6789 0123' }))
                            }
                            className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shrink-0"
                          >
                            RuPay (Kisan Card)
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={cardData.number}
                            onChange={(e) =>
                              setCardData((prev) => ({ ...prev, number: e.target.value }))
                            }
                            placeholder="4111 1111 1111 1111"
                            className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardData.holder}
                            onChange={(e) =>
                              setCardData((prev) => ({ ...prev, holder: e.target.value }))
                            }
                            placeholder="Kisan Farmer"
                            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Expiry (MM/YY)
                            </label>
                            <input
                              type="text"
                              value={cardData.expiry}
                              onChange={(e) =>
                                setCardData((prev) => ({ ...prev, expiry: e.target.value }))
                              }
                              placeholder="12/28"
                              className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardData.cvv}
                              onChange={(e) =>
                                setCardData((prev) => ({ ...prev, cvv: e.target.value }))
                              }
                              placeholder="123"
                              className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. NETBANKING TAB */}
                    {activeTab === 'netbanking' && (
                      <div className="space-y-4 animate-fadeIn">
                        <label className="block text-xs font-bold text-slate-700">Select Your Bank</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'SBI', name: 'State Bank of India', tag: 'SBI' },
                            { id: 'HDFC', name: 'HDFC Bank', tag: 'HDFC' },
                            { id: 'ICICI', name: 'ICICI Bank', tag: 'ICICI' },
                            { id: 'PNB', name: 'Punjab National Bank', tag: 'PNB' },
                            { id: 'AXIS', name: 'Axis Bank', tag: 'AXIS' },
                            { id: 'BOB', name: 'Bank of Baroda', tag: 'BOB' },
                          ].map((bank) => (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() => setSelectedBank(bank.id)}
                              className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all ${
                                selectedBank === bank.id
                                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                              }`}
                            >
                              <span className="font-extrabold text-xs text-[#142B4A]">{bank.tag}</span>
                              <span className="text-[10px] text-slate-500 font-medium line-clamp-1">{bank.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3">
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      className="w-full py-3.5 bg-[#FF9F43] hover:bg-[#E27B12] text-slate-950 font-black rounded-2xl transition shadow-lg shadow-[#FF9F43]/20 flex items-center justify-center gap-2 text-sm"
                    >
                      <Lock className="w-4 h-4 text-slate-950" />
                      <span>
                        Pay ₹{displayAmount.toLocaleString('en-IN')} via{' '}
                        {activeTab === 'upi' ? 'UPI' : activeTab === 'card' ? 'Card' : selectedBank}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </button>

                    {/* Testing Helpers */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={handleSimulateFailure}
                        className="text-rose-600 hover:text-rose-700 font-semibold underline"
                      >
                        Simulate Payment Decline
                      </button>

                      <button
                        type="button"
                        onClick={() => setView('key_config')}
                        className="text-[#142B4A] hover:text-blue-700 font-bold flex items-center gap-1.5"
                      >
                        <Key className="w-3.5 h-3.5 text-[#FF9F43]" />
                        <span>Official Razorpay &amp; Key Info</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
