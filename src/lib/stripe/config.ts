import Stripe from 'stripe';

// Server-side Stripe instance (lazy initialization to avoid build-time errors)
let _stripe: Stripe | null = null;

export function getStripeInstance(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

// Export for backwards compatibility
export const stripe = {
  get customers() { return getStripeInstance().customers; },
  get checkout() { return getStripeInstance().checkout; },
  get billingPortal() { return getStripeInstance().billingPortal; },
  get webhooks() { return getStripeInstance().webhooks; },
  get subscriptions() { return getStripeInstance().subscriptions; },
};

// Subscription plan configuration
export const PLANS = {
  starter: {
    name: 'Starter',
    description: 'Für kleine Betriebe',
    priceMonthly: 149,
    priceYearly: 1490, // 2 months free
    limits: {
      vehicles: 20 as number,
      users: 2 as number,
      channels: 2 as number,
    },
    features: [
      'Bis 20 Fahrzeuge',
      '2 Benutzer',
      '2 Inserate-Kanäle',
      'Standzeit-Tracking',
      'Basis-CRM',
      'E-Mail Support',
    ],
    stripePriceIdMonthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
  },
  pro: {
    name: 'Professional',
    description: 'Für wachsende Händler',
    priceMonthly: 349,
    priceYearly: 3490, // 2 months free
    limits: {
      vehicles: 50 as number,
      users: 5 as number,
      channels: 5 as number,
    },
    features: [
      'Bis 50 Fahrzeuge',
      '5 Benutzer',
      '5 Inserate-Kanäle',
      'AI-Preisempfehlung',
      'WhatsApp Integration',
      'Vollständiges CRM',
      'Chat + E-Mail Support',
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
  business: {
    name: 'Business',
    description: 'Für grössere Betriebe',
    priceMonthly: 599,
    priceYearly: 5990, // 2 months free
    limits: {
      vehicles: 100 as number,
      users: 10 as number,
      channels: -1 as number, // unlimited
    },
    features: [
      'Bis 100 Fahrzeuge',
      '10 Benutzer',
      'Unbegrenzte Kanäle',
      'Multi-Standort',
      'Team-Auswertungen',
      'API-Zugang',
      'Priority Support',
    ],
    stripePriceIdMonthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
  },
  beta: {
    name: 'Beta',
    description: 'Gratis Beta-Zugang',
    priceMonthly: 0,
    priceYearly: 0,
    limits: {
      vehicles: 50 as number,
      users: 2 as number,
      channels: 2 as number,
    },
    features: [
      'Bis 50 Fahrzeuge',
      '2 Benutzer',
      '2 Inserate-Kanäle',
      'Alle Beta-Features',
    ],
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'paused' | null;

// Get plan limits for a dealer
export function getPlanLimits(plan: PlanId) {
  return PLANS[plan]?.limits || PLANS.beta.limits;
}

// Check if a feature/limit is available
export function isWithinLimit(plan: PlanId, feature: keyof typeof PLANS.starter.limits, current: number): boolean {
  const limits = getPlanLimits(plan);
  const limit = limits[feature];
  return limit === -1 || current < limit; // -1 means unlimited
}

// Get Stripe price ID for a plan
export function getStripePriceId(plan: PlanId, interval: 'monthly' | 'yearly'): string | null {
  const planConfig = PLANS[plan];
  if (!planConfig) return null;
  return interval === 'monthly' 
    ? planConfig.stripePriceIdMonthly || null
    : planConfig.stripePriceIdYearly || null;
}
