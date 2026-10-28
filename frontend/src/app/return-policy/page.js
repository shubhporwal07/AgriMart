'use client';
import { Suspense } from 'react';
import ReturnPolicy from '../../views/ReturnPolicy';
import { PageSkeletonLoader } from '../../components/SkeletonLoader';

export default function ReturnPolicyRoute() {
  return (
    <Suspense fallback={<PageSkeletonLoader />}>
      <ReturnPolicy />
    </Suspense>
  );
}
