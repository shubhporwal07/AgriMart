'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();

  useEffect(() => {
    // Forward directly to unified login page
    router.replace('/login?redirect=/admin/panel');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B1B30] flex flex-col items-center justify-center text-white gap-3">
      <div className="w-8 h-8 border-3 border-[#FF9F43] border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-bold">Redirecting to Login...</span>
    </div>
  );
}
