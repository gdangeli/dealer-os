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
    title: "Kontakt - Dealer OS",
    description: "Kontaktieren Sie das Dealer OS Team. Wir helfen Ihnen gerne bei Fragen zur Garagensoftware für Schweizer Autohändler. E-Mail, Telefon oder Live-Chat.",
    alternates: {
      canonical: `https://www.dealeros.ch/${locale}/kontakt`,
      languages: {
        de: "https://www.dealeros.ch/de/kontakt",
        en: "https://www.dealeros.ch/en/kontakt",
        fr: "https://www.dealeros.ch/fr/kontakt",
        it: "https://www.dealeros.ch/it/kontakt",
      },
    },
    openGraph: {
      title: "Kontakt - Dealer OS",
      description: "Kontaktieren Sie das Dealer OS Team für Fragen zur Garagensoftware.",
      url: `https://www.dealeros.ch/${locale}/kontakt`,
      images: [{ url: "https://www.dealeros.ch/images/og-default.png", width: 1200, height: 630 }],
    },
  };
}
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Building2,
} from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function KontaktPage({ params }: Props) {
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
              <Badge variant="outline" className="mb-4">Kontakt</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                Sprechen Sie{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">
                  mit uns
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Haben Sie Fragen zu Dealer OS? Wir freuen uns auf Ihre Nachricht 
                und antworten in der Regel innerhalb von 24 Stunden.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info + Form */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
              
              {/* Contact Info */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">E-Mail</h3>
                        <p className="text-slate-600">info@dealer-os.ch</p>
                        <p className="text-slate-600">support@dealer-os.ch</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">Telefon</h3>
                        <p className="text-slate-600">+41 44 123 45 67</p>
                        <p className="text-sm text-slate-500 mt-1">Mo-Fr, 08:00-18:00</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">Adresse</h3>
                        <p className="text-slate-600">
                          Dealer OS AG<br />
                          Musterstrasse 123<br />
                          8000 Zürich<br />
                          Schweiz
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">Öffnungszeiten</h3>
                        <p className="text-slate-600">
                          Montag - Freitag<br />
                          08:00 - 18:00 Uhr
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-slate-200">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Nachricht senden</h2>
                    
                    <form className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Vorname *</Label>
                          <Input id="firstName" placeholder="Max" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nachname *</Label>
                          <Input id="lastName" placeholder="Muster" required />
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email">E-Mail *</Label>
                          <Input id="email" type="email" placeholder="max@garage.ch" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefon</Label>
                          <Input id="phone" type="tel" placeholder="+41 79 123 45 67" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company">Firma / Garage</Label>
                        <Input id="company" placeholder="Garage Muster AG" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject">Betreff *</Label>
                        <Input id="subject" placeholder="Wie können wir Ihnen helfen?" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Nachricht *</Label>
                        <Textarea 
                          id="message" 
                          placeholder="Ihre Nachricht an uns..."
                          rows={5}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" id="privacy" className="rounded border-slate-300" required />
                        <label htmlFor="privacy">
                          Ich akzeptiere die <a href="/datenschutz" className="text-sky-600 hover:underline">Datenschutzerklärung</a>
                        </label>
                      </div>
                      
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Nachricht senden
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section (Placeholder) */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-200 rounded-2xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600">Karte: Zürich, Schweiz</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alternative Contact */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <MessageCircle className="h-12 w-12 text-sky-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Lieber direkt sprechen?</h2>
              <p className="text-slate-600 mb-6">
                Rufen Sie uns an oder starten Sie einen Live-Chat in Ihrem Dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  +41 44 123 45 67
                </Button>
                <Button size="lg" className="bg-gradient-to-r from-sky-500 to-indigo-600">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Live-Chat starten
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
