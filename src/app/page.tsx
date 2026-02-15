import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  BarChart3,
  Clock,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Check,
  ArrowRight,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28 lg:py-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
                🚀 Jetzt in der Beta – Kostenlos testen
              </Badge>
              
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Autohandel,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  vereinfacht.
                </span>
              </h1>
              
              <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Kennen Sie Ihren Gewinn pro Fahrzeug. Erkennen Sie Langsteher sofort. 
                Treffen Sie datenbasierte Entscheidungen – mit der Software für Schweizer Autohändler.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="h-12 px-8 text-base">
                  <Link href="/register">
                    Kostenlos starten
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                  <Link href="#features">Features entdecken</Link>
                </Button>
              </div>
              
              <p className="mt-6 text-sm text-slate-500">
                Keine Kreditkarte erforderlich · 14 Tage kostenlos testen
              </p>
            </div>
            
            {/* Dashboard Preview */}
            <div className="mt-16 sm:mt-20 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-3xl" />
              <div className="relative bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-800">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-slate-500">dealeros.ch/dashboard</span>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Fahrzeuge</p>
                      <p className="text-2xl font-bold text-white mt-1">24</p>
                      <p className="text-xs text-green-400 mt-1">+3 diese Woche</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Ø Standzeit</p>
                      <p className="text-2xl font-bold text-white mt-1">42 Tage</p>
                      <p className="text-xs text-green-400 mt-1">-8 vs. letzter Monat</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Offene Leads</p>
                      <p className="text-2xl font-bold text-white mt-1">12</p>
                      <p className="text-xs text-yellow-400 mt-1">3 unbeantwortet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 border-y border-slate-200 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">50+</p>
                <p className="text-sm text-slate-600 mt-1">Garagen in der Beta</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-slate-300" />
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">2'000+</p>
                <p className="text-sm text-slate-600 mt-1">Fahrzeuge verwaltet</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-slate-300" />
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">4.8/5</p>
                <p className="text-sm text-slate-600 mt-1">Kundenbewertung</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Alles, was Sie brauchen
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Dealer OS vereint Fahrzeugverwaltung, Lead-Management und Kennzahlen in einer intuitiven Plattform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 sm:py-28 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <Badge variant="outline" className="mb-4">Warum Dealer OS?</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                  Endlich wissen, was läuft – und was nicht
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Die meisten Garagen arbeiten noch mit Excel, Notizen und Bauchgefühl. 
                  Dealer OS bringt Struktur in Ihr Geschäft und zeigt Ihnen schwarz auf weiss, 
                  wo Sie Geld verdienen – und wo es liegt bleibt.
                </p>
                
                <ul className="space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0 mt-0.5">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-10">
                  <Button size="lg" asChild>
                    <Link href="/register">
                      Jetzt kostenlos testen
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-2xl blur-2xl" />
                <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium text-slate-900">VW Golf VII</p>
                          <p className="text-sm text-slate-500">Standzeit: 87 Tage</p>
                        </div>
                      </div>
                      <Badge variant="destructive">Langsteher</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-slate-900">BMW 320i</p>
                          <p className="text-sm text-slate-500">Verkauft nach 12 Tagen</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">+CHF 2'400</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-slate-900">Neue Anfrage</p>
                          <p className="text-sm text-slate-500">Audi A4 Avant – vor 5 Min.</p>
                        </div>
                      </div>
                      <Badge variant="outline">Offen</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Das sagen unsere Kunden
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{testimonial.name}</p>
                        <p className="text-xs text-slate-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 sm:py-28 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Preise</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Faire Preise für jede Grösse
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Wählen Sie den Plan, der zu Ihrem Betrieb passt. 14 Tage kostenlos testen.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Starter Plan */}
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">Starter</h3>
                  <p className="text-sm text-slate-600 mb-4">Kleine Garagisten</p>
                  <p className="text-4xl font-bold text-slate-900 mb-1">
                    CHF 149
                  </p>
                  <p className="text-sm text-slate-500 mb-6">pro Monat</p>
                  <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Bis 20 Fahrzeuge
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> 2 Benutzer
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> 2 Inserate-Kanäle
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Standzeit-Tracking
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Basis-CRM
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> E-Mail Support
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/register">14 Tage testen</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Professional Plan */}
              <Card className="border-blue-300 bg-blue-50/50 relative shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600">Beliebt</Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">Professional</h3>
                  <p className="text-sm text-slate-600 mb-4">Mittlere Händler</p>
                  <p className="text-4xl font-bold text-slate-900 mb-1">
                    CHF 349
                  </p>
                  <p className="text-sm text-slate-500 mb-6">pro Monat</p>
                  <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Bis 50 Fahrzeuge
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> 5 Benutzer
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> 5 Inserate-Kanäle
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-blue-600 shrink-0" /> <strong>AI Pricing</strong>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-blue-600 shrink-0" /> <strong>WhatsApp Integration</strong>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Vollständiges CRM
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Chat + E-Mail Support
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="/register">14 Tage testen</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Business Plan */}
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">Business</h3>
                  <p className="text-sm text-slate-600 mb-4">Grössere Händler</p>
                  <p className="text-4xl font-bold text-slate-900 mb-1">
                    CHF 599
                  </p>
                  <p className="text-sm text-slate-500 mb-6">pro Monat</p>
                  <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Bis 100 Fahrzeuge
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> 10 Benutzer
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Unbegrenzte Kanäle
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Multi-Standort
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Team-Auswertungen
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> API-Zugang
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Priority Support
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/register">14 Tage testen</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">Enterprise</h3>
                  <p className="text-sm text-slate-600 mb-4">Händlergruppen</p>
                  <p className="text-4xl font-bold text-slate-900 mb-1">
                    Ab CHF 999
                  </p>
                  <p className="text-sm text-slate-500 mb-6">pro Monat</p>
                  <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> 100+ Fahrzeuge
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Unbegrenzte Benutzer
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Custom Integrationen
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> White-Label Option
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> SLA (99.9% Uptime)
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Dedicated Manager
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> Onboarding & Training
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="mailto:enterprise@dealeros.ch">Kontakt</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-sm text-slate-500 mt-8">
              Alle Preise in CHF, zzgl. MwSt. • Jährlich zahlen und 17% sparen (2 Monate gratis)
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-28 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Bereit, Ihre Garage zu digitalisieren?
              </h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Dealer OS wurde speziell für Schweizer Autohändler entwickelt. 
                Starten Sie noch heute – kostenlos und unverbindlich.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="h-12 px-8 text-base bg-white text-slate-900 hover:bg-slate-100">
                  <Link href="/register">
                    Kostenlos starten
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base border-slate-600 text-white hover:bg-slate-800">
                  <Link href="/blog">Blog lesen</Link>
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

const features = [
  {
    icon: Car,
    title: "Fahrzeugverwaltung",
    description: "Alle Ihre Fahrzeuge an einem Ort. Mit Fotos, Dokumenten und Kaufhistorie – immer griffbereit.",
  },
  {
    icon: Clock,
    title: "Standzeit-Tracking",
    description: "Sehen Sie auf einen Blick, welche Fahrzeuge zu lange stehen. Nie wieder Kapital in Ladenhütern binden.",
  },
  {
    icon: Users,
    title: "Lead-Management",
    description: "Alle Anfragen zentral verwalten. Automatische Erinnerungen, damit keine Leads verloren gehen.",
  },
  {
    icon: BarChart3,
    title: "Gewinn pro Fahrzeug",
    description: "Wissen Sie genau, was jedes Fahrzeug einbringt. Mit Einkaufs-, Reparatur- und Standkosten.",
  },
  {
    icon: Zap,
    title: "Inserate-Export",
    description: "Fahrzeuge mit einem Klick auf AutoScout24, car4you und Ihre Website exportieren.",
  },
  {
    icon: Shield,
    title: "Schweizer Hosting",
    description: "Ihre Daten bleiben in der Schweiz. DSGVO-konform und sicher verschlüsselt.",
  },
];

const benefits = [
  "Schluss mit Excel-Chaos und Papier-Ordnern",
  "Langsteher frühzeitig erkennen und handeln",
  "Mehr Zeit für Verkauf statt Verwaltung",
  "Bessere Entscheidungen durch echte Daten",
  "Anfragen schneller beantworten und abschliessen",
];

const testimonials = [
  {
    name: "Marco Brunner",
    role: "Inhaber, Auto Brunner AG",
    quote: "Seit wir Dealer OS nutzen, haben wir unsere Standzeiten um 30% reduziert. Endlich sehe ich auf einen Blick, wo mein Geld liegt.",
  },
  {
    name: "Sandra Keller",
    role: "Geschäftsführerin, Garage Keller",
    quote: "Einfach zu bedienen und genau das, was wir als kleine Garage brauchen. Der Support ist super – man merkt, dass die verstehen, wie wir arbeiten.",
  },
  {
    name: "Thomas Müller",
    role: "Verkaufsleiter, AutoCenter Zürich",
    quote: "Das Lead-Management hat unsere Antwortzeit halbiert. Wir verlieren keine Anfragen mehr und schliessen deutlich mehr Verkäufe ab.",
  },
];
