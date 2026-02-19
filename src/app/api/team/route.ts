import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { TeamInvitation } from '@/types/team';

// GET /api/team?dealerId=xxx - Get team members and invitations
export async function GET(request: NextRequest) {
  try {
    const dealerId = request.nextUrl.searchParams.get('dealerId');
    
    if (!dealerId) {
      return NextResponse.json({ error: 'dealerId is required' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this dealer
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('dealer_id', dealerId)
      .eq('user_id', user.id)
      .single();
      
    if (memberError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all team members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('role')
      .order('created_at');

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    // Get user details for each member using admin client
    let membersWithUsers = members || [];
    try {
      const adminClient = createAdminClient();
      membersWithUsers = await Promise.all(
        (members || []).map(async (member) => {
          const { data: userData } = await adminClient.auth.admin.getUserById(member.user_id);
          return {
            ...member,
            user: userData?.user ? {
              email: userData.user.email,
              user_metadata: userData.user.user_metadata,
            } : undefined,
          };
        })
      );
    } catch (adminError) {
      console.warn('Could not fetch user details (admin client not configured):', adminError);
      // Continue without user details
    }

    // Get pending invitations (only if user can manage team)
    let invitations: TeamInvitation[] = [];
    if (membership.role === 'owner' || membership.role === 'admin') {
      const { data: invitationsData } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('dealer_id', dealerId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
        
      invitations = invitationsData || [];
    }

    return NextResponse.json({
      members: membersWithUsers,
      invitations,
      currentUserRole: membership.role,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
