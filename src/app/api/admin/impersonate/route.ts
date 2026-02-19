import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/admin/impersonate - Start impersonating a dealer
export async function POST(request: NextRequest) {
  try {
    const { dealerId } = await request.json();
    
    if (!dealerId) {
      return NextResponse.json({ error: 'dealerId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is platform admin
    const { data: isAdmin } = await supabase
      .from('platform_admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Only platform admins can impersonate' }, { status: 403 });
    }

    // Verify the dealer exists
    const adminClient = createAdminClient();
    const { data: dealer, error: dealerError } = await adminClient
      .from('dealers')
      .select('id, company_name')
      .eq('id', dealerId)
      .single();

    if (dealerError || !dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
    }

    // Set impersonation cookie
    const cookieStore = await cookies();
    cookieStore.set('impersonating_dealer_id', dealerId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4, // 4 hours
    });
    
    // Also store the original admin user ID
    cookieStore.set('original_admin_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4,
    });

    return NextResponse.json({ 
      success: true, 
      dealer: {
        id: dealer.id,
        company_name: dealer.company_name,
      }
    });
  } catch (error) {
    console.error('Impersonate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/impersonate - Stop impersonating
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    
    // Clear impersonation cookies
    cookieStore.delete('impersonating_dealer_id');
    cookieStore.delete('original_admin_id');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Exit impersonate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
