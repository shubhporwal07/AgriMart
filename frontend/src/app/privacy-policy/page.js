'use client';
import { Suspense } from 'react';
import PrivacyPolicy from '../../views/PrivacyPolicy';
import { PageSkeletonLoader } from '../../components/SkeletonLoader';

export default function PrivacyPolicyRoute() {
  return (
    <Suspense fallback={<PageSkeletonLoader />}>
      <PrivacyPolicy />
    </Suspense>
  );
}
