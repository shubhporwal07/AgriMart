'use client';
import { Suspense } from 'react';
import OrdersPage from '../../views/OrdersPage';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { PageSkeletonLoader } from '../../components/SkeletonLoader';

export default function OrdersRoute() {
  return (
    <Suspense fallback={<PageSkeletonLoader />}>
      <ProtectedRoute>
        <OrdersPage />
      </ProtectedRoute>
    </Suspense>
  );
}

