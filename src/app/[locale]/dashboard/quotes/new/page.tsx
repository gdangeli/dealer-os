import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string; vehicle?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const t = await getTranslations('quotes');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/quotes"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{t('newQuote')}</h1>
        </div>
      </div>

      {/* Form */}
      <QuoteForm 
        initialCustomerId={params.customer}
        initialVehicleId={params.vehicle}
      />
    </div>
  );
}
