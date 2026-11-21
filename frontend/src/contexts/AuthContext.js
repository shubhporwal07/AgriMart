'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Create Auth Context
const AuthContext = createContext(null);

// Demo mode flag - set to true to bypass authentication
const DEMO_MODE = false;

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authModal, setAuthModal] = useState({
    show: false,
    type: null, // 'login' | 'logout'
    stage: null, // 'during' | 'after'
    status: '', // 'authenticating' | 'success' | 'error'
    title: '',
    message: '',
    userName: '',
  });

  const triggerAuthNotice = useCallback((notice) => {
    setAuthModal({
      show: true,
      type: notice.type || 'login',
      stage: notice.stage || 'during',
      status: notice.status || '',
      title: notice.title || '',
      message: notice.message || '',
      userName: notice.userName || '',
    });
  }, []);

  const closeAuthNotice = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, show: false }));
  }, []);

  const checkCustomerSession = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      const email = localStorage.getItem('agrimart_user_email') || localStorage.getItem('userEmail');
      if (email && typeof email === 'string' && email.includes('@')) {
        setUser((prev) => {
          if (prev && prev.email === email) return prev;
          return {
            uid: 'customer-' + email.replace(/[^a-zA-Z0-9]/g, '_'),
            email: email.toLowerCase(),
            displayName: email.split('@')[0],
          };
        });
        setUserRole('user');
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, []);

  const checkAdminSession = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem('adminSession');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.isAdmin) {
          setUser((prev) => prev || {
            uid: 'admin-console',
            email: parsed.adminId || 'admin@agrimart.farm',
            displayName: 'AgriMart Admin',
          });
          setUserRole('admin');
          return true;
        }
      }
    } catch {
      localStorage.removeItem('adminSession');
    }
    return false;
  }, []);

  useEffect(() => {
    if (DEMO_MODE) {
      setUser({ 
        uid: 'demo-user', 
        email: 'demo@agrimart.farm',
        displayName: 'Demo Admin'
      });
      setUserRole('admin');
      setLoading(false);
      return;
    }

    // Check if an admin session is currently active
    const hasAdmin = checkAdminSession();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setUserRole('user');
          setLoading(false);

          try {
            // Fetch user role from Firestore
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const role = userDocSnap.data().role || 'user';
              setUserRole(role);
            } else {
              setUserRole('user');
            }
          } catch (err) {
            console.error('Error fetching user role:', err);
            setUserRole('user');
          }
        } else {
          // If no Firebase user, check if admin or customer session is present in localStorage
          if (!checkAdminSession() && !checkCustomerSession()) {
            setUser(null);
            setUserRole(null);
          }
          setLoading(false);
        }
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    // Listen to local storage changes for cross-tab or intra-app login/logout
    const handleStorage = () => {
      const hasAdmin = checkAdminSession();
      if (!hasAdmin) {
        const hasCustomer = checkCustomerSession();
        if (!hasCustomer) {
          setUser(null);
          setUserRole(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('agrimart-auth-change', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('agrimart-auth-change', handleStorage);
    };
  }, [checkAdminSession, checkCustomerSession]);

  // Logout function with animated transition and post-logout pop-up notice
  const logout = async () => {
    try {
      setLoading(true);
      // 1. Trigger DURING LOGOUT modal animation
      triggerAuthNotice({
        type: 'logout',
        stage: 'during',
        status: 'authenticating',
        title: 'Signing Out...',
        message: 'Securing your AgriMart account & saving cart state...',
      });

      // Brief animation dwell time for smooth visual feedback
      await new Promise((r) => setTimeout(r, 650));

      await signOut(auth).catch(() => {});
      localStorage.removeItem('adminSession');
      localStorage.removeItem('agrimart_user_email');
      localStorage.removeItem('agrimart_user_name');
      localStorage.removeItem('agrimart_customer_session_v1');
      localStorage.removeItem('userEmail');
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        // Record post-logout notice in sessionStorage so destination page shows AFTER LOGOUT pop-up
        sessionStorage.setItem(
          'agrimart_auth_toast',
          JSON.stringify({
            type: 'logout',
            stage: 'after',
            title: 'Logged Out Successfully',
            message: 'You have safely signed out of AgriMart. See you again soon!',
            timestamp: Date.now(),
          })
        );
      }
      setUser(null);
      setUserRole(null);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('agrimart-auth-change'));
      
      // Update modal to post-logout toast
      closeAuthNotice();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('agrimart-auth-notice', {
            detail: {
              type: 'logout',
              stage: 'after',
              title: 'Logged Out Successfully',
              message: 'You have safely signed out of AgriMart. See you again soon!',
              timestamp: Date.now(),
            },
          })
        );
      }
    } catch (error) {
      setError(error.message);
      closeAuthNotice();
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userRole,
    loading,
    error,
    logout,
    authModal,
    triggerAuthNotice,
    closeAuthNotice,
    isAuthenticated: !!user || userRole === 'admin',
    isAdmin: userRole === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
