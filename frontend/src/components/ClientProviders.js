'use client';
import { Suspense, useEffect, useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { LocationProvider } from '../contexts/LocationContext';
import { ProductProvider } from '../contexts/ProductContext';
import { PageSkeletonLoader } from './SkeletonLoader';

export default function ClientProviders({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthProvider>
      <LocationProvider>
        <ProductProvider>
          <Suspense fallback={<PageSkeletonLoader />}>
            {children}
          </Suspense>
        </ProductProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
