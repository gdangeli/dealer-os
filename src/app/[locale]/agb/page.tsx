import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'AGB - Dealer OS',
    description: 'Allgemeine Geschäftsbedingungen von Dealer OS - Nutzungsbedingungen, Abonnement, Preise und Vertragsbedingungen für die Schweizer Garagensoftware.',
    alternates: {
      canonical: `https://www.dealeros.ch/${locale}/agb`,
      languages: {
        de: 'https://www.dealeros.ch/de/agb',
        en: 'https://www.dealeros.ch/en/agb',
        fr: 'https://www.dealeros.ch/fr/agb',
        it: 'https://www.dealeros.ch/it',
        sr: 'https://www.dealeros.ch/sr/agb',
      },
    },
    openGraph: {
      title: 'AGB - Dealer OS',
      description: 'Allgemeine Geschäftsbedingungen von Dealer OS für die Schweizer Garagensoftware.',
      url: `https://www.dealeros.ch/${locale}/agb`,
      images: [{ url: 'https://www.dealeros.ch/images/og-default.png', width: 1200, height: 630 }],
    },
  };
}

export default async function AGBPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
          
          <div className="bg-slate-50 rounded-2xl p-8">
            <p className="text-slate-600 mb-8">
              Dealer OS<br />
              Lochwisstrasse 3<br />
              CH-8185 Winkel<br />
              E-Mail: <a href="mailto:support@dealeros.ch" className="text-sky-600 hover:underline">support@dealeros.ch</a>
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Geltungsbereich</h2>
                <p className="text-slate-600">
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Dienstleistungen, 
                  die über dealeros.ch (nachfolgend &quot;Anbieter&quot;) angeboten werden.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Leistungsbeschreibung</h2>
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
                <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Vertragsschluss und Registrierung</h2>
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
                <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Abonnement und Preise</h2>
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
                <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Datenschutz</h2>
                <p className="text-slate-600">
                  Die Verarbeitung personenbezogener Daten erfolgt gemäss unserer Datenschutzerklärung 
                  und dem schweizerischen Datenschutzgesetz (DSG). Weitere Informationen finden Sie 
                  in unserer <a href="/datenschutz" className="text-sky-600 hover:underline">Datenschutzerklärung</a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Haftung</h2>
                <p className="text-slate-600 mb-4">
                  Der Anbieter haftet nur für Schäden, die auf Vorsatz oder grobe Fahrlässigkeit 
                  zurückzuführen sind. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen.
                </p>
                <p className="text-slate-600">
                  Der Anbieter übernimmt keine Haftung für Datenverlust. Der Nutzer ist selbst 
                  für regelmässige Datensicherungen verantwortlich.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Anwendbares Recht und Gerichtsstand</h2>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
