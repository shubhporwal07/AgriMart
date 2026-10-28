'use client';
import { Suspense } from 'react';
import DashboardPage from '../../views/DashboardPage';
import { PageSkeletonLoader } from '../../components/SkeletonLoader';

export default function DashboardRoute() {
  return (
    <Suspense fallback={<PageSkeletonLoader />}>
      <DashboardPage />
    </Suspense>
  );
}
