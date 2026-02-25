import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Star,
  Building2,
  Award,
  Target,
  LineChart,
  Database,
  Receipt,
} from "lucide-react";
// Image import removed - using CSS gradients instead

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
  const tHeader = useTranslations("header");
  const tPricing = useTranslations("landing.pricing");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero Section - Modern Minimalist with Image */}
        <section className="relative bg-gradient-to-br from-sky-50 via-white to-indigo-50 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-sky-200/30 to-indigo-200/30 blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-200/20 to-sky-200/20 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 sm:py-20 lg:py-28">
              {/* Left: Content */}
              <div className="max-w-xl">
                {/* Trust Badge */}
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-sky-200 rounded-full px-4 py-2 shadow-sm mb-8">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {t("hero.trustCount")}
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
                  {t("hero.headline1")}
                  <br />
                  <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                    {t("hero.headline2")}
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10">
                  {t("hero.description")}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Button
                    size="lg"
                    asChild
                    className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-xl shadow-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/40 transition-all duration-300 rounded-xl"
                  >
                    <Link href="/register">
                      {t("hero.cta")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <DemoVideoButton className="h-14 px-8 text-base font-medium border-slate-300 hover:bg-slate-50 rounded-xl" />
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
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
              </div>

              {/* Right: Dashboard Preview */}
              <div className="relative lg:h-[600px] flex items-center justify-center">
                <DashboardPreview />
              </div>
            </div>
            
            {/* Portal Logos */}
            <div className="flex flex-wrap items-center justify-center gap-6 pb-16 opacity-70">
              <span className="text-sm text-slate-500 font-medium">Inserieren auf:</span>
              <div className="flex items-center gap-4">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                  <span className="font-bold text-orange-500">AutoScout24</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                  <span className="font-bold text-green-600">Autolina</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                  <span className="font-bold text-red-600">CARAUKTION</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-28 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-sky-100 text-sky-700 hover:bg-sky-100 border-0 rounded-full px-4 py-1">
                {t("features.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                {t("features.title")}
              </h2>
              <p className="text-lg sm:text-xl text-slate-600">
                {t("features.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              <FeatureCard
                icon={Car}
                title={t("features.vehicleManagement")}
                description={t("features.vehicleManagementDesc")}
                gradient="from-sky-500 to-indigo-600"
                bgGradient="from-sky-50 to-indigo-50 border-sky-100"
              />
              <FeatureCard
                icon={Users}
                title={t("features.leadManagement")}
                description={t("features.leadManagementDesc")}
                gradient="from-emerald-500 to-teal-600"
                bgGradient="from-emerald-50 to-teal-50 border-emerald-100"
              />
              <FeatureCard
                icon={Zap}
                title={t("features.listingExport")}
                description={t("features.listingExportDesc")}
                gradient="from-orange-500 to-amber-600"
                bgGradient="from-orange-50 to-amber-50 border-orange-100"
              />
              <FeatureCard
                icon={BarChart3}
                title={t("features.realKpis")}
                description={t("features.realKpisDesc")}
                gradient="from-violet-500 to-purple-600"
                bgGradient="from-violet-50 to-purple-50 border-violet-100"
              />
              <FeatureCard
                icon={Receipt}
                title={t("features.quotesInvoices")}
                description={t("features.quotesInvoicesDesc")}
                gradient="from-rose-500 to-pink-600"
                bgGradient="from-rose-50 to-pink-50 border-rose-100"
              />
              <FeatureCard
                icon={Shield}
                title={t("features.swissHosting")}
                description={t("features.swissHostingDesc")}
                gradient="from-cyan-500 to-sky-600"
                bgGradient="from-cyan-50 to-sky-50 border-cyan-100"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="demo" className="py-20 sm:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0 rounded-full px-4 py-1">
                {t("howItWorks.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
                {t("howItWorks.title")}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
              <StepCard
                number={1}
                title={t("howItWorks.step1Title")}
                description={t("howItWorks.step1Desc")}
                icon={Target}
              />
              <StepCard
                number={2}
                title={t("howItWorks.step2Title")}
                description={t("howItWorks.step2Desc")}
                icon={Database}
              />
              <StepCard
                number={3}
                title={t("howItWorks.step3Title")}
                description={t("howItWorks.step3Desc")}
                icon={LineChart}
              />
            </div>
          </div>
        </section>

        {/* Testimonials with Real Avatars */}
        <section className="py-20 sm:py-28 bg-slate-900 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#0EA5E9_25%,transparent_25%,transparent_75%,#0EA5E9_75%,#0EA5E9),linear-gradient(45deg,#0EA5E9_25%,transparent_25%,transparent_75%,#0EA5E9_75%,#0EA5E9)] bg-[length:60px_60px] bg-[position:0_0,30px_30px]" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="bg-sky-500/20 text-sky-300 hover:bg-sky-500/20 border-0 rounded-full px-4 py-1 mb-4">
                {t("testimonials.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                {t("testimonials.title")}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
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

        {/* Pricing Section */}
        <section id="pricing" className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-sky-100 text-sky-700 hover:bg-sky-100 border-0 rounded-full px-4 py-1">
                {tPricing("badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                {tPricing("title")}
              </h2>
              <p className="text-lg sm:text-xl text-slate-600">
                {tPricing("subtitle")}
              </p>
            </div>

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
                  tPricing("starter.features.5"),
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
                  tPricing("professional.features.6"),
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
                  tPricing("business.features.6"),
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

            <p className="text-center text-sm text-slate-500 mt-8">
              {tPricing("priceNote")}
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 sm:py-28 bg-gradient-to-br from-sky-500 to-indigo-600 relative overflow-hidden">
          {/* Decorative blur elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                {t("cta.title")}
              </h2>
              <p className="text-xl text-sky-100 mb-10 leading-relaxed">
                {t("cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="h-14 px-10 text-base font-semibold bg-white text-indigo-600 hover:bg-slate-100 shadow-xl rounded-xl"
                >
                  <Link href="/register">
                    {t("cta.button")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-14 px-10 text-base font-semibold bg-transparent text-white border-2 border-white/30 hover:bg-white/10 rounded-xl"
                >
                  <Link href="/kontakt">
                    Demo vereinbaren
                  </Link>
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

// Helper Components
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  bgGradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  bgGradient: string;
}) {
  return (
    <Card className={`group border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient}`}>
      <CardContent className="p-8">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="relative text-center group">
      {/* Connecting Line (hidden on last item) */}
      {number < 3 && (
        <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-sky-200 via-indigo-200 to-transparent" />
      )}
      
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex flex-col items-center justify-center mx-auto mb-6 shadow-xl shadow-sky-500/30 group-hover:shadow-2xl group-hover:shadow-sky-500/40 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-8 h-8 mb-1" />
          <span className="text-xs font-bold opacity-75">STEP {number}</span>
        </div>
        <h3 className="font-bold text-slate-900 text-xl mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

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
      <div className="flex gap-1 mb-4">
        <span className="text-amber-400">★★★★★</span>
      </div>
      <p className="text-white/90 leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${gradient}`}>
          <span className="text-white font-bold">{initials}</span>
        </div>
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-sm text-slate-400">{role}</p>
        </div>
      </div>
    </div>
  );
}

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
    <Card
      className={`relative ${
        popular
          ? "border-sky-400 bg-gradient-to-br from-sky-50 to-indigo-50 shadow-2xl shadow-sky-200 scale-105"
          : enterprise
          ? "bg-slate-50 border-slate-300"
          : free
          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50"
          : "border-slate-200 bg-white"
      } hover:shadow-xl transition-all duration-300 rounded-2xl`}
    >
      {popular && popularLabel && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 border-0 shadow-lg rounded-full px-4 py-1">
            ✨ {popularLabel}
          </Badge>
        </div>
      )}
      <CardContent className="p-6 pt-8">
        <h3 className="font-bold text-slate-900 text-xl mb-2">{name}</h3>
        <p className="text-sm text-slate-600 mb-6">{description}</p>
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
              <span className="text-slate-500 ml-2">{perMonth}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-slate-900">{price}</span>
          )}
        </div>
        <ul className="space-y-3 mb-8">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-sm text-slate-700"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                popular ? "bg-sky-100" : free ? "bg-emerald-100" : "bg-emerald-100"
              }`}>
                <Check className={`h-3 w-3 ${popular ? "text-sky-600" : "text-emerald-600"}`} />
              </div>
              {feature}
            </li>
          ))}
        </ul>
        <Button
          className={`w-full rounded-xl ${
            popular
              ? "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-lg shadow-sky-500/30"
              : free
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30"
              : "border-slate-300 hover:bg-slate-50"
          }`}
          variant={popular || free ? "default" : "outline"}
          asChild
        >
          <Link href={enterprise ? "mailto:enterprise@dealeros.ch" : "/register"}>
            {ctaText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
