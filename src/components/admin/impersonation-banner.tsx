'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ImpersonationBannerProps {
  dealerName: string;
}

export function ImpersonationBanner({ dealerName }: ImpersonationBannerProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleExit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/admin');
        router.refresh();
      }
    } catch (error) {
      console.error('Error exiting impersonation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎭</span>
        <span className="font-medium">
          Du siehst das Dashboard als: <strong>{dealerName}</strong>
        </span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExit}
        disabled={loading}
      >
        {loading ? '...' : '✕ Impersonation beenden'}
      </Button>
    </div>
  );
}
