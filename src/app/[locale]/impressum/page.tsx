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
    title: 'Impressum - Dealer OS',
    description: 'Impressum und rechtliche Informationen zu Dealer OS - der Garagensoftware für Schweizer Autohändler. Kontaktadresse, verantwortliche Person und Haftungsausschluss.',
    alternates: {
      canonical: `https://www.dealeros.ch/${locale}/impressum`,
      languages: {
        de: 'https://www.dealeros.ch/de/impressum',
        en: 'https://www.dealeros.ch/en/impressum',
        fr: 'https://www.dealeros.ch/fr/impressum',
        it: 'https://www.dealeros.ch/it',
        sr: 'https://www.dealeros.ch/sr/impressum',
      },
    },
    openGraph: {
      title: 'Impressum - Dealer OS',
      description: 'Impressum und rechtliche Informationen zu Dealer OS - der Garagensoftware für Schweizer Autohändler.',
      url: `https://www.dealeros.ch/${locale}/impressum`,
      images: [{ url: 'https://www.dealeros.ch/images/og-default.png', width: 1200, height: 630 }],
    },
  };
}

export default async function ImpressumPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Impressum</h1>
          
          <div className="bg-slate-50 rounded-2xl p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Kontaktadresse</h2>
              <p className="text-slate-600">
                Dealer OS<br />
                Lochwisstrasse 3<br />
                CH-8185 Winkel<br />
                Schweiz
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Kontakt</h2>
              <p className="text-slate-600">
                E-Mail: <a href="mailto:support@dealeros.ch" className="text-sky-600 hover:underline">support@dealeros.ch</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Verantwortliche Person</h2>
              <p className="text-slate-600">L. D&apos;Angeli</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Haftungsausschluss</h2>
              <p className="text-slate-600 mb-4">
                Der Autor übernimmt keine Gewähr für die Richtigkeit, Genauigkeit, Aktualität, 
                Zuverlässigkeit und Vollständigkeit der Informationen.
              </p>
              <p className="text-slate-600 mb-4">
                Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, 
                die aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten 
                Informationen, durch Missbrauch der Verbindung oder durch technische Störungen 
                entstanden sind, werden ausgeschlossen.
              </p>
              <p className="text-slate-600">
                Alle Angebote sind freibleibend. Der Autor behält es sich ausdrücklich vor, 
                Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, 
                zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Haftungsausschluss für Links</h2>
              <p className="text-slate-600">
                Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres 
                Verantwortungsbereichs. Es wird jegliche Verantwortung für solche Webseiten 
                abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene 
                Gefahr des jeweiligen Nutzers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Urheberrechte</h2>
              <p className="text-slate-600">
                Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen 
                Dateien auf dieser Website gehören ausschliesslich dealeros.ch oder den speziell 
                genannten Rechteinhabern. Für die Reproduktion jeglicher Elemente ist die 
                schriftliche Zustimmung des Urheberrechtsträgers im Voraus einzuholen.
              </p>
            </section>
          </div>

          <p className="text-slate-500 text-sm mt-8 text-center">Stand: Februar 2026</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
