import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Customer, getCustomerDisplayName } from '@/types/billing';
import { PlusIcon, MagnifyingGlassIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; location?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const t = await getTranslations('customers');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const page = parseInt(params.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = params.search || '';

  const locationFilter = params.location;
  
  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('dealer_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`
    );
  }

  // Filter nach Standort
  if (locationFilter && locationFilter !== 'all') {
    query = query.eq('location_id', locationFilter);
  }

  const { data: customers, count } = await query;
  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/customers/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          {t('newCustomer')}
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <form>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </form>
      </div>

      {/* Customers List */}
      {customers && customers.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('phone')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('city')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('createdAt')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer: Customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/dashboard/customers/${customer.id}`} className="flex items-center">
                      {customer.customer_type === 'company' ? (
                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/dashboard/customers/${customer.id}`} className="block">
                      <div className="font-medium text-gray-900">
                        {getCustomerDisplayName(customer)}
                      </div>
                      {customer.customer_type === 'company' && (
                        <div className="text-sm text-gray-500">
                          {customer.first_name} {customer.last_name}
                        </div>
                      )}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {customer.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {customer.phone || customer.mobile || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {customer.city ? `${customer.postal_code} ${customer.city}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                    {new Date(customer.created_at).toLocaleDateString('de-CH')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {count} Kunden total
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/dashboard/customers?page=${page - 1}${search ? `&search=${search}` : ''}${locationFilter ? `&location=${locationFilter}` : ''}`}
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
                    href={`/dashboard/customers?page=${page + 1}${search ? `&search=${search}` : ''}${locationFilter ? `&location=${locationFilter}` : ''}`}
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
          <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noCustomers')}</h3>
          <p className="text-gray-500 mb-6">{t('noCustomersDesc')}</p>
          <Link
            href="/dashboard/customers/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            {t('newCustomer')}
          </Link>
        </div>
      )}
    </div>
  );
}
