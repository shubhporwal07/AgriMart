'use client';
import { Suspense } from 'react';
import LandingPage from '../views/LandingPage';
import { PageSkeletonLoader } from '../components/SkeletonLoader';

export default function Home() {
  return (
    <Suspense fallback={<PageSkeletonLoader />}>
      <LandingPage />
    </Suspense>
  );
}
