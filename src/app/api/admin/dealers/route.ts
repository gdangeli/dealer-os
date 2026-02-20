import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/dealers - Create a new dealer manually
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, contact_name, email, plan } = body;

    // Validate required fields
    if (!company_name || !email || !plan) {
      return NextResponse.json(
        { error: 'company_name, email and plan are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate plan
    const validPlans = ['beta', 'starter', 'pro', 'business', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: ' + validPlans.join(', ') },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
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
      return NextResponse.json(
        { error: 'Only platform admins can create dealers' },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    // Check if email already exists
    const { data: existingDealer } = await adminClient
      .from('dealers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingDealer) {
      return NextResponse.json(
        { error: 'A dealer with this email already exists' },
        { status: 409 }
      );
    }

    // Create the dealer
    const { data: newDealer, error: createError } = await adminClient
      .from('dealers')
      .insert({
        company_name: company_name.trim(),
        contact_name: contact_name?.trim() || null,
        email: email.toLowerCase().trim(),
        subscription_plan: plan,
        subscription_status: 'active',
        status: 'pending',
        onboarding_completed: false,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating dealer:', createError);
      return NextResponse.json(
        { error: 'Failed to create dealer: ' + createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dealer: newDealer,
    });
  } catch (error) {
    console.error('Create dealer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
