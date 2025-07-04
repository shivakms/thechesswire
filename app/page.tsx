// app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SoulGate from '@/components/onboarding/SoulGate';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    console.log('HomePage mounted!'); // Add this line
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('chesswire_auth');
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router]);

  console.log('Rendering SoulGate'); // Add this line
  return <SoulGate />;
}