'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Quote, QuoteFormData, QuoteItemFormData, QuoteItemType, Customer, formatCHF, toRappen, toCHF, getCustomerDisplayName } from '@/types/billing';
import { useTranslations } from 'next-intl';
import { PlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
}

interface QuoteFormProps {
  quote?: Quote;
  initialCustomerId?: string;
  initialVehicleId?: string;
  onSuccess?: (quote: Quote) => void;
}

const ITEM_TYPES: { value: QuoteItemType; label: string }[] = [
  { value: 'vehicle', label: 'Fahrzeug' },
  { value: 'accessory', label: 'Zubehör' },
  { value: 'service', label: 'Dienstleistung' },
  { value: 'warranty', label: 'Garantie' },
  { value: 'discount', label: 'Rabatt' },
  { value: 'other', label: 'Sonstiges' },
];

const DEFAULT_ITEM: QuoteItemFormData = {
  item_type: 'vehicle',
  title: '',
  description: '',
  quantity: 1,
  unit_price: 0,
  discount_percent: 0,
};

export function QuoteForm({ quote, initialCustomerId, initialVehicleId, onSuccess }: QuoteFormProps) {
  const router = useRouter();
  const t = useTranslations('quotes');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer selection
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Vehicle selection for quick add
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Form data
  const [items, setItems] = useState<QuoteItemFormData[]>(
    quote?.items?.map(item => ({
      item_type: item.item_type,
      title: item.title,
      description: item.description || '',
      quantity: item.quantity,
      unit_price: toCHF(item.unit_price),
      discount_percent: item.discount_percent,
      vehicle_id: item.vehicle_id || undefined,
    })) || [{ ...DEFAULT_ITEM }]
  );

  const [validUntil, setValidUntil] = useState(
    quote?.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [discountPercent, setDiscountPercent] = useState(quote?.discount_percent || 0);
  const [tradeInValue, setTradeInValue] = useState(quote ? toCHF(quote.trade_in_value) : 0);
  const [tradeInDescription, setTradeInDescription] = useState(quote?.trade_in_description || '');
  const [internalNotes, setInternalNotes] = useState(quote?.internal_notes || '');
  const [customerNotes, setCustomerNotes] = useState(quote?.customer_notes || '');

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      const res = await fetch(`/api/customers?search=${customerSearch}&limit=10`);
      const data = await res.json();
      setCustomers(data.customers || []);
    };
    loadCustomers();
  }, [customerSearch]);

  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      const res = await fetch('/api/vehicles?status=available&limit=50');
      const data = await res.json();
      setVehicles(data.vehicles || []);
    };
    loadVehicles();
  }, []);

  // Load initial customer
  useEffect(() => {
    if (initialCustomerId || quote?.customer_id) {
      const customerId = initialCustomerId || quote?.customer_id;
      fetch(`/api/customers/${customerId}`)
        .then(res => res.json())
        .then(data => setSelectedCustomer(data.customer));
    }
  }, [initialCustomerId, quote?.customer_id]);

  // Add vehicle as item
  useEffect(() => {
    if (initialVehicleId && vehicles.length > 0) {
      const vehicle = vehicles.find(v => v.id === initialVehicleId);
      if (vehicle && items.length === 1 && !items[0].title) {
        setItems([{
          item_type: 'vehicle',
          title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
          description: `${vehicle.mileage.toLocaleString('de-CH')} km`,
          quantity: 1,
          unit_price: vehicle.price,
          discount_percent: 0,
          vehicle_id: vehicle.id,
        }]);
      }
    }
  }, [initialVehicleId, vehicles]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.unit_price * item.quantity * (1 - (item.discount_percent || 0) / 100);
    return sum + itemTotal;
  }, 0);

  const discountAmount = subtotal * (discountPercent / 100);
  const netAmount = subtotal - discountAmount - tradeInValue;
  const vatAmount = netAmount * 0.081;
  const total = netAmount + vatAmount;

  const handleAddItem = () => {
    setItems([...items, { ...DEFAULT_ITEM }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof QuoteItemFormData, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddVehicle = (vehicle: Vehicle) => {
    const newItem: QuoteItemFormData = {
      item_type: 'vehicle',
      title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      description: `${vehicle.mileage.toLocaleString('de-CH')} km`,
      quantity: 1,
      unit_price: vehicle.price,
      discount_percent: 0,
      vehicle_id: vehicle.id,
    };
    
    // Replace empty first item or add new
    if (items.length === 1 && !items[0].title) {
      setItems([newItem]);
    } else {
      setItems([...items, newItem]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      setError('Bitte wählen Sie einen Kunden');
      return;
    }

    if (items.some(item => !item.title || item.unit_price <= 0)) {
      setError('Alle Positionen müssen einen Titel und Preis haben');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData: QuoteFormData = {
        customer_id: selectedCustomer.id,
        valid_until: validUntil,
        discount_percent: discountPercent,
        trade_in_value: tradeInValue,
        trade_in_description: tradeInDescription || undefined,
        internal_notes: internalNotes || undefined,
        customer_notes: customerNotes || undefined,
        items,
      };

      const url = quote ? `/api/quotes/${quote.id}` : '/api/quotes';
      const method = quote ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern');
      }

      if (onSuccess) {
        onSuccess(data.quote);
      } else {
        router.push(`/dashboard/quotes/${data.quote.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Customer Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('customer')} *
        </label>
        
        {selectedCustomer ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{getCustomerDisplayName(selectedCustomer)}</p>
              {selectedCustomer.email && (
                <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              Ändern
            </button>
          </div>
        ) : (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              placeholder="Kunde suchen..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {showCustomerDropdown && customers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowCustomerDropdown(false);
                      setCustomerSearch('');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    <p className="font-medium">{getCustomerDisplayName(customer)}</p>
                    {customer.email && (
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Vehicle */}
      {vehicles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fahrzeug hinzufügen
          </label>
          <div className="flex gap-2 flex-wrap">
            {vehicles.slice(0, 5).map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => handleAddVehicle(vehicle)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                {vehicle.brand} {vehicle.model}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700">{t('positions')}</label>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <PlusIcon className="w-4 h-4" />
            {t('addPosition')}
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="col-span-2">
                <select
                  value={item.item_type}
                  onChange={(e) => handleItemChange(index, 'item_type', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                >
                  {ITEM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                  placeholder="Bezeichnung"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                  min="0.01"
                  step="0.01"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  placeholder="Preis"
                  min="0"
                  step="0.01"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right"
                />
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="text-sm font-medium">
                  {(item.unit_price * item.quantity * (1 - (item.discount_percent || 0) / 100)).toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade-in */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('tradeIn')}</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              value={tradeInValue || ''}
              onChange={(e) => setTradeInValue(parseFloat(e.target.value) || 0)}
              placeholder="Eintauschwert CHF"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <input
              type="text"
              value={tradeInDescription}
              onChange={(e) => setTradeInDescription(e.target.value)}
              placeholder="Beschreibung (z.B. VW Golf 2018)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t('subtotal')}</span>
            <span>{subtotal.toLocaleString('de-CH', { minimumFractionDigits: 2 })} CHF</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between text-red-600">
              <span>{t('discount')} ({discountPercent}%)</span>
              <span>- {discountAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })} CHF</span>
            </div>
          )}
          {tradeInValue > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{t('tradeIn')}</span>
              <span>- {tradeInValue.toLocaleString('de-CH', { minimumFractionDigits: 2 })} CHF</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span>Netto</span>
            <span>{netAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })} CHF</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>{t('vat')} (8.1%)</span>
            <span>{vatAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })} CHF</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>{t('total')}</span>
            <span>{total.toLocaleString('de-CH', { minimumFractionDigits: 2 })} CHF</span>
          </div>
        </div>
      </div>

      {/* Validity & Discount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('validUntil')}</label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('discount')} (%)</label>
          <input
            type="number"
            value={discountPercent || ''}
            onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('internalNotes')}</label>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={3}
            placeholder="Nur intern sichtbar..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('customerNotes')}</label>
          <textarea
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            rows={3}
            placeholder="Wird auf der Offerte angezeigt..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Speichern...' : quote ? 'Aktualisieren' : 'Offerte erstellen'}
        </button>
      </div>
    </form>
  );
}
