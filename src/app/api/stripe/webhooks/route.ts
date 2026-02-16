import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, PlanId } from '@/lib/stripe/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase admin client
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables not set');
    }
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabaseAdmin;
}

// Map Stripe price IDs to plan names
function getPlanFromPriceId(priceId: string): PlanId {
  const priceMap: Record<string, PlanId> = {
    [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!]: 'starter',
    [process.env.STRIPE_STARTER_YEARLY_PRICE_ID!]: 'starter',
    [process.env.STRIPE_PRO_MONTHLY_PRICE_ID!]: 'pro',
    [process.env.STRIPE_PRO_YEARLY_PRICE_ID!]: 'pro',
    [process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!]: 'business',
    [process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID!]: 'business',
  };
  return priceMap[priceId] || 'starter';
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);
  
  // Get period end - handle both expanded and non-expanded formats
  const periodEnd = (subscription as { current_period_end?: number }).current_period_end;

  // Update dealer subscription info
  const { error } = await getSupabaseAdmin()
    .from('dealers')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_plan: plan,
      subscription_status: subscription.status,
      subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Error updating dealer subscription:', error);
    throw error;
  }

  console.log(`Subscription ${subscription.id} updated: ${plan} (${subscription.status})`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Downgrade to beta plan when subscription is canceled
  const { error } = await getSupabaseAdmin()
    .from('dealers')
    .update({
      subscription_plan: 'beta',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      subscription_period_end: null,
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Error handling subscription deletion:', error);
    throw error;
  }

  console.log(`Subscription ${subscription.id} canceled for customer ${customerId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Invoice paid successfully - subscription is active
  console.log(`Invoice ${invoice.id} paid for customer ${invoice.customer}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Update subscription status to past_due
  const { error } = await getSupabaseAdmin()
    .from('dealers')
    .update({
      subscription_status: 'past_due',
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Error updating subscription status:', error);
  }

  // TODO: Send email notification about failed payment
  console.log(`Invoice payment failed for customer ${customerId}`);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'checkout.session.completed':
        // Session completed - subscription will be created separately
        console.log('Checkout session completed');
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Note: In App Router, we use request.text() to get raw body for webhook signature verification
// No special config needed - bodyParser is not used in App Router
