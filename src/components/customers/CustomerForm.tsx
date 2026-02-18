'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, CustomerFormData, CustomerType, Salutation } from '@/types/billing';
import { useTranslations } from 'next-intl';

interface CustomerFormProps {
  customer?: Customer;
  onSuccess?: (customer: Customer) => void;
  onCancel?: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const router = useRouter();
  const t = useTranslations('customers');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CustomerFormData>({
    customer_type: customer?.customer_type || 'private',
    company_name: customer?.company_name || '',
    salutation: customer?.salutation || null,
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    mobile: customer?.mobile || '',
    street: customer?.street || '',
    postal_code: customer?.postal_code || '',
    city: customer?.city || '',
    country: customer?.country || 'CH',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = customer ? `/api/customers/${customer.id}` : '/api/customers';
      const method = customer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save customer');
      }

      if (onSuccess) {
        onSuccess(data.customer);
      } else {
        router.push('/dashboard/customers');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CustomerFormData, value: string | CustomerType | Salutation) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Customer Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('type')}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="customer_type"
              value="private"
              checked={formData.customer_type === 'private'}
              onChange={(e) => handleChange('customer_type', e.target.value as CustomerType)}
              className="mr-2"
            />
            {t('private')}
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="customer_type"
              value="company"
              checked={formData.customer_type === 'company'}
              onChange={(e) => handleChange('customer_type', e.target.value as CustomerType)}
              className="mr-2"
            />
            {t('company')}
          </label>
        </div>
      </div>

      {/* Company Name (if company) */}
      {formData.customer_type === 'company' && (
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('companyName')} *
          </label>
          <input
            type="text"
            id="company_name"
            value={formData.company_name || ''}
            onChange={(e) => handleChange('company_name', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Salutation & Name */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="salutation" className="block text-sm font-medium text-gray-700 mb-1">
            {t('salutation')}
          </label>
          <select
            id="salutation"
            value={formData.salutation || ''}
            onChange={(e) => handleChange('salutation', e.target.value as Salutation || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-</option>
            <option value="Herr">Herr</option>
            <option value="Frau">Frau</option>
            {formData.customer_type === 'company' && <option value="Firma">Firma</option>}
          </select>
        </div>
        <div className="md:col-span-1">
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('firstName')} *
          </label>
          <input
            type="text"
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('lastName')} *
          </label>
          <input
            type="text"
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('email')}
          </label>
          <input
            type="email"
            id="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            {t('phone')}
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
            {t('mobile')}
          </label>
          <input
            type="tel"
            id="mobile"
            value={formData.mobile || ''}
            onChange={(e) => handleChange('mobile', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            {t('street')}
          </label>
          <input
            type="text"
            id="street"
            value={formData.street || ''}
            onChange={(e) => handleChange('street', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
            {t('postalCode')}
          </label>
          <input
            type="text"
            id="postal_code"
            value={formData.postal_code || ''}
            onChange={(e) => handleChange('postal_code', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            {t('city')}
          </label>
          <input
            type="text"
            id="city"
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            {t('country')}
          </label>
          <select
            id="country"
            value={formData.country || 'CH'}
            onChange={(e) => handleChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="CH">Schweiz</option>
            <option value="DE">Deutschland</option>
            <option value="AT">Österreich</option>
            <option value="FR">Frankreich</option>
            <option value="IT">Italien</option>
            <option value="LI">Liechtenstein</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {t('cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? t('saving') : customer ? t('save') : t('create')}
        </button>
      </div>
    </form>
  );
}
