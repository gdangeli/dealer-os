import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type MetaProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Hilfe & Support - Dealer OS",
    description: "Finden Sie Antworten auf Ihre Fragen zu Dealer OS. Anleitungen, FAQs und direkter Kontakt zu unserem Support-Team für Schweizer Autohändler.",
    alternates: {
      canonical: `https://www.dealeros.ch/${locale}/hilfe`,
      languages: {
        de: "https://www.dealeros.ch/de/hilfe",
        en: "https://www.dealeros.ch/en/hilfe",
        fr: "https://www.dealeros.ch/fr/hilfe",
        it: "https://www.dealeros.ch/it",
        sr: "https://www.dealeros.ch/sr/hilfe",
      },
    },
    openGraph: {
      title: "Hilfe & Support - Dealer OS",
      description: "Finden Sie Antworten auf Ihre Fragen zu Dealer OS.",
      url: `https://www.dealeros.ch/${locale}/hilfe`,
      images: [{ url: "https://www.dealeros.ch/images/og-default.png", width: 1200, height: 630 }],
    },
  };
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  Video,
  FileText,
  HelpCircle,
  Zap,
  Users,
  Clock,
  ArrowRight,
  Search,
} from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HilfePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4">Hilfe & Support</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                Wie können wir{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">
                  Ihnen helfen?
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Finden Sie schnell Antworten auf Ihre Fragen oder kontaktieren Sie unser Support-Team.
              </p>
              
              {/* Search Box */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Suchen Sie nach Anleitungen, FAQs..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 border-b border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Erste Schritte</h3>
                  <p className="text-sm text-slate-600">Schnellstart-Anleitung für neue Benutzer</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Video className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Video-Tutorials</h3>
                  <p className="text-sm text-slate-600">Schritt-für-Schritt Anleitungen</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <HelpCircle className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">FAQ</h3>
                  <p className="text-sm text-slate-600">Häufig gestellte Fragen</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Live-Chat</h3>
                  <p className="text-sm text-slate-600">Direkt mit uns sprechen</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Häufig gestellte Fragen</h2>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="text-lg font-medium flex items-center justify-between">
                      Wie importiere ich meine Fahrzeuge?
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-slate-600">
                    Sie können Fahrzeuge einzeln erfassen oder via CSV/Excel importieren. 
                    Gehen Sie zu Fahrzeuge → Import und laden Sie Ihre Datei hoch.
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="text-lg font-medium flex items-center justify-between">
                      Wie verbinde ich AutoScout24?
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-slate-600">
                    Unter Einstellungen → Integrationen können Sie Ihr AutoScout24-Konto verknüpfen. 
                    Sie benötigen Ihre Händler-ID und API-Zugangsdaten.
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="text-lg font-medium flex items-center justify-between">
                      Kann ich mein Abo jederzeit kündigen?
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-slate-600">
                    Ja, Sie können Ihr Abonnement jederzeit zum Ende der Laufzeit kündigen. 
                    Es gibt keine Mindestvertragslaufzeit.
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="text-lg font-medium flex items-center justify-between">
                      Wo werden meine Daten gespeichert?
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-slate-600">
                    Alle Daten werden ausschliesslich in der Schweiz gespeichert (Swiss Hosting). 
                    Wir sind vollständig DSGVO-konform.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Support kontaktieren</h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">E-Mail Support</h3>
                  <p className="text-slate-600 mb-4">support@dealer-os.ch</p>
                  <p className="text-sm text-slate-500">Antwort innerhalb von 24h</p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-sky-200 bg-sky-50/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Telefon Support</h3>
                  <p className="text-slate-600 mb-4">+41 44 123 45 67</p>
                  <p className="text-sm text-slate-500">Mo-Fr, 08:00-18:00 Uhr</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Live Chat</h3>
                  <p className="text-slate-600 mb-4">Direkt im Dashboard</p>
                  <p className="text-sm text-slate-500">Sofortige Hilfe</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Noch Fragen?</h2>
              <p className="text-slate-600 mb-8">
                Unser Team hilft Ihnen gerne weiter. Kontaktieren Sie uns!
              </p>
              <Button size="lg" asChild className="bg-gradient-to-r from-sky-500 to-indigo-600">
                <Link href="/kontakt">
                  Kontakt aufnehmen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
