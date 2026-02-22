import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Datenschutzerklärung - Dealer OS',
    description: 'Datenschutzerklärung von Dealer OS - Erfahren Sie, wie wir Ihre Daten schützen. DSGVO-konforme Datenverarbeitung mit Swiss Hosting. Ihre Rechte und unsere Verpflichtungen.',
    alternates: {
      canonical: `https://www.dealeros.ch/${locale}/datenschutz`,
      languages: {
        de: 'https://www.dealeros.ch/de/datenschutz',
        en: 'https://www.dealeros.ch/en/datenschutz',
        fr: 'https://www.dealeros.ch/fr/datenschutz',
        it: 'https://www.dealeros.ch/it/datenschutz',
      },
    },
    openGraph: {
      title: 'Datenschutzerklärung - Dealer OS',
      description: 'Datenschutzerklärung von Dealer OS - Erfahren Sie, wie wir Ihre Daten schützen.',
      url: `https://www.dealeros.ch/${locale}/datenschutz`,
      images: [{ url: 'https://www.dealeros.ch/images/og-default.png', width: 1200, height: 630 }],
    },
  };
}

export default async function DatenschutzPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-slate-800">
            🚗 Dealer<span className="text-blue-600">OS</span>
          </Link>
          <Link href="/" className="text-slate-600 hover:text-slate-800">← Zurück</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">Datenschutzerklärung</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Allgemeine Hinweise</h2>
            <p className="text-slate-600 mb-4">
              Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Diese 
              Datenschutzerklärung informiert Sie über die Erhebung, Verarbeitung und 
              Nutzung Ihrer personenbezogenen Daten bei der Nutzung von dealeros.ch.
            </p>
            <p className="text-slate-600">
              Verantwortlich für die Datenverarbeitung ist:<br />
              Dealer OS<br />
              Lochwisstrasse 3<br />
              CH-8185 Winkel<br />
              E-Mail: <a href="mailto:support@dealeros.ch" className="text-blue-600 hover:underline">support@dealeros.ch</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Erhebung und Verarbeitung von Daten</h2>
            <p className="text-slate-600 mb-4">Wir erheben und verarbeiten folgende Daten:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li><strong>Registrierungsdaten:</strong> Firmenname, E-Mail-Adresse, Passwort bei der Kontoerstellung</li>
              <li><strong>Fahrzeugdaten:</strong> Informationen zu Ihrem Fahrzeugbestand (Marke, Modell, Preis, Fotos)</li>
              <li><strong>Kundendaten (Leads):</strong> Von Ihnen erfasste Kundenanfragen und Kontaktdaten</li>
              <li><strong>Zahlungsdaten:</strong> Werden direkt von unserem Zahlungsdienstleister Stripe verarbeitet</li>
              <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Typ, Zugriffszeiten (für Sicherheit und Fehleranalyse)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Ihre Rechte</h2>
            <p className="text-slate-600 mb-4">Nach dem Schweizer Datenschutzgesetz (DSG) haben Sie folgende Rechte:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li><strong>Auskunftsrecht:</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen</li>
              <li><strong>Berichtigungsrecht:</strong> Sie können die Korrektur falscher Daten verlangen</li>
              <li><strong>Löschungsrecht:</strong> Sie können die Löschung Ihrer Daten verlangen</li>
              <li><strong>Datenportabilität:</strong> Sie können Ihre Daten in einem gängigen Format erhalten</li>
            </ul>
            <p className="text-slate-600 mt-4">
              Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter:{' '}
              <a href="mailto:support@dealeros.ch" className="text-blue-600 hover:underline">support@dealeros.ch</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Änderungen dieser Datenschutzerklärung</h2>
            <p className="text-slate-600">
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. 
              Die aktuelle Version ist stets auf unserer Website verfügbar.
            </p>
          </section>
        </div>

        <p className="text-slate-500 text-sm mt-8 text-center">Stand: Februar 2026</p>
      </main>

      <footer className="bg-slate-800 text-slate-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">© 2026 dealeros.ch — Made with ❤️ in Switzerland 🇨🇭</p>
        </div>
      </footer>
    </div>
  );
}
