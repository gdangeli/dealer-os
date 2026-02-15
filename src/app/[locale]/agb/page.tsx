import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: 'Allgemeine Geschäftsbedingungen (AGB)',
  description: 'AGB von Dealer OS - Nutzungsbedingungen für die Händlersoftware',
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AGBPage({ params }: Props) {
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
        <h1 className="text-4xl font-bold text-slate-800 mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8">
          <p className="text-slate-600 mb-8">
            Dealer OS<br />
            Lochwisstrasse 3<br />
            CH-8185 Winkel<br />
            E-Mail: <a href="mailto:support@dealeros.ch" className="text-blue-600 hover:underline">support@dealeros.ch</a>
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Geltungsbereich</h2>
              <p className="text-slate-600">
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Dienstleistungen, 
                die über dealeros.ch (nachfolgend &quot;Anbieter&quot;) angeboten werden.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Leistungsbeschreibung</h2>
              <p className="text-slate-600 mb-4">
                Dealer OS bietet eine cloudbasierte Software-Lösung für Autohändler und Garagisten. 
                Der Dienst umfasst:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Verwaltung des Fahrzeugbestands (Erfassung, Bearbeitung, Status-Tracking)</li>
                <li>Lead-Management (Erfassung und Verwaltung von Kundenanfragen)</li>
                <li>Dashboard mit Kennzahlen und Auswertungen</li>
                <li>Optionale Integration mit Drittplattformen (AutoScout24, mobile.de)</li>
                <li>Preiskalkulation und Margenberechnung</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Vertragsschluss und Registrierung</h2>
              <p className="text-slate-600 mb-4">
                Mit der Registrierung eines Benutzerkontos kommt ein Nutzungsvertrag zustande. 
                Der Nutzer versichert, dass alle angegebenen Daten korrekt sind und er zur 
                Vertretung des angegebenen Unternehmens berechtigt ist.
              </p>
              <p className="text-slate-600">
                Der Nutzer ist für die Geheimhaltung seiner Zugangsdaten verantwortlich und 
                haftet für alle Aktivitäten, die unter seinem Konto vorgenommen werden.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Abonnement und Preise</h2>
              <p className="text-slate-600 mb-4">
                Die Nutzung von Dealer OS erfolgt über ein monatliches Abonnement:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Die aktuellen Preise sind auf der Website unter &quot;Preise&quot; ersichtlich</li>
                <li>Die Abrechnung erfolgt monatlich im Voraus</li>
                <li>Das Abonnement verlängert sich automatisch, sofern nicht gekündigt</li>
                <li>Eine Kündigung ist jederzeit zum Ende der laufenden Abrechnungsperiode möglich</li>
                <li>Preisänderungen werden mindestens 30 Tage im Voraus angekündigt</li>
              </ul>
              <p className="text-slate-600 mt-4">
                Alle Preise verstehen sich in Schweizer Franken (CHF) und zuzüglich der 
                gesetzlichen Mehrwertsteuer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">14. Anwendbares Recht und Gerichtsstand</h2>
              <p className="text-slate-600 mb-4">
                Es gilt ausschliesslich Schweizer Recht unter Ausschluss des UN-Kaufrechts 
                und der Kollisionsnormen.
              </p>
              <p className="text-slate-600">
                Gerichtsstand ist Bülach, Schweiz.
              </p>
            </section>
          </div>
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
