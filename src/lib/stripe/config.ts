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
// NEW PRICING (Feb 2026):
// - Starter: FREE (10 vehicles, 1 user)
// - Professional: 129 CHF/month (unlimited vehicles, 1 user)
// - Business: 229 CHF/month (unlimited vehicles, 3 users, Bexio)
// - Enterprise: Custom pricing (unlimited everything, white-label)
export const PLANS = {
  starter: {
    name: 'Starter',
    description: 'Gratis für immer',
    priceMonthly: 0,
    priceYearly: 0,
    limits: {
      vehicles: 10 as number,
      users: 1 as number,
      channels: 2 as number,
    },
    features: [
      'Bis 10 Fahrzeuge',
      '1 Benutzer',
      'Standzeit-Tracking',
      'Basis-CRM',
      'E-Mail Support',
    ],
    stripePriceIdMonthly: null, // Free tier, no Stripe
    stripePriceIdYearly: null,
  },
  pro: {
    name: 'Professional',
    description: 'Für aktive Händler',
    priceMonthly: 129,
    priceYearly: 1290, // ~2 months free
    limits: {
      vehicles: -1 as number, // unlimited
      users: 1 as number,
      channels: -1 as number, // unlimited
    },
    features: [
      'Unbegrenzte Fahrzeuge',
      '1 Benutzer',
      'Alle Inserate-Kanäle',
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
    description: 'Für Teams',
    priceMonthly: 229,
    priceYearly: 2290, // ~2 months free
    limits: {
      vehicles: -1 as number, // unlimited
      users: 3 as number,
      channels: -1 as number, // unlimited
    },
    features: [
      'Unbegrenzte Fahrzeuge',
      '3 Benutzer',
      'Bexio-Integration',
      'Multi-Standort',
      'Team-Auswertungen',
      'API-Zugang',
      'Priority Support',
    ],
    stripePriceIdMonthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Für Händlergruppen',
    priceMonthly: null, // Custom pricing
    priceYearly: null,
    limits: {
      vehicles: -1 as number, // unlimited
      users: -1 as number, // unlimited
      channels: -1 as number, // unlimited
    },
    features: [
      'Unbegrenzte Fahrzeuge',
      'Unbegrenzte Benutzer',
      'Custom Integrationen',
      'White-Label Option',
      'SLA 99.9% Uptime',
      'Dedicated Manager',
      'API-Zugang',
    ],
    stripePriceIdMonthly: null, // Custom pricing, no Stripe self-service
    stripePriceIdYearly: null,
  },
  beta: {
    name: 'Beta',
    description: 'Legacy Beta-Zugang',
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
