'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { processOAuthCallback } from '@/lib/auth';

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const result = processOAuthCallback(router, '/');
    if (!result.success) {
      // if no token, redirect to login
      router.replace('/login');
    }
  }, [router]);

  return (
    <div style={{padding: '2rem'}}>
      <h2>Processing authentication...</h2>
    </div>
  );
}
