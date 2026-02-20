import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Invoice, InvoiceItem, Payment, getCustomerDisplayName, getInvoiceStatusLabel, getInvoiceStatusColor, formatCHF } from '@/types/billing';
import { ArrowLeftIcon, CloudIcon } from '@heroicons/react/24/outline';
import { InvoiceActions } from './InvoiceActions';

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const supabase = await createClient();
  const t = await getTranslations('invoices');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch invoice with customer, items, and payments
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(*),
      items:invoice_items(*),
      payments(*)
    `)
    .eq('id', id)
    .eq('dealer_id', user.id)
    .single();

  if (error || !invoice) {
    notFound();
  }

  const items = (invoice.items || []).sort((a: InvoiceItem, b: InvoiceItem) => a.position - b.position);
  const payments = (invoice.payments || []).sort((a: Payment, b: Payment) => 
    new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
  );
  
  const openAmount = invoice.total - invoice.paid_amount;
  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/dashboard/invoices`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {invoice.invoice_number}
              </h1>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                isOverdue ? 'bg-red-100 text-red-800' : getInvoiceStatusColor(invoice.status)
              }`}>
                {isOverdue ? 'Überfällig' : getInvoiceStatusLabel(invoice.status)}
              </span>
            </div>
            <p className="text-gray-600">
              {invoice.customer ? getCustomerDisplayName(invoice.customer) : 'Kein Kunde'}
            </p>
          </div>
        </div>

        {/* Bexio sync status */}
        {invoice.bexio_invoice_id && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CloudIcon className="w-4 h-4" />
            Bexio #{invoice.bexio_invoice_id}
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{formatCHF(invoice.total)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('paidAmount')}</p>
          <p className="text-2xl font-bold text-green-600">{formatCHF(invoice.paid_amount)}</p>
        </div>
        <div className={`rounded-lg border p-4 ${openAmount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
          <p className="text-sm text-gray-500">{t('openAmount')}</p>
          <p className={`text-2xl font-bold ${openAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {formatCHF(openAmount)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <InvoiceActions invoice={invoice} locale={locale} openAmount={openAmount} />

      {/* Invoice Details */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Customer Info */}
        {invoice.customer && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Kunde</h3>
            <p className="font-medium">{getCustomerDisplayName(invoice.customer)}</p>
            {invoice.customer.street && (
              <p className="text-gray-600">{invoice.customer.street}</p>
            )}
            {invoice.customer.postal_code && (
              <p className="text-gray-600">
                {invoice.customer.postal_code} {invoice.customer.city}
              </p>
            )}
          </div>
        )}

        {/* Items */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Positionen</h3>
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
              {items.map((item: InvoiceItem) => (
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
              <span>Zwischensumme</span>
              <span>{formatCHF(invoice.subtotal)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Rabatt</span>
                <span>- {formatCHF(invoice.discount_amount)}</span>
              </div>
            )}
            {invoice.trade_in_value > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Eintausch</span>
                <span>- {formatCHF(invoice.trade_in_value)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>MwSt. ({invoice.vat_rate}%)</span>
              <span>{formatCHF(invoice.vat_amount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>{formatCHF(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payments History */}
      {payments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Zahlungen</h3>
          <div className="space-y-3">
            {payments.map((payment: Payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-green-600">+ {formatCHF(payment.amount)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.payment_date).toLocaleDateString('de-CH')}
                    {payment.payment_method && ` · ${payment.payment_method}`}
                  </p>
                </div>
                {payment.reference && (
                  <span className="text-sm text-gray-500">{payment.reference}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-500">
        <div className="flex gap-6 flex-wrap">
          <div>
            <span className="font-medium">{t('invoiceDate')}:</span>{' '}
            {new Date(invoice.invoice_date).toLocaleDateString('de-CH')}
          </div>
          {invoice.due_date && (
            <div className={isOverdue ? 'text-red-600' : ''}>
              <span className="font-medium">{t('dueDate')}:</span>{' '}
              {new Date(invoice.due_date).toLocaleDateString('de-CH')}
              {isOverdue && ' (Überfällig!)'}
            </div>
          )}
          {invoice.sent_at && (
            <div>
              <span className="font-medium">Gesendet:</span>{' '}
              {new Date(invoice.sent_at).toLocaleString('de-CH')}
            </div>
          )}
          {invoice.paid_at && (
            <div className="text-green-600">
              <span className="font-medium">Bezahlt:</span>{' '}
              {new Date(invoice.paid_at).toLocaleString('de-CH')}
            </div>
          )}
          {invoice.quote_id && (
            <div>
              <span className="font-medium">Aus Offerte:</span>{' '}
              <Link href={`/${locale}/dashboard/quotes/${invoice.quote_id}`} className="text-blue-600 hover:underline">
                anzeigen
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
