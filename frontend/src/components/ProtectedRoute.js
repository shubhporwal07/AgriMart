'use client';
import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { PageSkeletonLoader } from './SkeletonLoader';

// Loading component
export function LoadingScreen() {
  return <PageSkeletonLoader />;
}

// Protected Route - requires authentication
export function ProtectedRoute({ children, fallback }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && !isAuthenticated && !fallback) {
      const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
      const redirect = encodeURIComponent(`${pathname}${search}`);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [loading, isAuthenticated, fallback, router, pathname, searchParams]);

  if (loading || (!isAuthenticated && !fallback)) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated && fallback) {
    return fallback;
  }

  return children;
}

// Admin Route - requires admin role
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
        const redirect = encodeURIComponent(`${pathname}${search}`);
        router.replace(`/login?redirect=${redirect}`);
      } else if (!isAdmin) {
        router.replace('/');
      }
    }
  }, [loading, isAuthenticated, isAdmin, router, pathname, searchParams]);

  if (loading || !isAuthenticated || !isAdmin) {
    return <LoadingScreen />;
  }

  return children;
}

// Public Route - if authenticated, redirect to destination or dashboard
export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      let redirect = searchParams?.get('redirect');
      let step = searchParams?.get('step');
      if (!redirect && typeof window !== 'undefined' && sessionStorage.getItem('agrimart_pending_checkout') === 'true') {
        redirect = '/cart';
        step = 'address';
      }
      if (redirect) {
        try {
          const decoded = decodeURIComponent(redirect);
          if (decoded.startsWith('/') && !decoded.startsWith('//')) {
            const dest = step && !decoded.includes('step=')
              ? `${decoded}${decoded.includes('?') ? '&' : '?'}step=${encodeURIComponent(step)}`
              : decoded;
            router.replace(dest);
            return;
          }
        } catch {
          // ignore
        }
      }
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, router, searchParams]);

  if (loading || isAuthenticated) {
    return <LoadingScreen />;
  }

  return children;
}

