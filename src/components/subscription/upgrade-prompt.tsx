'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface UpgradePromptProps {
  feature: string;
  description?: string;
  variant?: 'card' | 'inline' | 'banner';
  showPrice?: boolean;
}

export function UpgradePrompt({ 
  feature, 
  description,
  variant = 'card',
  showPrice = true,
}: UpgradePromptProps) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
        <Lock className="h-4 w-4" />
        <span>{feature} erfordert ein Upgrade.</span>
        <Link href="/dashboard/settings/billing">
          <Button variant="link" size="sm" className="h-auto p-0 text-amber-700 font-semibold">
            Jetzt upgraden
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{feature}</p>
            {description && <p className="text-sm text-sky-100">{description}</p>}
          </div>
        </div>
        <Link href="/dashboard/settings/billing">
          <Button variant="secondary" className="bg-white text-sky-700 hover:bg-sky-50">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </Link>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Crown className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{feature}</CardTitle>
            {description && (
              <CardDescription className="text-amber-700">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showPrice && (
          <p className="text-sm text-slate-600 mb-4">
            Ab <span className="font-semibold">CHF 149/Monat</span> · 14 Tage gratis testen
          </p>
        )}
        <Link href="/dashboard/settings/billing">
          <Button className="w-full bg-amber-600 hover:bg-amber-700">
            <Sparkles className="h-4 w-4 mr-2" />
            Pläne ansehen
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

interface LimitReachedProps {
  limit: string;
  current: number;
  max: number;
}

export function LimitReached({ limit, current, max }: LimitReachedProps) {
  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-2 rounded-lg">
            <Lock className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-900">Limit erreicht</p>
            <p className="text-sm text-red-700">
              Sie haben {current} von {max} {limit} verwendet.
            </p>
          </div>
        </div>
        <Link href="/dashboard/settings/billing">
          <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-100">
            Upgrade für mehr {limit}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
