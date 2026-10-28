'use client';
import { useState, useEffect } from 'react';
import AdminPanel from '../../../views/AdminPanel';
import AdminLogin from '../../../views/AdminLogin';

export default function AdminPanelRoute() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed?.isAdmin) {
          setIsAdminLoggedIn(true);
        }
      } catch {
        localStorage.removeItem('adminSession');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#142B4A] flex items-center justify-center text-white font-bold">
        Loading Gupta Mart Console...
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />;
  }

  return <AdminPanel onLogout={() => setIsAdminLoggedIn(false)} />;
}
