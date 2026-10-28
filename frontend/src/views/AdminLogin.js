'use client';
import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';
import Toast from '../components/Toast';

export default function AdminLogin({ onLoginSuccess }) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const validateForm = () => {
    const newErrors = {};

    if (!adminId.trim()) {
      newErrors.adminId = 'Admin ID or Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if ((adminId === 'admin' || adminId === 'admin@gmail.com') && password === 'admin9876') {
        localStorage.setItem('adminSession', JSON.stringify({
          adminId: 'admin',
          loginTime: new Date().toISOString(),
          isAdmin: true,
        }));

        setToast({
          show: true,
          message: 'Gupta Mart Admin authentication successful!',
          type: 'success',
        });

        setTimeout(() => {
          onLoginSuccess();
        }, 800);
      } else {
        setToast({
          show: true,
          message: 'Invalid Admin credentials. Try admin / admin9876',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setToast({
        show: true,
        message: 'An error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#142B4A] flex items-center justify-center p-4">
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="w-full max-w-md bg-[#0F223D] border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 text-white">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#FF9F43] text-slate-950 flex items-center justify-center mx-auto mb-4 font-black shadow-lg shadow-[#FF9F43]/20">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
            GUPTA <span className="text-[#FF9F43]">MART</span>
          </h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Quick-Commerce Admin Console
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Identifier
            </label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => {
                setAdminId(e.target.value);
                if (errors.adminId) setErrors({ ...errors, adminId: '' });
              }}
              placeholder="e.g. admin or admin@gmail.com"
              className={`w-full px-4 py-3 bg-[#142B4A] border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9F43] ${
                errors.adminId ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {errors.adminId && (
              <p className="text-red-400 text-xs mt-1">{errors.adminId}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                placeholder="Enter password"
                className={`w-full px-4 py-3 bg-[#142B4A] border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9F43] pr-10 ${
                  errors.password ? 'border-red-500' : 'border-white/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Credentials Helper */}
          <div className="bg-[#142B4A]/60 border border-white/10 rounded-xl p-3 text-xs text-slate-300">
            <span className="text-[#FF9F43] font-bold">Admin Demo Credentials:</span>
            <div className="mt-1 flex items-center justify-between text-slate-400 font-mono">
              <span>User: <strong className="text-white">admin</strong></span>
              <span>Pass: <strong className="text-white">admin9876</strong></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FF9F43] hover:bg-[#E27B12] text-slate-950 font-black rounded-xl transition duration-200 text-sm shadow-lg shadow-[#FF9F43]/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Gupta Mart Console'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Gupta Mart Enterprise Control System</span>
        </div>
      </div>
    </div>
  );
}
