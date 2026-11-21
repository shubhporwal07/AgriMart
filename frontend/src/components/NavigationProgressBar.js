'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When route finishes changing, complete progress and smoothly fade out
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    // Listen for clicks on any internal links to start progress instantly
    const handleLinkClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      // Only trigger for internal navigations that change the path
      if (
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('#') &&
        anchor.target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        const targetPath = href.split('?')[0].split('#')[0];
        const currentPath = window.location.pathname;
        if (targetPath !== currentPath) {
          setLoading(true);
          setProgress(30);
          setTimeout(() => setProgress((p) => (p > 0 && p < 85 ? 70 : p)), 100);
          setTimeout(() => setProgress((p) => (p > 0 && p < 92 ? 88 : p)), 250);
        }
      }
    };

    document.addEventListener('click', handleLinkClick, { capture: true });
    return () => document.removeEventListener('click', handleLinkClick, { capture: true });
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#FF9F43] via-[#00ead5] to-[#10B981] shadow-[0_0_12px_rgba(0,234,213,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: 'width, opacity',
        }}
      />
    </div>
  );
}
