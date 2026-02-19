import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/team/invitations/[id] - Cancel invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invitationId } = await params;
    
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the invitation
    const { data: invitation, error: invError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();
      
    if (invError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if current user has permission (must be owner or admin of the dealer)
    const { data: currentMembership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('dealer_id', invitation.dealer_id)
      .eq('user_id', user.id)
      .single();
      
    if (memberError || !currentMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    if (!['owner', 'admin'].includes(currentMembership.role)) {
      return NextResponse.json(
        { error: 'Only owners and admins can cancel invitations' },
        { status: 403 }
      );
    }

    // Delete the invitation
    const { error: deleteError } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', invitationId);
      
    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
