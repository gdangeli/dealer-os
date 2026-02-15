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
  ChevronRight,
  Building2,
  Award,
  Lock,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section - Clean, Professional */}
        <section className="relative bg-gradient-to-b from-sky-50 via-white to-white py-16 sm:py-24 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Trust Badge */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 bg-white border border-sky-200 rounded-full px-4 py-2 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-slate-700">Beta</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-600">50+ Schweizer Garagen vertrauen uns</span>
                </div>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-slate-900 leading-tight tracking-tight">
                Autohandel-Software,
                <br />
                <span className="text-sky-600">die wirklich funktioniert.</span>
              </h1>
              
              <p className="mt-6 text-lg sm:text-xl text-slate-600 text-center max-w-2xl mx-auto leading-relaxed">
                Fahrzeugbestand, Standzeiten, Leads – alles im Griff. 
                Entwickelt für Schweizer Autohändler, die wissen wollen, wo ihr Geld liegt.
              </p>
              
              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild 
                  className="h-14 px-8 text-base font-semibold bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-600/25 hover:shadow-sky-600/40 transition-all"
                >
                  <Link href="/register">
                    14 Tage kostenlos testen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild 
                  className="h-14 px-8 text-base font-medium border-slate-300 hover:bg-slate-50"
                >
                  <Link href="#demo">Live-Demo ansehen</Link>
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Keine Kreditkarte nötig</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>In 5 Minuten startklar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>Hosting in der Schweiz</span>
                </div>
              </div>
            </div>
            
            {/* Dashboard Preview - Light, Professional */}
            <div className="mt-16 sm:mt-20 max-w-5xl mx-auto">
              <div className="relative">
                {/* Subtle glow */}
                <div className="absolute -inset-4 bg-gradient-to-b from-sky-100/60 to-transparent rounded-3xl blur-2xl" />
                
                {/* Browser Window */}
                <div className="relative bg-white rounded-xl shadow-2xl shadow-slate-900/10 border border-slate-200 overflow-hidden">
                  {/* Browser Header */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-slate-300" />
                      <div className="w-3 h-3 rounded-full bg-slate-300" />
                      <div className="w-3 h-3 rounded-full bg-slate-300" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-white rounded-md px-4 py-1 text-xs text-slate-500 border border-slate-200 flex items-center gap-2">
                        <Lock className="h-3 w-3 text-emerald-500" />
                        app.dealeros.ch/dashboard
                      </div>
                    </div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="p-6 bg-slate-50/50">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fahrzeuge</span>
                          <Car className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">32</p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">+4 diese Woche</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ø Standzeit</span>
                          <Clock className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">38 <span className="text-base font-normal text-slate-500">Tage</span></p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">-12% vs. Vormonat</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Offene Leads</span>
                          <Users className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">8</p>
                        <p className="text-xs text-amber-600 font-medium mt-1">2 ohne Antwort</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ø Marge</span>
                          <TrendingUp className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">CHF 2'840</p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">+8% vs. Vormonat</p>
                      </div>
                    </div>
                    
                    {/* Activity Feed */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-900 text-sm">Letzte Aktivitäten</h3>
                      </div>
                      <div className="divide-y divide-slate-100">
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">BMW 320d Touring verkauft</p>
                              <p className="text-xs text-slate-500">Standzeit: 23 Tage · Marge: CHF 3'200</p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">vor 2 Std.</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                              <Users className="h-4 w-4 text-sky-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">Neue Anfrage: Audi A4 Avant</p>
                              <p className="text-xs text-slate-500">Hans Meier · 079 123 45 67</p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">vor 45 Min.</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">VW Golf VII erreicht 60 Tage</p>
                              <p className="text-xs text-slate-500">Preisanpassung empfohlen</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">Aktion nötig</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-12 bg-white border-y border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-slate-900">50+</p>
                  <p className="text-sm text-slate-600 mt-1">Garagen in der Beta</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-200" />
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-slate-900">2'000+</p>
                  <p className="text-sm text-slate-600 mt-1">Fahrzeuge verwaltet</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-200" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-3xl sm:text-4xl font-bold text-slate-900">4.8</p>
                    <Star className="h-6 w-6 fill-amber-400 text-amber-400 mt-1" />
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Kundenbewertung</p>
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-slate-700">Swiss Hosted</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <Lock className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">DSGVO-konform</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Kennen Sie das?
              </h2>
              <p className="text-lg text-slate-600">
                Die meisten Garagen kämpfen mit den gleichen Problemen.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
              {problems.map((problem, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <problem.icon className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{problem.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{problem.description}</p>
                </div>
              ))}
            </div>
            
            {/* Arrow down */}
            <div className="flex justify-center mb-16">
              <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center shadow-lg">
                <ChevronRight className="h-6 w-6 text-white rotate-90" />
              </div>
            </div>
            
            {/* Solution */}
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-4">Die Lösung</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Dealer OS bringt Ordnung
              </h2>
              <p className="text-lg text-slate-600">
                Eine zentrale Plattform für Fahrzeuge, Leads und Kennzahlen. 
                Endlich sehen Sie schwarz auf weiss, was läuft – und was nicht.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-28 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 bg-white">Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Alles an einem Ort
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Keine Insellösungen mehr. Dealer OS vereint alles, was Sie brauchen.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {features.map((feature, idx) => (
                <Card 
                  key={feature.title} 
                  className={`border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 ${
                    idx === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${feature.iconBg}`}>
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
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

        {/* How It Works */}
        <section id="demo" className="py-20 sm:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">So funktioniert&apos;s</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                In 3 Schritten startklar
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {steps.map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-sky-600/25">
                    {idx + 1}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-28 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="bg-sky-500/20 text-sky-300 hover:bg-sky-500/20 mb-4">Kundenstimmen</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Das sagen Schweizer Garagisten
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, idx) => (
                <Card key={testimonial.name} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-600 text-white font-semibold text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{testimonial.name}</p>
                        <p className="text-xs text-slate-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 sm:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Preise</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Transparent & fair
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Wählen Sie den Plan, der zu Ihrer Garage passt. Alle Pläne 14 Tage gratis.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Starter Plan */}
              <Card className="border-slate-200 relative">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">Starter</h3>
                  <p className="text-sm text-slate-500 mb-6">Für kleine Betriebe</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900">149</span>
                    <span className="text-slate-500 ml-1">CHF/Mt.</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {starterFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/register">Gratis testen</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Professional Plan - Popular */}
              <Card className="border-sky-300 bg-sky-50/50 relative shadow-xl shadow-sky-100">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-sky-600 hover:bg-sky-600 shadow-lg">Beliebt</Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">Professional</h3>
                  <p className="text-sm text-slate-500 mb-6">Für wachsende Händler</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900">349</span>
                    <span className="text-slate-500 ml-1">CHF/Mt.</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {proFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-sky-600 hover:bg-sky-700" asChild>
                    <Link href="/register">Gratis testen</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Business Plan */}
              <Card className="border-slate-200 relative">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">Business</h3>
                  <p className="text-sm text-slate-500 mb-6">Für grössere Betriebe</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900">599</span>
                    <span className="text-slate-500 ml-1">CHF/Mt.</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {businessFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/register">Gratis testen</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border-slate-200 relative bg-slate-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">Enterprise</h3>
                  <p className="text-sm text-slate-500 mb-6">Für Händlergruppen</p>
                  <div className="mb-6">
                    <span className="text-2xl font-bold text-slate-900">Auf Anfrage</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {enterpriseFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="mailto:enterprise@dealeros.ch">Kontakt</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-sm text-slate-500 mt-8">
              Alle Preise zzgl. MwSt. · Bei jährlicher Zahlung 2 Monate gratis.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 sm:py-28 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 bg-white">FAQ</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Häufige Fragen
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 sm:py-28 bg-gradient-to-br from-sky-600 to-sky-700 relative overflow-hidden">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff),linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff)] bg-[length:60px_60px] bg-[position:0_0,30px_30px]" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Bereit für mehr Durchblick?
              </h2>
              <p className="text-xl text-sky-100 mb-10 max-w-2xl mx-auto">
                Testen Sie Dealer OS 14 Tage kostenlos. Keine Kreditkarte, keine Verpflichtung.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild 
                  className="h-14 px-10 text-base font-semibold bg-white text-sky-700 hover:bg-sky-50 shadow-xl"
                >
                  <Link href="/register">
                    Jetzt kostenlos starten
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              {/* Trust Row */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sky-100">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="text-sm">Swiss Made Software</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Hosting in der Schweiz</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <span className="text-sm">Support aus Zürich</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Data
const problems = [
  {
    icon: BarChart3,
    title: "Kein Überblick",
    description: "Excel-Listen, Notizen, Bauchgefühl – aber keine echten Zahlen, auf die Sie sich verlassen können.",
  },
  {
    icon: Clock,
    title: "Langsteher übersehen",
    description: "Fahrzeuge stehen zu lange, binden Kapital und verlieren an Wert. Aber wann eingreifen?",
  },
  {
    icon: Users,
    title: "Leads gehen verloren",
    description: "Anfragen per E-Mail, WhatsApp, Telefon – wer hat wann geantwortet? Niemand weiss es.",
  },
];

const features = [
  {
    icon: Car,
    title: "Fahrzeugverwaltung",
    description: "Alle Fahrzeuge zentral verwalten. Mit Fotos, Dokumenten und kompletter Kostenhistorie.",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    icon: Clock,
    title: "Standzeit-Tracking",
    description: "Sehen Sie sofort, welche Fahrzeuge zu lange stehen. Mit automatischen Warnungen.",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    icon: Users,
    title: "Lead-Management",
    description: "Alle Anfragen an einem Ort. Automatische Erinnerungen, damit nichts verloren geht.",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Echte Kennzahlen",
    description: "Gewinn pro Fahrzeug, Durchschnitts-Standzeit, Conversion-Rate – auf einen Blick.",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    icon: Zap,
    title: "Inserate-Export",
    description: "Mit einem Klick auf AutoScout24, car4you und Ihre Website veröffentlichen.",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    icon: Shield,
    title: "Schweizer Hosting",
    description: "Ihre Daten bleiben in der Schweiz. DSGVO-konform und sicher verschlüsselt.",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
];

const steps = [
  {
    title: "Konto erstellen",
    description: "In 2 Minuten registriert. Keine Kreditkarte nötig.",
  },
  {
    title: "Fahrzeuge erfassen",
    description: "Importieren Sie bestehende Daten oder starten Sie frisch.",
  },
  {
    title: "Durchblick gewinnen",
    description: "Sehen Sie sofort, wo Potenzial und Handlungsbedarf liegt.",
  },
];

const testimonials = [
  {
    name: "Marco Brunner",
    role: "Inhaber, Auto Brunner AG, Winterthur",
    quote: "Seit wir Dealer OS nutzen, haben wir unsere Standzeiten um 30% reduziert. Endlich sehe ich auf einen Blick, wo mein Geld liegt.",
  },
  {
    name: "Sandra Keller",
    role: "Geschäftsführerin, Garage Keller, Aarau",
    quote: "Einfach zu bedienen und genau das, was wir brauchen. Der Support ist super – man merkt, dass die verstehen, wie wir arbeiten.",
  },
  {
    name: "Thomas Müller",
    role: "Verkaufsleiter, AutoCenter Zürich",
    quote: "Das Lead-Management hat unsere Antwortzeit halbiert. Wir verlieren keine Anfragen mehr und schliessen mehr Verkäufe ab.",
  },
];

const starterFeatures = [
  "Bis 20 Fahrzeuge",
  "2 Benutzer",
  "2 Inserate-Kanäle",
  "Standzeit-Tracking",
  "Basis-CRM",
  "E-Mail Support",
];

const proFeatures = [
  "Bis 50 Fahrzeuge",
  "5 Benutzer",
  "5 Inserate-Kanäle",
  "AI-Preisempfehlung",
  "WhatsApp Integration",
  "Vollständiges CRM",
  "Chat + E-Mail Support",
];

const businessFeatures = [
  "Bis 100 Fahrzeuge",
  "10 Benutzer",
  "Unbegrenzte Kanäle",
  "Multi-Standort",
  "Team-Auswertungen",
  "API-Zugang",
  "Priority Support",
];

const enterpriseFeatures = [
  "100+ Fahrzeuge",
  "Unbegrenzte Benutzer",
  "Custom Integrationen",
  "White-Label Option",
  "SLA 99.9% Uptime",
  "Dedicated Manager",
];

const faqs = [
  {
    question: "Wie lange dauert die Einrichtung?",
    answer: "Die Grundeinrichtung dauert etwa 10-15 Minuten. Sie können sofort mit der Erfassung Ihrer Fahrzeuge beginnen. Bei grösseren Datenmengen unterstützen wir Sie gerne beim Import.",
  },
  {
    question: "Kann ich meine bestehenden Daten importieren?",
    answer: "Ja, Sie können Excel-Listen und Daten aus anderen Systemen importieren. Unser Support hilft Ihnen dabei kostenlos.",
  },
  {
    question: "Wo werden meine Daten gespeichert?",
    answer: "Alle Daten werden ausschliesslich in der Schweiz gespeichert. Wir nutzen Schweizer Rechenzentren und erfüllen alle DSGVO-Anforderungen.",
  },
  {
    question: "Kann ich jederzeit kündigen?",
    answer: "Ja, Sie können monatlich kündigen. Keine Mindestvertragslaufzeit, keine versteckten Kosten. Ihre Daten können Sie jederzeit exportieren.",
  },
  {
    question: "Gibt es Schulungen oder Onboarding?",
    answer: "Dealer OS ist intuitiv und weitgehend selbsterklärend. Bei Bedarf bieten wir kostenlose Video-Tutorials und persönliches Onboarding an.",
  },
];
