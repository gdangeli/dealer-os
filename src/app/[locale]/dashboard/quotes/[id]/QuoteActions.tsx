'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Quote, QuoteStatus } from '@/types/billing';
import { 
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  DocumentCurrencyEuroIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface QuoteActionsProps {
  quote: Quote;
  locale: string;
}

export function QuoteActions({ quote, locale }: QuoteActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (newStatus: QuoteStatus) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
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

  const handleDelete = async () => {
    if (!confirm('Möchten Sie diese Offerte wirklich löschen?')) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push(`/${locale}/dashboard/quotes`);
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToInvoice = async () => {
    // TODO: Implement convert to invoice
    router.push(`/${locale}/dashboard/invoices/new?quote=${quote.id}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Edit - only for drafts */}
      {quote.status === 'draft' && (
        <button
          onClick={() => router.push(`/${locale}/dashboard/quotes/${quote.id}/edit`)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <PencilIcon className="w-4 h-4" />
          Bearbeiten
        </button>
      )}

      {/* Send - for drafts */}
      {quote.status === 'draft' && (
        <button
          onClick={() => updateStatus('sent')}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          Als gesendet markieren
        </button>
      )}

      {/* Accept/Reject - for sent quotes */}
      {quote.status === 'sent' && (
        <>
          <button
            onClick={() => updateStatus('accepted')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CheckIcon className="w-4 h-4" />
            Angenommen
          </button>
          <button
            onClick={() => updateStatus('rejected')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <XMarkIcon className="w-4 h-4" />
            Abgelehnt
          </button>
        </>
      )}

      {/* Convert to invoice - for accepted quotes */}
      {quote.status === 'accepted' && (
        <button
          onClick={convertToInvoice}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          <DocumentCurrencyEuroIcon className="w-4 h-4" />
          In Rechnung umwandeln
        </button>
      )}

      {/* PDF Download - always available */}
      <a
        href={`/api/quotes/${quote.id}/pdf`}
        download
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
      >
        <DocumentArrowDownIcon className="w-4 h-4" />
        PDF
      </a>

      {/* Delete - only for drafts */}
      {quote.status === 'draft' && (
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
  );
}
