// Team Management Service
import { createClient } from '@/lib/supabase/server';
import { TeamMember, TeamInvitation, TeamRole } from '@/types/team';
import { getPlanLimits, PlanId } from '@/lib/stripe/config';
import { randomBytes } from 'crypto';

// ============================================
// Team Members
// ============================================

export async function getTeamMembers(dealerId: string): Promise<TeamMember[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      user:auth.users(email, raw_user_meta_data)
    `)
    .eq('dealer_id', dealerId)
    .order('role', { ascending: true })
    .order('created_at', { ascending: true });
    
  if (error) throw error;
  
  // Transform user data
  return (data || []).map(member => ({
    ...member,
    user: member.user ? {
      email: member.user.email,
      user_metadata: member.user.raw_user_meta_data,
    } : undefined,
  }));
}

export async function getTeamMemberCount(dealerId: string): Promise<number> {
  const supabase = await createClient();
  
  const { count, error } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealerId);
    
  if (error) throw error;
  return count || 0;
}

export async function canAddTeamMember(dealerId: string, plan: PlanId): Promise<boolean> {
  const currentCount = await getTeamMemberCount(dealerId);
  const limits = getPlanLimits(plan);
  
  // -1 means unlimited
  if (limits.users === -1) return true;
  return currentCount < limits.users;
}

export async function updateTeamMemberRole(
  memberId: string,
  newRole: TeamRole
): Promise<TeamMember> {
  const supabase = await createClient();
  
  // Get the member to check permissions
  const { data: member, error: fetchError } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', memberId)
    .single();
    
  if (fetchError || !member) throw new Error('Member not found');
  
  // Can't change owner's role (must transfer ownership instead)
  if (member.role === 'owner') {
    throw new Error('Cannot change owner role. Use transfer ownership instead.');
  }
  
  // Can't promote to owner (must transfer ownership)
  if (newRole === 'owner') {
    throw new Error('Cannot promote to owner. Use transfer ownership instead.');
  }
  
  const { data, error } = await supabase
    .from('team_members')
    .update({ role: newRole })
    .eq('id', memberId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function removeTeamMember(memberId: string): Promise<void> {
  const supabase = await createClient();
  
  // Get the member first
  const { data: member, error: fetchError } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', memberId)
    .single();
    
  if (fetchError || !member) throw new Error('Member not found');
  
  // Can't remove owner
  if (member.role === 'owner') {
    throw new Error('Cannot remove owner. Transfer ownership first.');
  }
  
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId);
    
  if (error) throw error;
}

// ============================================
// Invitations
// ============================================

export async function createInvitation(
  dealerId: string,
  email: string,
  role: TeamRole,
  invitedBy: string
): Promise<TeamInvitation> {
  const supabase = await createClient();
  
  // Generate secure token
  const token = randomBytes(32).toString('hex');
  
  // Check if invitation already exists
  const { data: existing } = await supabase
    .from('team_invitations')
    .select('id')
    .eq('dealer_id', dealerId)
    .eq('email', email.toLowerCase())
    .is('accepted_at', null)
    .single();
    
  if (existing) {
    throw new Error('An invitation for this email already exists');
  }
  
  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('team_members')
    .select('id, user:auth.users!inner(email)')
    .eq('dealer_id', dealerId)
    .eq('user.email', email.toLowerCase())
    .single();
    
  if (existingMember) {
    throw new Error('This user is already a team member');
  }
  
  const { data, error } = await supabase
    .from('team_invitations')
    .insert({
      dealer_id: dealerId,
      email: email.toLowerCase(),
      role,
      token,
      invited_by: invitedBy,
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function getInvitations(dealerId: string): Promise<TeamInvitation[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('dealer_id', dealerId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

export async function getInvitationByToken(token: string): Promise<TeamInvitation & { dealer: { company_name: string } } | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('team_invitations')
    .select(`
      *,
      dealer:dealers(company_name)
    `)
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();
    
  if (error || !data) return null;
  return data as TeamInvitation & { dealer: { company_name: string } };
}

export async function acceptInvitation(token: string, userId: string): Promise<TeamMember> {
  const supabase = await createClient();
  
  // Get invitation
  const invitation = await getInvitationByToken(token);
  if (!invitation) {
    throw new Error('Invalid or expired invitation');
  }
  
  // Check plan limits
  const { data: dealer } = await supabase
    .from('dealers')
    .select('subscription_plan')
    .eq('id', invitation.dealer_id)
    .single();
    
  if (dealer && !(await canAddTeamMember(invitation.dealer_id, dealer.subscription_plan))) {
    throw new Error('Team member limit reached for this plan');
  }
  
  // Create team member
  const { data: member, error: memberError } = await supabase
    .from('team_members')
    .insert({
      dealer_id: invitation.dealer_id,
      user_id: userId,
      role: invitation.role,
      invited_by: invitation.invited_by,
      accepted_at: new Date().toISOString(),
    })
    .select()
    .single();
    
  if (memberError) throw memberError;
  
  // Mark invitation as accepted
  await supabase
    .from('team_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);
    
  return member;
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('team_invitations')
    .delete()
    .eq('id', invitationId);
    
  if (error) throw error;
}

// ============================================
// Platform Admin
// ============================================

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('platform_admins')
    .select('id')
    .eq('user_id', userId)
    .single();
    
  return !error && !!data;
}

// ============================================
// User's Dealer Resolution (replaces old single-dealer lookup)
// ============================================

export async function getUserDealers(userId: string): Promise<{ dealer_id: string; role: TeamRole }[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('team_members')
    .select('dealer_id, role')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data || [];
}

export async function getUserRole(userId: string, dealerId: string): Promise<TeamRole | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', userId)
    .eq('dealer_id', dealerId)
    .single();
    
  if (error || !data) return null;
  return data.role;
}
