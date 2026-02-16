import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, getStripePriceId, PlanId } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get dealer profile
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (dealerError || !dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { plan, interval = 'monthly' } = body as { plan: PlanId; interval: 'monthly' | 'yearly' };

    // Validate plan
    const priceId = getStripePriceId(plan, interval);
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or pricing not configured' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId = dealer.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dealer.email,
        name: dealer.company_name,
        metadata: {
          dealer_id: dealer.id,
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from('dealers')
        .update({ stripe_customer_id: customerId })
        .eq('id', dealer.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?canceled=true`,
      subscription_data: {
        metadata: {
          dealer_id: dealer.id,
          plan: plan,
        },
        trial_period_days: 14, // 14-day free trial
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      locale: 'de',
      tax_id_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
