'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PLANS, PlanId, getPlanLimits, isWithinLimit } from '@/lib/stripe/config';
import { Dealer } from '@/types/database';

interface SubscriptionState {
  dealer: Dealer | null;
  plan: typeof PLANS[PlanId] | null;
  isLoading: boolean;
  error: Error | null;
  // Computed values
  isPremium: boolean;
  isBeta: boolean;
  isActive: boolean;
  canAddVehicle: (currentCount: number) => boolean;
  canAddUser: (currentCount: number) => boolean;
  canAddChannel: (currentCount: number) => boolean;
  limits: typeof PLANS[PlanId]['limits'] | null;
  // Actions
  refresh: () => Promise<void>;
}

export function useSubscription(): SubscriptionState {
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchDealer() {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDealer(null);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('dealers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setDealer(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dealer'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDealer();
  }, []);

  const planId = (dealer?.subscription_plan || 'beta') as PlanId;
  const plan = PLANS[planId] || PLANS.beta;
  const limits = getPlanLimits(planId);

  const isPremium = planId !== 'beta';
  const isBeta = planId === 'beta';
  const isActive = dealer?.subscription_status === 'active' || 
                   dealer?.subscription_status === 'trialing' ||
                   isBeta; // Beta is always active

  return {
    dealer,
    plan,
    isLoading,
    error,
    isPremium,
    isBeta,
    isActive,
    canAddVehicle: (currentCount: number) => isWithinLimit(planId, 'vehicles', currentCount),
    canAddUser: (currentCount: number) => isWithinLimit(planId, 'users', currentCount),
    canAddChannel: (currentCount: number) => isWithinLimit(planId, 'channels', currentCount),
    limits,
    refresh: fetchDealer,
  };
}
