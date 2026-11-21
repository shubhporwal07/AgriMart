'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import AdminPanel from '../../../views/AdminPanel';

export default function AdminPanelRoute() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = () => {
      const session = localStorage.getItem('adminSession');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed?.isAdmin) {
            setIsAdminLoggedIn(true);
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem('adminSession');
        }
      }
      setIsAdminLoggedIn(false);
      setLoading(false);
      // Admin is not logged in - redirect to unified user login page
      router.replace('/login?redirect=/admin/panel');
    };

    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    setIsAdminLoggedIn(false);
    await logout();
    router.replace('/login');
  };

  if (loading || !isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0B1B30] flex flex-col items-center justify-center text-white gap-3 font-sans">
        <div className="w-9 h-9 border-3 border-[#FF9F43] border-t-transparent rounded-full animate-spin" />
        <span className="font-bold text-sm tracking-wide">Checking Admin Access...</span>
      </div>
    );
  }

  return <AdminPanel onLogout={handleLogout} />;
}
