import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/team/members/[id] - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;
    const { role } = await request.json();
    
    if (!role) {
      return NextResponse.json({ error: 'role is required' }, { status: 400 });
    }
    
    // Validate role (can't set to owner via this endpoint)
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, member, or viewer' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the member to update
    const { data: targetMember, error: targetError } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .single();
      
    if (targetError || !targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    // Can't change owner's role
    if (targetMember.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot change owner role. Use transfer ownership instead.' },
        { status: 400 }
      );
    }

    // Check if current user has permission (must be owner or admin of same dealer)
    const { data: currentMembership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('dealer_id', targetMember.dealer_id)
      .eq('user_id', user.id)
      .single();
      
    if (memberError || !currentMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    if (!['owner', 'admin'].includes(currentMembership.role)) {
      return NextResponse.json(
        { error: 'Only owners and admins can update roles' },
        { status: 403 }
      );
    }
    
    // Admins can't promote others to admin
    if (currentMembership.role === 'admin' && role === 'admin') {
      return NextResponse.json(
        { error: 'Only owners can promote to admin' },
        { status: 403 }
      );
    }

    // Update the role
    const { data: updated, error: updateError } = await supabase
      .from('team_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single();
      
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/team/members/[id] - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;
    
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the member to delete
    const { data: targetMember, error: targetError } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .single();
      
    if (targetError || !targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    // Can't remove owner
    if (targetMember.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove owner. Transfer ownership first.' },
        { status: 400 }
      );
    }

    // Check if current user has permission
    const { data: currentMembership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('dealer_id', targetMember.dealer_id)
      .eq('user_id', user.id)
      .single();
      
    if (memberError || !currentMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Users can remove themselves, owners can remove anyone, admins can remove members/viewers
    const canRemove = 
      targetMember.user_id === user.id || // Self-removal
      currentMembership.role === 'owner' || // Owner can remove anyone
      (currentMembership.role === 'admin' && ['member', 'viewer'].includes(targetMember.role)); // Admin can remove lower roles
      
    if (!canRemove) {
      return NextResponse.json(
        { error: 'You do not have permission to remove this member' },
        { status: 403 }
      );
    }

    // Delete the member
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);
      
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
