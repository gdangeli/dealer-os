import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, Shield, Sparkles, Users, HeartHandshake, Percent } from "lucide-react";

// ============================================
// BETA TESTER CONFIGURATION
// ============================================
const BETA_SLOTS_TOTAL = 50;
const BETA_SLOTS_TAKEN = 6;
// ============================================

const BETA_SLOTS_REMAINING = BETA_SLOTS_TOTAL - BETA_SLOTS_TAKEN;
const BETA_PROGRESS_PERCENT = (BETA_SLOTS_TAKEN / BETA_SLOTS_TOTAL) * 100;

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePage />;
}

function HomePage() {
  const t = useTranslations("landing");
  const tPricing = useTranslations("landing.pricing");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero Section - BETA TESTER CAMPAIGN */}
        <section className="hero-gradient pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left Content */}
              <div>
                {/* Limited Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-4 py-2 mb-6 shadow-lg shadow-amber-500/30 animate-pulse">
                  <span className="text-lg">🔥</span>
                  <span className="text-sm font-bold">Limitiert auf {BETA_SLOTS_TOTAL} Plätze</span>
                </div>

                {/* Headline - Beta Tester Focus */}
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-4 sm:mb-6">
                  Werde einer von {BETA_SLOTS_TOTAL}<br />
                  <span className="gradient-text">Beta-Testern</span>
                </h1>

                {/* Description - Beta Value Prop */}
                <p className="text-lg sm:text-xl text-gray-600 leading-normal mb-6 sm:mb-8 max-w-lg">
                  Hilf uns DealerOS zu verbessern und erhalte <span className="font-bold text-indigo-600">50% Rabatt — für immer.</span>
                </p>

                {/* Beta Counter - Prominent */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8 max-w-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Verfügbare Beta-Plätze</span>
                    <span className="text-sm font-bold text-orange-600">{BETA_SLOTS_REMAINING} von {BETA_SLOTS_TOTAL}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${BETA_PROGRESS_PERCENT}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    🔥 Noch <span className="font-bold text-gray-700">{BETA_SLOTS_REMAINING}</span> Plätze verfügbar — diese Aktion endet sobald alle vergeben sind
                  </p>
                </div>

                {/* CTA - Beta Focus */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10">
                  <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all">
                    Beta-Platz sichern
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600 mb-6 sm:mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                    </div>
                    <span>{t("hero.noCreditCard")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                    </div>
                    <span>{t("hero.quickStart")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-sky-600" />
                    </div>
                    <span>{t("hero.swissHosting")}</span>
                  </div>
                </div>

                {/* Social Proof - Beta Testers */}
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-medium text-emerald-800">
                    Bereits <span className="font-bold">{BETA_SLOTS_TAKEN} Garagisten</span> testen DealerOS
                  </span>
                </div>
              </div>

              {/* Right - Dashboard Preview */}
              <div className="relative hidden sm:block">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-indigo-400/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden glow">
                  {/* Browser Header */}
                  <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 ml-2">dealeros.ch/dashboard</div>
                  </div>
                  {/* Dashboard Content */}
                  <div className="p-4 sm:p-6 bg-slate-50">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">Fahrzeuge</div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">47</div>
                        <div className="text-xs text-green-600 mt-1 hidden sm:block">↗ 12%</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">Leads</div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">23</div>
                        <div className="text-xs text-amber-600 mt-1 hidden sm:block">5 Follow-up</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">Umsatz</div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">187k</div>
                        <div className="text-xs text-green-600 mt-1 hidden sm:block">↗ CHF</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-800">Neueste Leads</span>
                        <span className="text-sm text-sky-600">Alle anzeigen →</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm">🟢</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Hans Müller</div>
                            <div className="text-xs text-gray-500">BMW X5 • AutoScout24</div>
                          </div>
                          <span className="text-xs text-green-600 font-medium">Gerade eben</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm">📞</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Maria Schneider</div>
                            <div className="text-xs text-gray-500">VW Golf • Telefon</div>
                          </div>
                          <span className="text-xs text-gray-500">vor 2 Std</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beta Benefits Section - NEW */}
        <section className="py-12 sm:py-20 bg-gradient-to-br from-indigo-50 via-white to-sky-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-2 mb-4 sm:mb-6 font-medium text-sm">
                <Sparkles className="w-4 h-4" /> Exklusive Beta-Vorteile
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
                Was du als Beta-Tester bekommst
              </h2>
              <p className="text-base sm:text-xl text-gray-600">
                Werde Teil der DealerOS-Entwicklung und profitiere von exklusiven Vorteilen
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Benefit 1 - 50% Discount */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-emerald-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 rounded-bl-full opacity-50"></div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-5">
                  <Percent className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">50% Rabatt — für immer</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Als Dankeschön für dein Feedback erhältst du dauerhaft 50% auf alle Pläne. Keine Tricks, keine Ablaufdaten.
                </p>
              </div>

              {/* Benefit 2 - Feature Influence */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-sky-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-sky-100 rounded-bl-full opacity-50"></div>
                <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center mb-5">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Direkter Einfluss</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Deine Wünsche haben Priorität. Du bestimmst mit, welche Features als nächstes entwickelt werden.
                </p>
              </div>

              {/* Benefit 3 - Early Adopter */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-violet-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-violet-100 rounded-bl-full opacity-50"></div>
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-5">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Early Adopter Status</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Exklusives Beta-Badge und Zugang zu neuen Features bevor sie öffentlich werden.
                </p>
              </div>

              {/* Benefit 4 - Personal Support */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-amber-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100 rounded-bl-full opacity-50"></div>
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-5">
                  <HeartHandshake className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Persönlicher Support</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Direkter Draht zum Entwickler-Team. Keine Ticket-Warteschlangen, echte Menschen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - EXACT from mockup-v3: GRADIENT cards */}
        <section id="features" className="py-12 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 rounded-full px-4 py-2 mb-4 sm:mb-6 font-medium text-sm">
                <span>⚡</span> {t("features.badge")}
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t("features.title")}
              </h2>
              <p className="text-base sm:text-xl text-gray-600">
                {t("features.subtitle")}
              </p>
            </div>

            {/* Feature Cards - GRADIENT backgrounds from mockup-v3 */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Card 1 - Vehicle Management */}
              <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl p-6 sm:p-8 card-hover border border-sky-100">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t("features.vehicleManagement")}</h3>
                <p className="text-gray-600 leading-relaxed">{t("features.vehicleManagementDesc")}</p>
              </div>

              {/* Card 2 - Lead Management */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 card-hover border border-emerald-100">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t("features.leadManagement")}</h3>
                <p className="text-gray-600 leading-relaxed">{t("features.leadManagementDesc")}</p>
              </div>

              {/* Card 3 - Listing Export */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 sm:p-8 card-hover border border-orange-100">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t("features.listingExport")}</h3>
                <p className="text-gray-600 leading-relaxed">{t("features.listingExportDesc")}</p>
              </div>

              {/* Card 4 - Real KPIs */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 sm:p-8 card-hover border border-violet-100">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t("features.realKpis")}</h3>
                <p className="text-gray-600 leading-relaxed">{t("features.realKpisDesc")}</p>
              </div>

              {/* Card 5 - Quotes & Invoices */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 sm:p-8 card-hover border border-rose-100">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t("features.quotesInvoices")}</h3>
                <p className="text-gray-600 leading-relaxed">{t("features.quotesInvoicesDesc")}</p>
              </div>

              {/* Card 6 - Swiss Hosting */}
              <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-2xl p-6 sm:p-8 card-hover border border-cyan-100">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t("features.swissHosting")}</h3>
                <p className="text-gray-600 leading-relaxed">{t("features.swissHostingDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section - EXACT from mockup-v3: DARK background */}
        <section className="py-12 sm:py-24 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 rounded-full px-4 py-2 mb-4 sm:mb-6 font-medium text-sm">
                {t("testimonials.badge")}
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                {t("testimonials.title")}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 card-hover">
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-yellow-400">★★★★★</span>
                </div>
                <p className="text-white/90 mb-6 leading-relaxed">
                  &ldquo;{t("testimonials.quote1")}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">MK</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{t("testimonials.name1")}</div>
                    <div className="text-slate-400 text-sm">{t("testimonials.role1")}</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 card-hover">
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-yellow-400">★★★★★</span>
                </div>
                <p className="text-white/90 mb-6 leading-relaxed">
                  &ldquo;{t("testimonials.quote2")}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">SB</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{t("testimonials.name2")}</div>
                    <div className="text-slate-400 text-sm">{t("testimonials.role2")}</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 card-hover">
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-yellow-400">★★★★★</span>
                </div>
                <p className="text-white/90 mb-6 leading-relaxed">
                  &ldquo;{t("testimonials.quote3")}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">PZ</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{t("testimonials.name3")}</div>
                    <div className="text-slate-400 text-sm">{t("testimonials.role3")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - EXACT from mockup-v3 */}
        <section id="pricing" className="py-12 sm:py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 rounded-full px-4 py-2 mb-4 sm:mb-6 font-medium text-sm">
                💰 {tPricing("badge")}
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                {tPricing("title")}
              </h2>
              <p className="text-base sm:text-xl text-gray-600">
                {tPricing("subtitle")}
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
              
              {/* Starter - Free */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 border border-emerald-200 card-hover relative">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tPricing("starter.name")}</h3>
                <p className="text-sm text-gray-600 mb-6">{tPricing("starter.description")}</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{tPricing("free")}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[0,1,2,3,4].map((i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                      </div>
                      {tPricing(`starter.features.${i}`)}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30">
                  {tPricing("freeTrial")}
                </Link>
              </div>

              {/* Professional - Popular */}
              <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl p-8 border-2 border-sky-400 card-hover relative pricing-popular shadow-2xl shadow-sky-200">
                {/* Popular Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
                    ✨ {tPricing("popular")}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">{tPricing("professional.name")}</h3>
                <p className="text-sm text-gray-600 mb-6">{tPricing("professional.description")}</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">{tPricing("professional.price")}</span>
                  <span className="text-gray-500 ml-2">{tPricing("perMonth")}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[0,1,2,3,4,5].map((i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-sky-600" strokeWidth={3} />
                      </div>
                      {tPricing(`professional.features.${i}`)}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block w-full text-center bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/30">
                  {tPricing("freeTrial")}
                </Link>
              </div>

              {/* Business */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 card-hover relative">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tPricing("business.name")}</h3>
                <p className="text-sm text-gray-600 mb-6">{tPricing("business.description")}</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">{tPricing("business.price")}</span>
                  <span className="text-gray-500 ml-2">{tPricing("perMonth")}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[0,1,2,3,4,5].map((i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                      </div>
                      {tPricing(`business.features.${i}`)}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block w-full text-center border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all">
                  {tPricing("freeTrial")}
                </Link>
              </div>

              {/* Enterprise */}
              <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-300 card-hover relative">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tPricing("enterprise.name")}</h3>
                <p className="text-sm text-gray-600 mb-6">{tPricing("enterprise.description")}</p>
                <div className="mb-8">
                  <span className="text-2xl font-bold text-gray-900">{tPricing("onRequest")}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[0,1,2,3,4,5].map((i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                      </div>
                      {tPricing(`enterprise.features.${i}`)}
                    </li>
                  ))}
                </ul>
                <Link href="/kontakt" className="block w-full text-center border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all">
                  {tPricing("contact")}
                </Link>
              </div>
            </div>

            {/* Price Note */}
            <p className="text-center text-sm text-gray-500 mt-8">
              {tPricing("priceNote")}
            </p>
          </div>
        </section>

        {/* CTA Section - BETA FOCUS */}
        <section className="py-12 sm:py-24 bg-gradient-to-br from-sky-500 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
            {/* Urgency Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 text-white rounded-full px-4 py-2 mb-6 font-medium text-sm backdrop-blur-sm">
              🔥 Nur noch {BETA_SLOTS_REMAINING} von {BETA_SLOTS_TOTAL} Beta-Plätzen verfügbar
            </div>
            
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              Sichere dir deinen Beta-Platz
            </h2>
            <p className="text-base sm:text-xl text-white/80 mb-6 sm:mb-10 max-w-2xl mx-auto">
              50% Rabatt für immer. Direkter Einfluss auf die Entwicklung. Persönlicher Support. Diese Chance gibt es nur einmal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-100 transition-all shadow-xl">
                Beta-Platz sichern
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-white/60 text-sm mt-6">
              Diese Aktion endet sobald alle {BETA_SLOTS_TOTAL} Plätze vergeben sind
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
