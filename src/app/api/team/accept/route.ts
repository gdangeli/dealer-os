import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { acceptInvitation } from '@/lib/team';

// POST /api/team/accept - Accept team invitation
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Accept the invitation
    const member = await acceptInvitation(token, user.id);

    return NextResponse.json({ 
      success: true,
      member,
      message: 'Successfully joined the team'
    });
  } catch (error) {
    console.error('Accept error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/team/accept?token=xxx - Get invitation details (for preview)
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Get invitation details (public, no auth required)
    const { data: invitation, error } = await supabase
      .from('team_invitations')
      .select(`
        id,
        email,
        role,
        expires_at,
        dealer:dealers(company_name)
      `)
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();
      
    if (error || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Supabase join returns array or object depending on relationship
    const dealerData = invitation.dealer;
    const companyName = Array.isArray(dealerData) 
      ? dealerData[0]?.company_name 
      : (dealerData as { company_name: string } | null)?.company_name;
    
    return NextResponse.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expires_at,
        companyName: companyName ?? null,
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
