import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createInvitation, getTeamMemberCount } from '@/lib/team';
import { getPlanLimits, PlanId } from '@/lib/stripe/config';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// POST /api/team/invite - Send team invitation
export async function POST(request: NextRequest) {
  try {
    const { dealerId, email, role } = await request.json();
    
    if (!dealerId || !email || !role) {
      return NextResponse.json(
        { error: 'dealerId, email, and role are required' },
        { status: 400 }
      );
    }
    
    // Validate role
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

    // Check if user has permission to invite (owner or admin)
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('dealer_id', dealerId)
      .eq('user_id', user.id)
      .single();
      
    if (memberError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    if (!['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and admins can invite team members' },
        { status: 403 }
      );
    }

    // Get dealer info for plan limits and email
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('company_name, subscription_plan')
      .eq('id', dealerId)
      .single();
      
    if (dealerError || !dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
    }

    // Check plan limits (count current members + pending invitations)
    const currentCount = await getTeamMemberCount(dealerId);
    const { count: invitationCount } = await supabase
      .from('team_invitations')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString());
      
    const totalPending = currentCount + (invitationCount || 0);
    const limits = getPlanLimits(dealer.subscription_plan as PlanId);
    
    if (limits.users !== -1 && totalPending >= limits.users) {
      return NextResponse.json(
        { error: `Team member limit reached (${limits.users} users for ${dealer.subscription_plan} plan)` },
        { status: 400 }
      );
    }

    // Create invitation
    const invitation = await createInvitation(dealerId, email, role, user.id);
    
    // Send invitation email
    if (resend && process.env.RESEND_FROM_EMAIL) {
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealeros.ch'}/invite/${invitation.token}`;
      
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: email,
          subject: `Einladung zum Team von ${dealer.company_name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Team-Einladung</h2>
              <p>Sie wurden eingeladen, dem Team von <strong>${dealer.company_name}</strong> auf DealerOS beizutreten.</p>
              <p>Rolle: <strong>${role === 'admin' ? 'Administrator' : role === 'member' ? 'Mitarbeiter' : 'Betrachter'}</strong></p>
              <p style="margin: 30px 0;">
                <a href="${inviteUrl}" style="background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Einladung annehmen
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                Diese Einladung ist 7 Tage gültig.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">DealerOS – Das Betriebssystem für Autohändler</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the request, invitation is still created
      }
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Invite error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
