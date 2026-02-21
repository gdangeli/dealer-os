import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Quote, QuoteItem, getCustomerDisplayName, getQuoteStatusLabel, getQuoteStatusColor, formatCHF, toCHF } from '@/types/billing';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  DocumentCurrencyEuroIcon,
  CheckIcon,
  XMarkIcon,
  CloudIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { QuoteActions } from './QuoteActions';
import { getCurrentDealer, getImpersonationInfo } from '@/lib/auth/get-current-dealer';

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const supabase = await createClient();
  const t = await getTranslations('quotes');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get dealer with impersonation support
  const dealer = await getCurrentDealer();
  if (!dealer) {
    redirect('/login');
  }

  // Check if impersonating - use admin client to bypass RLS
  const impersonation = await getImpersonationInfo();
  const queryClient = impersonation ? createAdminClient() : supabase;

  // Fetch quote with customer and items
  const { data: quote, error } = await queryClient
    .from('quotes')
    .select(`
      *,
      customer:customers(*),
      items:quote_items(*)
    `)
    .eq('id', id)
    .eq('dealer_id', dealer.id)
    .single();

  if (error || !quote) {
    notFound();
  }

  const items = (quote.items || []).sort((a: QuoteItem, b: QuoteItem) => a.position - b.position);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/dashboard/quotes`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {quote.quote_number}
              </h1>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQuoteStatusColor(quote.status)}`}>
                {getQuoteStatusLabel(quote.status)}
              </span>
            </div>
            <p className="text-gray-600">
              {quote.customer ? getCustomerDisplayName(quote.customer) : 'Kein Kunde'}
            </p>
          </div>
        </div>

        {/* Bexio sync status */}
        {quote.bexio_offer_id && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CloudIcon className="w-4 h-4" />
            Bexio #{quote.bexio_offer_id}
          </div>
        )}
      </div>

      {/* Actions */}
      <QuoteActions quote={quote} locale={locale} />

      {/* Quote Details */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Customer Info */}
        {quote.customer && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Kunde</h3>
            <p className="font-medium">{getCustomerDisplayName(quote.customer)}</p>
            {quote.customer.street && (
              <p className="text-gray-600">{quote.customer.street}</p>
            )}
            {quote.customer.postal_code && (
              <p className="text-gray-600">
                {quote.customer.postal_code} {quote.customer.city}
              </p>
            )}
            {quote.customer.email && (
              <p className="text-gray-600">{quote.customer.email}</p>
            )}
          </div>
        )}

        {/* Items */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">{t('positions')}</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="pb-2">Pos</th>
                <th className="pb-2">Bezeichnung</th>
                <th className="pb-2 text-right">Menge</th>
                <th className="pb-2 text-right">Preis</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item: QuoteItem) => (
                <tr key={item.id}>
                  <td className="py-2 text-gray-500">{item.position}</td>
                  <td className="py-2">
                    <p className="font-medium">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500">{item.description}</p>
                    )}
                  </td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{formatCHF(item.unit_price)}</td>
                  <td className="py-2 text-right font-medium">{formatCHF(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="max-w-xs ml-auto space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t('subtotal')}</span>
              <span>{formatCHF(quote.subtotal)}</span>
            </div>
            {quote.discount_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>{t('discount')} ({quote.discount_percent}%)</span>
                <span>- {formatCHF(quote.discount_amount)}</span>
              </div>
            )}
            {quote.trade_in_value > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t('tradeIn')}</span>
                <span>- {formatCHF(quote.trade_in_value)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>{t('vat')} ({quote.vat_rate}%)</span>
              <span>{formatCHF(quote.vat_amount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>{t('total')}</span>
              <span>{formatCHF(quote.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trade-in Details */}
      {quote.trade_in_value > 0 && quote.trade_in_description && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t('tradeIn')}</h3>
          <p className="font-medium">{quote.trade_in_description}</p>
          <p className="text-green-600 font-medium">{formatCHF(quote.trade_in_value)}</p>
        </div>
      )}

      {/* Notes */}
      <div className="grid grid-cols-2 gap-4">
        {quote.internal_notes && (
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">{t('internalNotes')}</h3>
            <p className="text-yellow-900 whitespace-pre-wrap">{quote.internal_notes}</p>
          </div>
        )}
        {quote.customer_notes && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('customerNotes')}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.customer_notes}</p>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-500">
        <div className="flex gap-6">
          <div>
            <span className="font-medium">Erstellt:</span>{' '}
            {new Date(quote.created_at).toLocaleString('de-CH')}
          </div>
          {quote.valid_until && (
            <div>
              <span className="font-medium">{t('validUntil')}:</span>{' '}
              {new Date(quote.valid_until).toLocaleDateString('de-CH')}
            </div>
          )}
          {quote.sent_at && (
            <div>
              <span className="font-medium">Gesendet:</span>{' '}
              {new Date(quote.sent_at).toLocaleString('de-CH')}
            </div>
          )}
          {quote.accepted_at && (
            <div>
              <span className="font-medium">Angenommen:</span>{' '}
              {new Date(quote.accepted_at).toLocaleString('de-CH')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
