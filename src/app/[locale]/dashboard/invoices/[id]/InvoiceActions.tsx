'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Invoice, InvoiceStatus, PaymentMethod, toCHF } from '@/types/billing';
import { 
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
  CheckIcon,
  TrashIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

interface InvoiceActionsProps {
  invoice: Invoice;
  locale: string;
  openAmount: number;
}

export function InvoiceActions({ invoice, locale, openAmount }: InvoiceActionsProps) {
  const router = useRouter();
  const t = useTranslations('invoices');
  const tBilling = useTranslations('billing');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(toCHF(openAmount));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');

  const updateStatus = async (newStatus: InvoiceStatus) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recordPayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment: {
            amount: paymentAmount,
            payment_date: paymentDate,
            payment_method: paymentMethod,
            reference: paymentReference || null,
          }
        }),
      });

      if (res.ok) {
        setShowPaymentModal(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push(`/${locale}/dashboard/invoices`);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Send - for drafts */}
        {invoice.status === 'draft' && (
          <button
            onClick={() => updateStatus('sent')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            {t('send')}
          </button>
        )}

        {/* Record Payment - for sent/partial invoices */}
        {(invoice.status === 'sent' || invoice.status === 'partial') && openAmount > 0 && (
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CurrencyDollarIcon className="w-4 h-4" />
            {t('recordPayment')}
          </button>
        )}

        {/* Mark as Paid - shortcut for full payment */}
        {(invoice.status === 'sent' || invoice.status === 'partial') && openAmount > 0 && (
          <button
            onClick={() => updateStatus('paid')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckIcon className="w-4 h-4" />
            {t('markAsPaid')}
          </button>
        )}

        {/* Send Reminder - for overdue */}
        {invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' && (
          <button
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <BellAlertIcon className="w-4 h-4" />
            {t('sendReminder')}
          </button>
        )}

        {/* PDF Download - always available */}
        <a
          href={`/api/invoices/${invoice.id}/pdf`}
          download
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          PDF
        </a>

        {/* Delete - only for drafts */}
        {invoice.status === 'draft' && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            {t('delete')}
          </button>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t('recordPayment')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('paymentAmount')} (CHF)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  min="0.01"
                  step="0.01"
                  max={toCHF(openAmount)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('openAmount')}: CHF {toCHF(openAmount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('paymentDate')}
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('paymentMethod')}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="bank_transfer">{tBilling('paymentMethods.bank_transfer')}</option>
                  <option value="cash">{tBilling('paymentMethods.cash')}</option>
                  <option value="card">{tBilling('paymentMethods.card')}</option>
                  <option value="twint">{tBilling('paymentMethods.twint')}</option>
                  <option value="other">{tBilling('paymentMethods.other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reference')}
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={recordPayment}
                disabled={isLoading || paymentAmount <= 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {t('save')}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
