import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { DemoVideoButton } from "@/components/landing/demo-video-modal";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Link } from "@/i18n/navigation";
import {
  Car,
  BarChart3,
  Users,
  Shield,
  Zap,
  Check,
  ArrowRight,
  Receipt,
} from "lucide-react";

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
        {/* Hero Section - Matching mockup-v3 exactly */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #faf5ff 100%)' }}>
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center py-16 lg:py-24">
              {/* Left: Content */}
              <div>
                {/* Trust Badge */}
                <div className="inline-flex items-center gap-2 bg-white/80 border border-indigo-100 rounded-full px-4 py-2 shadow-sm mb-8">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {t("hero.trustCount")}
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                  {t("hero.headline1")}
                  <br />
                  <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                    {t("hero.headline2")}
                  </span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-lg">
                  {t("hero.description")}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white hover:shadow-xl hover:shadow-indigo-500/30 transition-all rounded-xl"
                  >
                    {t("hero.cta")}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <DemoVideoButton className="h-14 px-8 text-lg font-semibold border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl" />
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span>{t("hero.noCreditCard")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span>{t("hero.quickStart")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center">
                      <Shield className="h-3 w-3 text-sky-600" />
                    </div>
                    <span>{t("hero.swissHosting")}</span>
                  </div>
                </div>

                {/* Portal Logos */}
                <div className="flex items-center gap-6 opacity-70">
                  <span className="text-sm text-gray-500 font-medium">Inserieren auf:</span>
                  <div className="flex items-center gap-4">
                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                      <span className="font-bold text-orange-500">AutoScout24</span>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                      <span className="font-bold text-green-600">Autolina</span>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                      <span className="font-bold text-red-600">CARAUKTION</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Dashboard Preview */}
              <div className="relative">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Matching mockup-v3 */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 rounded-full px-4 py-2 mb-6 font-medium text-sm">
                <span>⚡</span> {t("features.badge")}
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {t("features.title")}
              </h2>
              <p className="text-xl text-gray-600">
                {t("features.subtitle")}
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Car}
                title={t("features.vehicleManagement")}
                description={t("features.vehicleManagementDesc")}
                gradient="from-sky-500 to-indigo-600"
                bgGradient="from-sky-50 to-indigo-50"
                borderColor="border-sky-100"
              />
              <FeatureCard
                icon={Users}
                title={t("features.leadManagement")}
                description={t("features.leadManagementDesc")}
                gradient="from-emerald-500 to-teal-600"
                bgGradient="from-emerald-50 to-teal-50"
                borderColor="border-emerald-100"
              />
              <FeatureCard
                icon={Zap}
                title={t("features.listingExport")}
                description={t("features.listingExportDesc")}
                gradient="from-orange-500 to-amber-600"
                bgGradient="from-orange-50 to-amber-50"
                borderColor="border-orange-100"
              />
              <FeatureCard
                icon={BarChart3}
                title={t("features.realKpis")}
                description={t("features.realKpisDesc")}
                gradient="from-violet-500 to-purple-600"
                bgGradient="from-violet-50 to-purple-50"
                borderColor="border-violet-100"
              />
              <FeatureCard
                icon={Receipt}
                title={t("features.quotesInvoices")}
                description={t("features.quotesInvoicesDesc")}
                gradient="from-rose-500 to-pink-600"
                bgGradient="from-rose-50 to-pink-50"
                borderColor="border-rose-100"
              />
              <FeatureCard
                icon={Shield}
                title={t("features.swissHosting")}
                description={t("features.swissHostingDesc")}
                gradient="from-cyan-500 to-sky-600"
                bgGradient="from-cyan-50 to-sky-50"
                borderColor="border-cyan-100"
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section - Matching mockup-v3 */}
        <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 rounded-full px-4 py-2 mb-6 font-medium text-sm">
                {t("testimonials.badge")}
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                {t("testimonials.title")}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard
                quote={t("testimonials.quote1")}
                name={t("testimonials.name1")}
                role={t("testimonials.role1")}
                initials="MK"
                gradient="from-sky-400 to-indigo-500"
              />
              <TestimonialCard
                quote={t("testimonials.quote2")}
                name={t("testimonials.name2")}
                role={t("testimonials.role2")}
                initials="SB"
                gradient="from-emerald-400 to-teal-500"
              />
              <TestimonialCard
                quote={t("testimonials.quote3")}
                name={t("testimonials.name3")}
                role={t("testimonials.role3")}
                initials="PZ"
                gradient="from-orange-400 to-red-500"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section - Matching mockup-v3 exactly */}
        <section id="pricing" className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 rounded-full px-4 py-2 mb-6 font-medium text-sm">
                💰 {tPricing("badge")}
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {tPricing("title")}
              </h2>
              <p className="text-xl text-gray-600">
                {tPricing("subtitle")}
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              <PricingCard
                name={tPricing("starter.name")}
                description={tPricing("starter.description")}
                price={tPricing("starter.price")}
                features={[
                  tPricing("starter.features.0"),
                  tPricing("starter.features.1"),
                  tPricing("starter.features.2"),
                  tPricing("starter.features.3"),
                  tPricing("starter.features.4"),
                ]}
                ctaText={tPricing("freeTrial")}
                free
                freeLabel={tPricing("free")}
              />
              <PricingCard
                name={tPricing("professional.name")}
                description={tPricing("professional.description")}
                price={tPricing("professional.price")}
                perMonth={tPricing("perMonth")}
                features={[
                  tPricing("professional.features.0"),
                  tPricing("professional.features.1"),
                  tPricing("professional.features.2"),
                  tPricing("professional.features.3"),
                  tPricing("professional.features.4"),
                  tPricing("professional.features.5"),
                ]}
                ctaText={tPricing("freeTrial")}
                popular
                popularLabel={tPricing("popular")}
              />
              <PricingCard
                name={tPricing("business.name")}
                description={tPricing("business.description")}
                price={tPricing("business.price")}
                perMonth={tPricing("perMonth")}
                features={[
                  tPricing("business.features.0"),
                  tPricing("business.features.1"),
                  tPricing("business.features.2"),
                  tPricing("business.features.3"),
                  tPricing("business.features.4"),
                  tPricing("business.features.5"),
                ]}
                ctaText={tPricing("freeTrial")}
              />
              <PricingCard
                name={tPricing("enterprise.name")}
                description={tPricing("enterprise.description")}
                price={tPricing("onRequest")}
                features={[
                  tPricing("enterprise.features.0"),
                  tPricing("enterprise.features.1"),
                  tPricing("enterprise.features.2"),
                  tPricing("enterprise.features.3"),
                  tPricing("enterprise.features.4"),
                  tPricing("enterprise.features.5"),
                ]}
                ctaText={tPricing("contact")}
                enterprise
              />
            </div>

            {/* Price Note */}
            <p className="text-center text-sm text-gray-500 mt-8">
              {tPricing("priceNote")}
            </p>
          </div>
        </section>

        {/* CTA Section - Matching mockup-v3 */}
        <section className="py-24 bg-gradient-to-br from-sky-500 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto px-6 text-center relative">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              {t("cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold bg-white text-indigo-600 hover:bg-gray-100 shadow-xl rounded-xl transition-all"
              >
                {t("cta.button")}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold bg-transparent text-white border-2 border-white/30 hover:bg-white/10 rounded-xl transition-all"
              >
                Demo vereinbaren
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Feature Card Component - Matching mockup-v3
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  bgGradient,
  borderColor,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  bgGradient: string;
  borderColor: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-8 border ${borderColor} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-6`}>
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

// Testimonial Card Component - Matching mockup-v3
function TestimonialCard({
  quote,
  name,
  role,
  initials,
  gradient,
}: {
  quote: string;
  name: string;
  role: string;
  initials: string;
  gradient: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center gap-1 mb-4">
        <span className="text-yellow-400">★★★★★</span>
      </div>
      <p className="text-white/90 mb-6 leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center`}>
          <span className="text-white font-bold">{initials}</span>
        </div>
        <div>
          <div className="text-white font-semibold">{name}</div>
          <div className="text-slate-400 text-sm">{role}</div>
        </div>
      </div>
    </div>
  );
}

// Pricing Card Component - Matching mockup-v3 exactly
function PricingCard({
  name,
  description,
  price,
  perMonth,
  features,
  ctaText,
  popular,
  popularLabel,
  enterprise,
  free,
  freeLabel,
}: {
  name: string;
  description: string;
  price: string;
  perMonth?: string;
  features: string[];
  ctaText: string;
  popular?: boolean;
  popularLabel?: string;
  enterprise?: boolean;
  free?: boolean;
  freeLabel?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-8 border transition-all duration-300 hover:shadow-xl ${
        popular
          ? "bg-gradient-to-br from-sky-50 to-indigo-50 border-2 border-sky-400 shadow-2xl shadow-sky-200 scale-105"
          : enterprise
          ? "bg-slate-50 border-slate-300"
          : free
          ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Popular Badge */}
      {popular && popularLabel && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
            ✨ {popularLabel}
          </span>
        </div>
      )}

      <h3 className={`text-xl font-bold text-gray-900 mb-2 ${popular ? 'mt-2' : ''}`}>{name}</h3>
      <p className="text-sm text-gray-600 mb-6">{description}</p>

      {/* Price */}
      <div className="mb-8">
        {free && freeLabel ? (
          <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {freeLabel}
          </span>
        ) : perMonth ? (
          <>
            <span className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              {price}
            </span>
            <span className="text-gray-500 ml-2">{perMonth}</span>
          </>
        ) : (
          <span className="text-2xl font-bold text-gray-900">{price}</span>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              popular ? "bg-sky-100" : "bg-emerald-100"
            }`}>
              <Check className={`h-3 w-3 ${popular ? "text-sky-600" : "text-emerald-600"}`} />
            </div>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {popular ? (
        <Link
          href="/register"
          className="block w-full text-center bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/30"
        >
          {ctaText}
        </Link>
      ) : free ? (
        <Link
          href="/register"
          className="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30"
        >
          {ctaText}
        </Link>
      ) : enterprise ? (
        <Link
          href="/kontakt"
          className="block w-full text-center border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all"
        >
          {ctaText}
        </Link>
      ) : (
        <Link
          href="/register"
          className="block w-full text-center border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all"
        >
          {ctaText}
        </Link>
      )}
    </div>
  );
}
