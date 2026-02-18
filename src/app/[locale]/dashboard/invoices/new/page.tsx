'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Quote, getCustomerDisplayName, formatCHF } from '@/types/billing';

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quote');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [acceptedQuotes, setAcceptedQuotes] = useState<Quote[]>([]);

  // Load quote if ID provided
  useEffect(() => {
    if (quoteId) {
      fetch(`/api/quotes/${quoteId}`)
        .then(res => res.json())
        .then(data => setQuote(data.quote))
        .catch(err => setError('Offerte nicht gefunden'));
    }
  }, [quoteId]);

  // Load accepted quotes for selection
  useEffect(() => {
    fetch('/api/quotes?status=accepted')
      .then(res => res.json())
      .then(data => setAcceptedQuotes(data.quotes || []));
  }, []);

  const handleCreateFromQuote = async (selectedQuoteId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_id: selectedQuoteId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Rechnung');
      }

      router.push(`/dashboard/invoices/${data.invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  // If quote ID provided, show confirmation
  if (quoteId && quote) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/invoices"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rechnung aus Offerte erstellen</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{quote.quote_number}</h3>
              {quote.customer && (
                <p className="text-gray-600">{getCustomerDisplayName(quote.customer)}</p>
              )}
              <p className="text-2xl font-bold mt-2">{formatCHF(quote.total)}</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Was passiert:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Neue Rechnung mit allen Positionen wird erstellt</li>
              <li>✓ Zahlungsziel: 30 Tage</li>
              <li>✓ Offerte wird als "Verrechnet" markiert</li>
            </ul>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => handleCreateFromQuote(quote.id)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Wird erstellt...' : 'Rechnung erstellen'}
            </button>
            <Link
              href="/dashboard/invoices"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Abbrechen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show list of accepted quotes to convert
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/invoices"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neue Rechnung</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-4">Aus angenommener Offerte erstellen</h2>
        
        {acceptedQuotes.length > 0 ? (
          <div className="space-y-3">
            {acceptedQuotes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{q.quote_number}</p>
                  {q.customer && (
                    <p className="text-sm text-gray-600">{getCustomerDisplayName(q.customer)}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{formatCHF(q.total)}</span>
                  <button
                    onClick={() => handleCreateFromQuote(q.id)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Rechnung erstellen
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Keine angenommenen Offerten vorhanden</p>
            <Link
              href="/dashboard/quotes"
              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
            >
              Zu den Offerten →
            </Link>
          </div>
        )}
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>Tipp: Erstellen Sie zuerst eine Offerte und markieren Sie diese als "Angenommen"</p>
      </div>
    </div>
  );
}
