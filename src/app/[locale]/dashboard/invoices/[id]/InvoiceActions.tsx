'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    if (!confirm('Möchten Sie diese Rechnung wirklich löschen?')) return;
    
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
            Als gesendet markieren
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
            Zahlung erfassen
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
            Vollständig bezahlt
          </button>
        )}

        {/* Send Reminder - for overdue */}
        {invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' && (
          <button
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <BellAlertIcon className="w-4 h-4" />
            Mahnung senden
          </button>
        )}

        {/* PDF Download - always available */}
        <button
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          PDF
        </button>

        {/* Delete - only for drafts */}
        {invoice.status === 'draft' && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            Löschen
          </button>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Zahlung erfassen</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Betrag (CHF)
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
                  Offen: CHF {toCHF(openAmount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum
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
                  Zahlungsart
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="bank_transfer">Banküberweisung</option>
                  <option value="cash">Barzahlung</option>
                  <option value="card">Karte</option>
                  <option value="twint">TWINT</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referenz (optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="z.B. Transaktionsnummer"
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
                {isLoading ? 'Speichern...' : 'Zahlung speichern'}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
