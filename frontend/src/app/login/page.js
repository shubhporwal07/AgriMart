'use client';
import { Suspense } from 'react';
import LoginPage from '../../views/LoginPage';
import { PublicRoute } from '../../components/ProtectedRoute';
import { PageSkeletonLoader } from '../../components/SkeletonLoader';

export default function LoginRoute() {
  return (
    <Suspense fallback={<PageSkeletonLoader />}>
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    </Suspense>
  );
}

