// Centralized dealer resolution for authenticated users
// Uses team_members for multi-user support

import { createClient } from '@/lib/supabase/server';
import { Dealer } from '@/types/database';

type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface DealerWithRole extends Dealer {
  role: TeamRole;
}

/**
 * Get the current user's dealer with their role.
 * If user belongs to multiple dealers, returns the first one.
 * Falls back to legacy user_id lookup for backwards compatibility.
 */
export async function getCurrentDealer(): Promise<DealerWithRole | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Try team_members first (new multi-user flow)
  const { data: membership } = await supabase
    .from('team_members')
    .select('dealer_id, role')
    .eq('user_id', user.id)
    .order('role', { ascending: true }) // owner first
    .limit(1)
    .single();
  
  if (membership) {
    const { data: dealer } = await supabase
      .from('dealers')
      .select('*')
      .eq('id', membership.dealer_id)
      .single();
    
    if (dealer) {
      return { ...dealer, role: membership.role as TeamRole };
    }
  }
  
  // Fallback to legacy user_id lookup (for users not yet in team_members)
  const { data: dealer } = await supabase
    .from('dealers')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (dealer) {
    // Assume owner role for legacy users
    return { ...dealer, role: 'owner' };
  }
  
  return null;
}

/**
 * Get all dealers the current user has access to.
 */
export async function getUserDealers(): Promise<DealerWithRole[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  // Get all memberships
  const { data: memberships } = await supabase
    .from('team_members')
    .select('dealer_id, role')
    .eq('user_id', user.id);
  
  if (!memberships || memberships.length === 0) {
    // Fallback to legacy lookup
    const { data: dealer } = await supabase
      .from('dealers')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (dealer) {
      return [{ ...dealer, role: 'owner' as TeamRole }];
    }
    return [];
  }
  
  // Get all dealers for memberships
  const dealerIds = memberships.map(m => m.dealer_id);
  const { data: dealers } = await supabase
    .from('dealers')
    .select('*')
    .in('id', dealerIds);
  
  if (!dealers) return [];
  
  // Map dealers with roles
  return dealers.map(dealer => {
    const membership = memberships.find(m => m.dealer_id === dealer.id);
    return { ...dealer, role: (membership?.role || 'viewer') as TeamRole };
  });
}

/**
 * Check if current user has required permission.
 */
export function hasPermission(
  role: TeamRole,
  permission: 'view' | 'create' | 'edit' | 'delete' | 'manage_team' | 'manage_billing'
): boolean {
  const permissions: Record<TeamRole, string[]> = {
    owner: ['view', 'create', 'edit', 'delete', 'manage_team', 'manage_billing'],
    admin: ['view', 'create', 'edit', 'delete', 'manage_team'],
    member: ['view', 'create', 'edit', 'delete'],
    viewer: ['view'],
  };
  
  return permissions[role]?.includes(permission) ?? false;
}
