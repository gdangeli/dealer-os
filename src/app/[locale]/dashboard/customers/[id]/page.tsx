import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { Customer, getCustomerDisplayName } from '@/types/billing';
import { 
  ArrowLeftIcon, 
  TrashIcon,
  DocumentTextIcon,
  DocumentCurrencyEuroIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { getCurrentDealer, getImpersonationInfo } from '@/lib/auth/get-current-dealer';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const supabase = await createClient();
  const t = await getTranslations('customers');

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

  // Fetch customer
  const { data: customer, error } = await queryClient
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('dealer_id', dealer.id)
    .single();

  if (error || !customer) {
    notFound();
  }

  // Fetch quote and invoice counts
  const [{ count: quoteCount }, { count: invoiceCount }] = await Promise.all([
    queryClient
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', id),
    queryClient
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', id),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/dashboard/customers`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {getCustomerDisplayName(customer as Customer)}
            </h1>
            {customer.customer_type === 'company' && (
              <p className="text-gray-600">
                {customer.first_name} {customer.last_name}
              </p>
            )}
          </div>
        </div>
        
        {/* Bexio sync status */}
        {customer.bexio_contact_id && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CloudIcon className="w-4 h-4" />
            {t('bexioSynced')}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{quoteCount || 0}</p>
              <p className="text-sm text-gray-500">Offerten</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DocumentCurrencyEuroIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{invoiceCount || 0}</p>
              <p className="text-sm text-gray-500">Rechnungen</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm text-gray-500">{t('createdAt')}</p>
              <p className="font-medium text-gray-900">
                {new Date(customer.created_at).toLocaleDateString('de-CH')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          href={`/${locale}/dashboard/quotes/new?customer=${id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <DocumentTextIcon className="w-4 h-4" />
          Neue Offerte
        </Link>
        <Link
          href={`/${locale}/dashboard/invoices/new?customer=${id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <DocumentCurrencyEuroIcon className="w-4 h-4" />
          Neue Rechnung
        </Link>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('editCustomer')}</h2>
        <CustomerForm customer={customer as Customer} />
      </div>

      {/* Delete Zone */}
      {(quoteCount === 0 || quoteCount === null) && (invoiceCount === 0 || invoiceCount === null) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Gefahrenzone</h3>
          <p className="text-red-600 mb-4">{t('deleteWarning')}</p>
          <form action={`/api/customers/${id}`} method="DELETE">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <TrashIcon className="w-4 h-4" />
              Kunde löschen
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
