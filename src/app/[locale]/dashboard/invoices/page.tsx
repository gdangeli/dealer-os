import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Invoice, getCustomerDisplayName, getInvoiceStatusLabel, getInvoiceStatusColor, formatCHF } from '@/types/billing';
import { PlusIcon, DocumentCurrencyEuroIcon } from '@heroicons/react/24/outline';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const t = await getTranslations('invoices');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const page = parseInt(params.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  const status = params.status || '';

  let query = supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(id, first_name, last_name, company_name, customer_type)
    `, { count: 'exact' })
    .eq('dealer_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: invoices, count } = await query;
  const totalPages = Math.ceil((count || 0) / limit);

  const statusFilters = [
    { value: '', label: 'Alle' },
    { value: 'draft', label: 'Entwürfe' },
    { value: 'sent', label: 'Gesendet' },
    { value: 'partial', label: 'Teilbezahlt' },
    { value: 'paid', label: 'Bezahlt' },
    { value: 'overdue', label: 'Überfällig' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          {t('newInvoice')}
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((filter) => (
          <Link
            key={filter.value}
            href={`/dashboard/invoices${filter.value ? `?status=${filter.value}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              status === filter.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Invoices List */}
      {invoices && invoices.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('invoiceNumber')}
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kunde
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('paidAmount')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dueDate')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice: Invoice & { customer: any }) => {
                  const isOverdue = invoice.due_date && 
                    new Date(invoice.due_date) < new Date() && 
                    invoice.status !== 'paid' && 
                    invoice.status !== 'cancelled';
                  
                  return (
                    <tr
                      key={invoice.id}
                      className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <Link href={`/dashboard/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                          {invoice.invoice_number}
                        </Link>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          {invoice.customer ? getCustomerDisplayName(invoice.customer) : '-'}
                        </Link>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-medium">
                        {formatCHF(invoice.total)}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <span className={invoice.paid_amount > 0 ? 'text-green-600' : 'text-gray-400'}>
                          {formatCHF(invoice.paid_amount)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isOverdue ? 'bg-red-100 text-red-800' : getInvoiceStatusColor(invoice.status)
                        }`}>
                          {isOverdue ? 'Überfällig' : getInvoiceStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-gray-500">
                        {invoice.due_date 
                          ? new Date(invoice.due_date).toLocaleDateString('de-CH')
                          : '-'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {count} Rechnungen total
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/dashboard/invoices?page=${page - 1}${status ? `&status=${status}` : ''}`}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Zurück
                  </Link>
                )}
                <span className="px-3 py-1 text-gray-600">
                  Seite {page} von {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/dashboard/invoices?page=${page + 1}${status ? `&status=${status}` : ''}`}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Weiter
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <DocumentCurrencyEuroIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noInvoices')}</h3>
          <p className="text-gray-500 mb-6">{t('noInvoicesDesc')}</p>
          <Link
            href="/dashboard/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            {t('newInvoice')}
          </Link>
        </div>
      )}
    </div>
  );
}
