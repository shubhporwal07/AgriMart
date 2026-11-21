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
      if (!checkAdminSession()) {
        checkCustomerSession();
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

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth).catch(() => {});
      localStorage.removeItem('adminSession');
      localStorage.removeItem('agrimart_user_email');
      localStorage.removeItem('userEmail');
      window.dispatchEvent(new Event('storage'));
      setUser(null);
      setUserRole(null);
    } catch (error) {
      setError(error.message);
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
