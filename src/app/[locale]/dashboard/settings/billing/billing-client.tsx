'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, CreditCard, AlertCircle, Loader2, ExternalLink, Crown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PLANS, PlanId } from '@/lib/stripe/config';
// Note: We use direct URL redirect instead of Stripe.js for checkout
import { Dealer } from '@/types/database';

interface BillingClientProps {
  dealer: Dealer;
}

export function BillingClient({ dealer }: BillingClientProps) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  // Show success/cancel messages from redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Zahlung erfolgreich!', {
        description: 'Ihr Abo wurde aktiviert. Vielen Dank!',
      });
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout abgebrochen', {
        description: 'Sie können jederzeit upgraden.',
      });
    }
  }, [searchParams]);

  const currentPlan = PLANS[dealer.subscription_plan as PlanId] || PLANS.beta;
  const isActive = dealer.subscription_status === 'active' || dealer.subscription_status === 'trialing';
  const isPastDue = dealer.subscription_status === 'past_due';

  async function handleUpgrade(plan: PlanId) {
    if (plan === 'beta') return;

    setLoading(plan);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval: billingInterval }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Fehler beim Checkout', {
        description: 'Bitte versuchen Sie es erneut.',
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleManageSubscription() {
    setLoading('manage');
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Fehler beim Öffnen des Kundenportals', {
        description: 'Bitte versuchen Sie es erneut.',
      });
    } finally {
      setLoading(null);
    }
  }

  function formatDate(dateString?: string) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Abonnement & Abrechnung</h1>
        <p className="text-slate-600">Verwalten Sie Ihr Abo und Ihre Zahlungsmethoden.</p>
      </div>

      {/* Payment Warning */}
      {isPastDue && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Zahlung fehlgeschlagen</AlertTitle>
          <AlertDescription>
            Die letzte Zahlung konnte nicht verarbeitet werden. Bitte aktualisieren Sie Ihre Zahlungsmethode.
            <Button variant="link" className="px-0 ml-2" onClick={handleManageSubscription}>
              Zahlungsmethode aktualisieren
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Aktuelles Abo
                {dealer.subscription_plan === 'beta' && (
                  <Badge variant="secondary" className="bg-sky-100 text-sky-700">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Beta
                  </Badge>
                )}
                {dealer.subscription_status === 'trialing' && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    Testphase
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {currentPlan.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {currentPlan.priceMonthly === null ? 'Auf Anfrage' : currentPlan.priceMonthly === 0 ? 'Gratis' : `CHF ${currentPlan.priceMonthly}`}
              </p>
              {currentPlan.priceMonthly !== null && currentPlan.priceMonthly > 0 && (
                <p className="text-sm text-slate-500">pro Monat</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 py-4 border-y">
            <div>
              <p className="text-sm text-slate-500">Fahrzeuge</p>
              <p className="text-lg font-semibold">
                {Number(currentPlan.limits.vehicles) === -1 ? 'Unbegrenzt' : `Bis ${currentPlan.limits.vehicles}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Benutzer</p>
              <p className="text-lg font-semibold">
                {Number(currentPlan.limits.users) === -1 ? 'Unbegrenzt' : currentPlan.limits.users}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Inserate-Kanäle</p>
              <p className="text-lg font-semibold">
                {Number(currentPlan.limits.channels) === -1 ? 'Unbegrenzt' : currentPlan.limits.channels}
              </p>
            </div>
          </div>
          {dealer.subscription_period_end && (
            <p className="mt-4 text-sm text-slate-500">
              {dealer.subscription_status === 'trialing'
                ? `Testphase endet am ${formatDate(dealer.subscription_period_end)}`
                : `Nächste Abrechnung: ${formatDate(dealer.subscription_period_end)}`}
            </p>
          )}
        </CardContent>
        {dealer.stripe_customer_id && (
          <CardFooter className="border-t pt-4">
            <Button variant="outline" onClick={handleManageSubscription} disabled={loading === 'manage'}>
              {loading === 'manage' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Abo verwalten
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Upgrade Plans */}
      {dealer.subscription_plan === 'beta' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Upgrade auf einen Premium-Plan
            </CardTitle>
            <CardDescription>
              Die Beta-Phase endet bald. Wählen Sie einen Plan, der zu Ihrer Garage passt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={billingInterval} onValueChange={(v) => setBillingInterval(v as 'monthly' | 'yearly')}>
              <div className="flex justify-center mb-6">
                <TabsList>
                  <TabsTrigger value="monthly">Monatlich</TabsTrigger>
                  <TabsTrigger value="yearly" className="relative">
                    Jährlich
                    <Badge className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5 bg-emerald-500">
                      -17%
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="monthly" className="mt-0">
                <PlanGrid
                  billingInterval="monthly"
                  currentPlan={dealer.subscription_plan}
                  loading={loading}
                  onUpgrade={handleUpgrade}
                />
              </TabsContent>
              <TabsContent value="yearly" className="mt-0">
                <PlanGrid
                  billingInterval="yearly"
                  currentPlan={dealer.subscription_plan}
                  loading={loading}
                  onUpgrade={handleUpgrade}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface PlanGridProps {
  billingInterval: 'monthly' | 'yearly';
  currentPlan: string;
  loading: string | null;
  onUpgrade: (plan: PlanId) => void;
}

function PlanGrid({ billingInterval, currentPlan, loading, onUpgrade }: PlanGridProps) {
  const plans: PlanId[] = ['starter', 'pro', 'business'];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {plans.map((planId) => {
        const plan = PLANS[planId];
        const priceMonthly = plan.priceMonthly ?? 0;
        const priceYearly = plan.priceYearly ?? 0;
        const price = billingInterval === 'monthly' ? priceMonthly : Math.round(priceYearly / 12);
        const isPopular = planId === 'pro';
        const isCurrent = planId === currentPlan;

        return (
          <Card key={planId} className={`relative ${isPopular ? 'border-sky-300 shadow-lg' : ''}`}>
            {isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-sky-600">Beliebt</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-2">
                <span className="text-3xl font-bold">CHF {price}</span>
                <span className="text-slate-500">/Mt.</span>
                {billingInterval === 'yearly' && priceYearly > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">
                    CHF {priceYearly}/Jahr (2 Monate gratis)
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${isPopular ? 'bg-sky-600 hover:bg-sky-700' : ''}`}
                variant={isPopular ? 'default' : 'outline'}
                disabled={isCurrent || loading === planId}
                onClick={() => onUpgrade(planId)}
              >
                {loading === planId ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {isCurrent ? 'Aktueller Plan' : '14 Tage gratis testen'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
