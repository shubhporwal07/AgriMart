'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import Toast from '../components/Toast';
import { getFirebaseErrorMessage } from '../utils/validators';

export default function LoginPage({ onAdminLogin }) {
  const ADMIN_EMAIL = 'admin@gmail.com';
  const ADMIN_PASSWORD = 'admin9876';
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const router = useRouter();
  const searchParams = useSearchParams();

  const afterAuthPath = useCallback(() => {
    const raw = searchParams.get('redirect');
    if (!raw) return '/dashboard';
    try {
      const path = decodeURIComponent(raw);
      if (path.startsWith('/') && !path.startsWith('//') && path !== '/') return path;
    } catch {
      /* ignore */
    }
    return '/dashboard';
  }, [searchParams]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignup) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'error' });
    }, 4000);
  };

  const saveCustomerRecord = async (user, isNewAccount = false) => {
    if (!user?.uid || !user?.email) return;
    const record = {
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      role: 'user',
      lastLoginAt: serverTimestamp(),
    };
    if (isNewAccount) record.createdAt = serverTimestamp();
    try {
      await setDoc(doc(db, 'users', user.uid), record, { merge: true });
    } catch (err) {
      console.warn('User doc sync skipped:', err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Admin login
        localStorage.setItem('adminSession', JSON.stringify({
          adminId: ADMIN_EMAIL,
          loginTime: new Date().toISOString(),
          isAdmin: true,
        }));
        if (onAdminLogin) {
          onAdminLogin();
        }
        showToast('Admin login successful! Redirecting to Gupta Mart Console...', 'success');
        setTimeout(() => {
          router.push('/admin/panel');
        }, 700);
        return;
      }

      // Regular user login
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveCustomerRecord(result.user);
      showToast('Welcome back to Gupta Mart!', 'success');
      setTimeout(() => {
        router.replace(afterAuthPath());
      }, 800);
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error) || 'Unable to sign in right now. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await saveCustomerRecord(result.user, true);
      showToast('Account created successfully! Welcome to Gupta Mart.', 'success');
      setTimeout(() => {
        router.replace(afterAuthPath());
      }, 800);
    } catch (error) {
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? 'Email already registered. Please log in instead.'
        : error.code === 'auth/weak-password'
          ? 'Password is too weak. Please use a stronger password.'
          : error.code === 'auth/invalid-email'
            ? 'Invalid email address.'
            : error.message;
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      await saveCustomerRecord(result.user, result._tokenResponse?.isNewUser);
      showToast('Welcome to Gupta Mart!', 'success');
      setTimeout(() => {
        router.replace(afterAuthPath());
      }, 800);
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        const errorMessage = getFirebaseErrorMessage(error) || 'Google sign-in failed. Please try again.';
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F9FC] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="relative z-10 bg-white border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
              <img src="/images/logo.png" alt="Gupta Mart" className="h-10 w-auto object-contain rounded-xl" />
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#142B4A] block leading-none">
                  GUPTA <span className="text-[#E27B12]">MART</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF9F43]">
                  ⚡ 12-Min Grocery Delivery
                </span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard?category=fruits-vegetables" className="text-sm font-semibold text-slate-700 hover:text-[#142B4A] transition">Fresh Produce</Link>
              <Link href="/dashboard?category=dairy-bakery" className="text-sm font-semibold text-slate-700 hover:text-[#142B4A] transition">Dairy &amp; Farm Eggs</Link>
              <Link href="/dashboard?category=staples" className="text-sm font-semibold text-slate-700 hover:text-[#142B4A] transition">Organic Staples</Link>
              <Link href="/about-us" className="text-sm font-semibold text-slate-700 hover:text-[#142B4A] transition">Why Gupta Mart</Link>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-bold text-[#142B4A] hover:text-[#FF9F43] flex items-center gap-1"
            >
              Browse Aisles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Main split content */}
      <main className="flex-1 flex p-0">
        <div className="w-full flex-1 bg-[#F7F9FC] overflow-hidden flex flex-col md:flex-row min-h-full">

          {/* Left Side - Brand Narrative Hero */}
          <div className="relative w-full md:w-[48%] bg-[#142B4A] hidden md:flex flex-col justify-between p-12 lg:p-16 text-white overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
              alt="Fresh Groceries"
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#142B4A] via-[#142B4A]/90 to-[#142B4A]/70" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF9F43]/20 border border-[#FF9F43]/30 text-[#FF9F43] text-xs font-extrabold uppercase tracking-wider mb-6">
                <Zap className="w-4 h-4 fill-current" />
                India's Fresh Quick-Commerce
              </div>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
                Fresh harvest delivered at lightning speed.
              </h2>
              <p className="text-slate-300 text-sm lg:text-base leading-relaxed max-w-md">
                Experience farm-to-table groceries, crisp greens, cold-pressed staples, and daily essentials delivered right to your door in 12–15 minutes.
              </p>
            </div>

            <div className="relative z-10 space-y-4 pt-10 border-t border-white/10">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span><strong>100% Quality Guaranteed:</strong> Instant refund on produce if not crisp and fresh.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="w-8 h-8 rounded-full bg-[#FF9F43]/20 text-[#FF9F43] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span><strong>Direct Farm Sourcing:</strong> Verified organic partner farms across India.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <span><strong>Dark Pod Network:</strong> Express 12-minute dispatch across 100+ pin codes.</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form Card */}
          <div className="relative w-full md:w-[52%] p-6 sm:p-10 lg:p-14 flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100">
              {/* Tab Selector */}
              <div className="flex w-full mb-8 bg-[#F7F9FC] p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(false);
                    setErrors({});
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wide transition ${
                    !isSignup
                      ? 'bg-[#142B4A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#142B4A]'
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(true);
                    setErrors({});
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wide transition ${
                    isSignup
                      ? 'bg-[#142B4A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#142B4A]'
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
                  {isSignup ? 'Join Gupta Mart' : 'Welcome Back'}
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  {isSignup
                    ? 'Get ₹150 discount on your first 3 fresh grocery orders'
                    : 'Access your instant orders, saved addresses & basket'}
                </p>
              </div>

              <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="you@example.com"
                      className={`block w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-[#F7F9FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B4A] transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      placeholder="••••••••"
                      className={`block w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 bg-[#F7F9FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B4A] transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>}
                </div>

                {isSignup && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                        }}
                        placeholder="••••••••"
                        className={`block w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 bg-[#F7F9FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B4A] transition ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword}</p>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#FF9F43] hover:bg-[#E27B12] text-slate-950 font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
                >
                  {loading
                    ? (isSignup ? 'Creating your account...' : 'Signing in...')
                    : (isSignup ? 'Create Free Gupta Mart Account' : 'Sign In to Gupta Mart')
                  }
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                {!isSignup && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white text-slate-400 font-semibold uppercase">Or continue with</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition text-xs font-bold text-slate-700 shadow-sm disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </button>
                  </>
                )}
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Protected by Gupta Mart Secure 256-bit encryption</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
