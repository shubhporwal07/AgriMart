'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Copy,
  Check,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Printer,
  Sprout,
  Layers,
  Droplets,
  Building,
  Award,
  ArrowLeft,
  ExternalLink,
  Package,
  Heart,
  Sparkles,
  FileText,
  BadgeCheck,
  HelpCircle,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useLocationContext } from '../contexts/LocationContext';
import { useProducts } from '../contexts/ProductContext';
import { buttonTap, EASE } from '../utils/motion';
import { db, realtimeDb } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref as rtdbRef, get, set as rtdbSet } from 'firebase/database';

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { location: userLocation, isServiceable, hubDistance } = useLocationContext();
  const { cartCount, wishlistCount } = useProducts();

  const [isEditing, setIsEditing] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [saving, setSaving] = useState(false);

  // Compute storage key
  const profileStorageKey = useMemo(() => {
    return user?.uid ? `agrimart_kisan_profile_${user.uid}` : 'agrimart_kisan_profile_guest';
  }, [user]);

  // Default initial profile data
  const defaultProfile = useMemo(() => {
    const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Shubh Porwal');
    const email = user?.email || 'shubhporwal83@gmail.com';
    const numHash = hashString(email || 'shubh');
    const suffix = String(numHash % 9000 + 1000);

    return {
      fullName: displayName,
      kisanId: `KISAN-PB-2024-${suffix}`,
      aadhaarNumber: '5849 2038 9142',
      phone: '9876543210',
      alternatePhone: '9876543211',
      email: email,
      gender: 'Male',
      age: '34',
      landSize: '12.5 Acres',
      ownershipType: 'Self-Owned (Ancestral Land)',
      primaryCrops: 'Basmati Rice (1121), Sharbati Wheat, Mustard, Vegetables',
      soilType: 'Alluvial Loam (pH 7.2)',
      irrigationSource: 'Solar Submersible Tubewell + Drip System',
      fpoName: 'Doaba Kisan Producer Organization (DKPO)',
      kccStatus: 'Active (Punjab National Bank)',
      farmAddress: 'Farm No. 14, Near GT Road / Canal Bridge',
      village: 'Model Town / LPU Rural Perimeter',
      city: 'Phagwara',
      district: 'Kapurthala',
      state: 'Punjab',
      pincode: '144401',
      deliveryDirections: 'Near Primary School water tank, accessible by tractor & delivery tempo',
      memberSince: 'October 2023',
      tier: 'AgriMart Gold Kisan',
    };
  }, [user]);

  const [profile, setProfile] = useState(defaultProfile);
  const [editFormData, setEditFormData] = useState(defaultProfile);

  // Load profile from localStorage and Firestore / RTDB
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let loadedProfile = null;
    try {
      const localData = localStorage.getItem(profileStorageKey);
      if (localData) {
        loadedProfile = JSON.parse(localData);
      } else {
        // Fallback: check legacy saved address from cart
        const savedAddress = localStorage.getItem(`agrimart_saved_address_${user?.uid}`) || localStorage.getItem('agrimart_saved_address');
        if (savedAddress) {
          const parsedAddr = JSON.parse(savedAddress);
          loadedProfile = {
            ...defaultProfile,
            fullName: parsedAddr.fullName || defaultProfile.fullName,
            phone: parsedAddr.phone || defaultProfile.phone,
            farmAddress: parsedAddr.addressLine1 || defaultProfile.farmAddress,
            city: parsedAddr.city || defaultProfile.city,
            pincode: parsedAddr.pincode || defaultProfile.pincode,
          };
        }
      }
    } catch (err) {
      console.warn('Failed to parse local profile:', err);
    }

    if (loadedProfile) {
      setProfile((prev) => ({ ...prev, ...loadedProfile }));
      setEditFormData((prev) => ({ ...prev, ...loadedProfile }));
    } else {
      setProfile(defaultProfile);
      setEditFormData(defaultProfile);
    }

    // Attempt Firebase fetch if logged in
    if (user?.uid) {
      const fetchFirebaseProfile = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists() && snap.data().kisanProfile) {
            const remote = snap.data().kisanProfile;
            setProfile((prev) => ({ ...prev, ...remote }));
            setEditFormData((prev) => ({ ...prev, ...remote }));
          }
        } catch {
          // ignore offline/permission errors
        }
      };
      fetchFirebaseProfile();
    }
  }, [user, profileStorageKey, defaultProfile]);

  const handleCopyKisanId = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(profile.kisanId);
      setCopiedId(true);
      setToast({ show: true, message: 'Kisan ID copied to clipboard!', type: 'success' });
      setTimeout(() => setCopiedId(false), 2500);
    }
  }, [profile.kisanId]);

  const handlePrintCard = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      setProfile(editFormData);

      // 1. Save to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem(profileStorageKey, JSON.stringify(editFormData));
        localStorage.setItem('agrimart_kisan_profile', JSON.stringify(editFormData));

        // Sync with cart address
        const cartAddress = {
          fullName: editFormData.fullName,
          phone: editFormData.phone,
          addressLine1: editFormData.farmAddress,
          city: editFormData.city,
          pincode: editFormData.pincode,
          state: editFormData.state,
          flatBuilding: editFormData.village,
        };
        if (user?.uid) {
          localStorage.setItem(`agrimart_saved_address_${user.uid}`, JSON.stringify(cartAddress));
        }
        localStorage.setItem('agrimart_saved_address', JSON.stringify(cartAddress));
        localStorage.setItem('agrimart_user_name', editFormData.fullName);
      }

      // 2. Sync to Firebase if authenticated
      if (user?.uid) {
        try {
          await setDoc(doc(db, 'users', user.uid), { kisanProfile: editFormData }, { merge: true });
        } catch (fbErr) {
          console.warn('Firebase profile save notice:', fbErr?.message);
        }
      }

      setIsEditing(false);
      setToast({ show: true, message: 'Kisan Profile updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Failed to save changes. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditFormData(profile);
    setIsEditing(false);
  };

  // Format Aadhaar display
  const formattedAadhaar = useMemo(() => {
    const raw = (profile.aadhaarNumber || '5849 2038 9142').replace(/\s+/g, '');
    if (showAadhaar) {
      return raw.replace(/(\d{4})/g, '$1 ').trim();
    }
    const lastFour = raw.slice(-4) || '9142';
    return `•••• •••• ${lastFour}`;
  }, [profile.aadhaarNumber, showAadhaar]);

  return (
    <div className="min-h-screen bg-[#FAF5EB] text-[#263449] flex flex-col selection:bg-[#FF9F43]/30">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb / Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5A6B82] hover:text-[#0B1B30] bg-white px-3 py-2 rounded-xl border border-stone-200/80 shadow-xs hover:border-stone-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
            <span className="text-stone-300 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#16A34A]">agriculture</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">AgriMart Kisan Portal</span>
            </div>
          </div>

          {/* Action Buttons: Edit / Print */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrintCard}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-stone-200 shadow-xs transition-colors"
              title="Print Kisan Identity Slip"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Print ID Slip</span>
            </button>

            {!isEditing ? (
              <motion.button
                whileTap={buttonTap}
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#0B1B30] hover:bg-[#142B4A] px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                <Edit3 className="w-4 h-4 text-[#FF9F43]" />
                <span>Edit Profile</span>
              </motion.button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-600 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <motion.button
                  whileTap={buttonTap}
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#16A34A] hover:bg-[#15803D] px-4 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Demo / Guest banner if not signed in */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-amber-600 shrink-0">info</span>
              <div>
                <p className="text-xs sm:text-sm font-bold">Viewing Demo Kisan Account</p>
                <p className="text-[11px] sm:text-xs text-amber-800">
                  You can inspect or test editing the Kisan profile. Sign in with your phone or email to save records to your permanent account.
                </p>
              </div>
            </div>
            <Link
              href="/login?redirect=/profile"
              className="shrink-0 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Active Edit Alert Bar */}
        {isEditing && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[22px] text-[#16A34A]">edit_note</span>
              <span className="text-xs sm:text-sm font-semibold">
                <strong>Editing Mode Enabled:</strong> You can edit your Farmer Identity, Aadhaar, Phone, Land Holding, and Dispatch Address below.
              </span>
            </div>
            <span className="text-[11px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-md">Live Preview</span>
          </div>
        )}

        {/* Top Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/40 via-amber-100/20 to-transparent rounded-full -mr-32 -mt-32 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            {/* Avatar & Main Info */}
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <div className="relative">
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-[#0B1B30] text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-md border-2 border-[#16A34A]">
                  {profile.fullName ? profile.fullName[0].toUpperCase() : 'K'}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 bg-[#16A34A] text-white p-1 rounded-full shadow-xs border-2 border-white" title="Verified Kisan">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                    {profile.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Farmer
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    {profile.tier}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px] text-[#FF9F43]">badge</span>
                    <span className="font-mono font-bold text-slate-800">{profile.kisanId}</span>
                    <button
                      type="button"
                      onClick={handleCopyKisanId}
                      className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
                      title="Copy Kisan ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91 {profile.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Cultivated Land</span>
                <span className="text-sm sm:text-base font-extrabold text-[#0B1B30] mt-0.5 block">{profile.landSize}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Delivery Hub</span>
                <span className="text-sm sm:text-base font-extrabold text-[#16A34A] mt-0.5 block">{profile.city}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">KCC Credit</span>
                <span className="text-sm sm:text-base font-extrabold text-amber-700 mt-0.5 block">Approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Column (ID Card & Shortcuts) + Right Column (Detailed Records) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Smart Digital Kisan ID Card & Actions (4 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Visual Digital Kisan Smart Card */}
            <div className="relative rounded-3xl p-6 text-white shadow-xl overflow-hidden bg-gradient-to-br from-[#0B1B30] via-[#142B4A] to-[#0A3D2E] border-2 border-emerald-500/30">
              {/* Subtle card textures */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#FF9F43]/15 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined text-[18px] text-[#FF9F43]">eco</span>
                  </div>
                  <div>
                    <h2 className="text-xs font-black tracking-widest uppercase text-emerald-400">AgriMart Kisan Pass</h2>
                    <p className="text-[10px] text-slate-300">Govt & Mandi Certified Digital Card</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-300 tracking-wider uppercase">Active</span>
                </div>
              </div>

              {/* Smart Card Chip & Contactless Symbol */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 p-1 shadow-inner border border-amber-600/40 flex flex-col justify-between">
                  <div className="border-b border-amber-700/30 h-1.5" />
                  <div className="border-b border-amber-700/30 h-1.5" />
                </div>
                <span className="material-symbols-outlined text-white/50 text-[20px]">contactless</span>
              </div>

              {/* Kisan ID in Big Monospace */}
              <div className="mb-4 relative z-10">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Kisan Identifier</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono text-lg sm:text-xl font-black tracking-wider text-[#FF9F43] drop-shadow-sm">
                    {profile.kisanId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKisanId}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Copy Kisan ID"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Farmer Name & Aadhaar Number */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs relative z-10">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Farmer Name</span>
                  <span className="font-bold text-white tracking-wide truncate block">{profile.fullName}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 block font-medium">Aadhaar (e-KYC)</span>
                    <button
                      type="button"
                      onClick={() => setShowAadhaar(!showAadhaar)}
                      className="text-slate-400 hover:text-white transition-colors p-0.5"
                      title={showAadhaar ? 'Hide Aadhaar' : 'Show Aadhaar'}
                    >
                      {showAadhaar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="font-mono font-bold text-white tracking-wider block">{formattedAadhaar}</span>
                </div>
              </div>

              {/* Hub, Land & Validity Details */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs relative z-10">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Dark Store Hub</span>
                  <span className="font-semibold text-emerald-300 truncate block">Hub @ {profile.city}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Member Since</span>
                  <span className="font-semibold text-slate-200 block">{profile.memberSince}</span>
                </div>
              </div>

              {/* Barcode Strip */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1 tracking-widest text-white/70 font-mono text-[9px]">
                  <span>||| | | |||| || | || ||||| | ||| || |||</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">100% Guaranteed Genuine Inputs</span>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">Quick Kisan Actions</h3>

              <Link
                href="/orders"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all text-xs font-semibold text-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Track Farm Orders</p>
                    <p className="text-[11px] text-slate-500">Live dispatch status & past invoices</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:translate-x-0.5 transition-transform">
                  chevron_right
                </span>
              </Link>

              <Link
                href="/wishlist"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all text-xs font-semibold text-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Saved Wishlist</p>
                    <p className="text-[11px] text-slate-500">{wishlistCount} saved seeds & fertilizers</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:translate-x-0.5 transition-transform">
                  chevron_right
                </span>
              </Link>

              <Link
                href="/cart"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all text-xs font-semibold text-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Delivery Cart</p>
                    <p className="text-[11px] text-slate-500">{cartCount} items ready for dispatch</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:translate-x-0.5 transition-transform">
                  chevron_right
                </span>
              </Link>

              {/* Kisan Support line */}
              <div className="mt-4 pt-3 border-t border-stone-100 p-2">
                <a
                  href="tel:18002474627"
                  className="flex items-center gap-3 text-xs text-slate-700 hover:text-[#0B1B30] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Kisan Toll-Free Helpline</p>
                    <p className="text-[11px] text-slate-500">1800-AGRI-MART (Toll-Free 24/7)</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Customer Details, KYC, Farm Land, & Address (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Customer Personal & KYC Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">Customer Identity & KYC Details</h2>
                    <p className="text-[11px] text-slate-500">Official farmer verification data</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  UIDAI / e-KYC Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Customer / Farmer Name *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. Shubh Porwal"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-bold text-slate-800 text-sm border border-stone-200/60">
                      {profile.fullName}
                    </div>
                  )}
                </div>

                {/* Kisan ID */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Govt Kisan ID (Farmer Code)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.kisanId}
                      onChange={(e) => handleInputChange('kisanId', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. KISAN-PB-2024-8849"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-mono font-bold text-[#FF9F43] text-sm border border-stone-200/60 flex items-center justify-between">
                      <span>{profile.kisanId}</span>
                      <button
                        type="button"
                        onClick={handleCopyKisanId}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title="Copy"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Aadhaar Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600">Aadhaar Card Number *</label>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => setShowAadhaar(!showAadhaar)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                      >
                        {showAadhaar ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showAadhaar ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      maxLength={14}
                      value={editFormData.aadhaarNumber}
                      onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="12-digit Aadhaar number"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-mono font-bold text-slate-800 text-sm border border-stone-200/60 flex items-center justify-between">
                      <span>{formattedAadhaar}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Verified</span>
                    </div>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Primary Mobile Number *</label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={editFormData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-bold text-slate-800 text-sm border border-stone-200/60 flex items-center justify-between">
                      <span>+91 {profile.phone}</span>
                      <a href={`tel:${profile.phone}`} className="text-slate-400 hover:text-[#16A34A] p-0.5" title="Call">
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Alternate / WhatsApp Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">WhatsApp / Alternate Number</label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={editFormData.alternatePhone}
                        onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                        className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                        placeholder="Alternate contact"
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-medium text-slate-800 text-sm border border-stone-200/60">
                      {profile.alternatePhone ? `+91 ${profile.alternatePhone}` : '—'}
                    </div>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="name@example.com"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-medium text-slate-800 text-sm border border-stone-200/60 truncate">
                      {profile.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Farm Land & Agricultural Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">Farm Land & Agricultural Profile</h2>
                    <p className="text-[11px] text-slate-500">Crops, soil category, irrigation, and cooperative data</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-stone-100 px-2 py-0.5 rounded-lg">
                  Kharif & Rabi Ready
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Total Land Holding */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Total Farmland Holding</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.landSize}
                      onChange={(e) => handleInputChange('landSize', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. 12.5 Acres"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-bold text-slate-800 text-sm border border-stone-200/60">
                      {profile.landSize}
                    </div>
                  )}
                </div>

                {/* Land Ownership */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Land Ownership Category</label>
                  {isEditing ? (
                    <select
                      value={editFormData.ownershipType}
                      onChange={(e) => handleInputChange('ownershipType', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30] bg-white"
                    >
                      <option value="Self-Owned (Ancestral Land)">Self-Owned (Ancestral Land)</option>
                      <option value="Tenant / Leased Farmland">Tenant / Leased Farmland</option>
                      <option value="Joint Family Holding">Joint Family Holding</option>
                      <option value="FPO Contract Farming">FPO Contract Farming</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-medium text-slate-800 text-sm border border-stone-200/60">
                      {profile.ownershipType}
                    </div>
                  )}
                </div>

                {/* Primary Crops Cultivated */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Primary Crops Grown</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.primaryCrops}
                      onChange={(e) => handleInputChange('primaryCrops', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. Basmati Rice, Wheat, Mustard"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-semibold text-slate-800 text-sm border border-stone-200/60">
                      {profile.primaryCrops}
                    </div>
                  )}
                </div>

                {/* Soil Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Soil Type & Health Condition</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.soilType}
                      onChange={(e) => handleInputChange('soilType', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. Alluvial Loam (pH 7.2)"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-medium text-slate-800 text-sm border border-stone-200/60">
                      {profile.soilType}
                    </div>
                  )}
                </div>

                {/* Irrigation Source */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Irrigation Source</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.irrigationSource}
                      onChange={(e) => handleInputChange('irrigationSource', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. Solar Tubewell + Drip System"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-medium text-slate-800 text-sm border border-stone-200/60">
                      {profile.irrigationSource}
                    </div>
                  )}
                </div>

                {/* FPO Affiliation */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">FPO / Farmer Cooperative</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.fpoName}
                      onChange={(e) => handleInputChange('fpoName', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. Doaba Kisan Producer Org"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-medium text-slate-800 text-sm border border-stone-200/60">
                      {profile.fpoName}
                    </div>
                  )}
                </div>

                {/* Kisan Credit Card Status */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Kisan Credit Card (KCC)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.kccStatus}
                      onChange={(e) => handleInputChange('kccStatus', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. Active (PNB / SBI)"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-bold text-emerald-800 text-sm border border-stone-200/60 flex items-center justify-between">
                      <span>{profile.kccStatus}</span>
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Farm Address & Delivery Hub Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">Farm Address & Dispatch Location</h2>
                    <p className="text-[11px] text-slate-500">Auto-synced with checkout and delivery vehicles</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  Direct Farm Delivery
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Farm / Street Address */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Farm Name / House / Road *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.farmAddress}
                      onChange={(e) => handleInputChange('farmAddress', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. Farm No. 14, Near GT Road"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-medium text-slate-800 text-sm border border-stone-200/60">
                      {profile.farmAddress}
                    </div>
                  )}
                </div>

                {/* Village / Area */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Village / Colony / Area</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.village}
                      onChange={(e) => handleInputChange('village', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. Model Town"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-medium text-slate-800 text-sm border border-stone-200/60">
                      {profile.village}
                    </div>
                  )}
                </div>

                {/* City / Tehsil */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City / Tehsil *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. Phagwara"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-bold text-slate-800 text-sm border border-stone-200/60">
                      {profile.city}
                    </div>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">State *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. Punjab"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-medium text-slate-800 text-sm border border-stone-200/60">
                      {profile.state}
                    </div>
                  )}
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">PIN Code *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      maxLength={6}
                      value={editFormData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. 144401"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl font-mono font-bold text-slate-800 text-sm border border-stone-200/60">
                      {profile.pincode}
                    </div>
                  )}
                </div>

                {/* Special Delivery Directions */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Delivery Directions & Tractor Access Landmark</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.deliveryDirections}
                      onChange={(e) => handleInputChange('deliveryDirections', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B30]"
                      placeholder="e.g. Near Primary School water tank, tractor road"
                    />
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl text-slate-700 text-xs border border-stone-200/60 flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-slate-400 mt-0.5">near_me</span>
                      <span>{profile.deliveryDirections}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nearest Dark Store Serviceability Indicator */}
              <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#16A34A]">warehouse</span>
                  <div>
                    <span className="font-bold text-emerald-950">Nearest AgriMart Dark Store: </span>
                    <span className="text-emerald-900 font-medium">AgriMart Kisan Hub @ LPU, Phagwara</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Serviceable (&le;30 km)
                </span>
              </div>
            </div>

            {/* Bottom Save Bar when editing */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 border border-stone-200 shadow-lg flex items-center justify-between gap-4 sticky bottom-6 z-30"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span className="material-symbols-outlined text-[18px] text-[#16A34A]">save</span>
                  <span>Remember to save your updated customer information.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    {saving ? (
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Profile</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Inline Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
