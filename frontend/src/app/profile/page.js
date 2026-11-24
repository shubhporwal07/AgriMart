'use client';
import { Suspense } from 'react';
import ProfilePage from '../../views/ProfilePage';
import { PageSkeletonLoader } from '../../components/SkeletonLoader';

export default function ProfileRoute() {
  return (
    <Suspense fallback={<PageSkeletonLoader />}>
      <ProfilePage />
    </Suspense>
  );
}
