import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoVideoButton } from "@/components/landing/demo-video-modal";
import { Link } from "@/i18n/navigation";
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
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-sky-50 via-white to-white py-16 sm:py-24 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Trust Badge */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 bg-white border border-sky-200 rounded-full px-4 py-2 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-slate-700">
                      {t("hero.badge")}
                    </span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-600">
                    {t("hero.trustCount")}
                  </span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-slate-900 leading-tight tracking-tight">
                {t("hero.headline1")}
                <br />
                <span className="text-sky-600">{t("hero.headline2")}</span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-slate-600 text-center max-w-2xl mx-auto leading-relaxed">
                {t("hero.description")}
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="h-14 px-8 text-base font-semibold bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-600/25 hover:shadow-sky-600/40 transition-all"
                >
                  <Link href="/register">
                    {t("hero.cta")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <DemoVideoButton className="h-14 px-8 text-base font-medium border-slate-300 hover:bg-slate-50" />
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{t("hero.noCreditCard")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{t("hero.quickStart")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>{t("hero.swissHosting")}</span>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-16 sm:mt-20 max-w-5xl mx-auto">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-b from-sky-100/60 to-transparent rounded-3xl blur-2xl" />
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
                        {t("dashboard.urlBar")}
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-6 bg-slate-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                      <DashboardCard
                        label={t("dashboard.vehicles")}
                        value="32"
                        subtext={t("dashboard.thisWeek")}
                        icon={Car}
                        positive
                      />
                      <DashboardCard
                        label={t("dashboard.avgStandtime")}
                        value="38"
                        unit={t("dashboard.days")}
                        subtext={t("dashboard.vsLastMonth")}
                        icon={Clock}
                        positive
                      />
                      <DashboardCard
                        label={t("dashboard.openLeads")}
                        value="8"
                        subtext={t("dashboard.noResponse")}
                        icon={Users}
                        warning
                      />
                      <DashboardCard
                        label={t("dashboard.avgMargin")}
                        value="CHF 2'840"
                        subtext={t("dashboard.marginUp")}
                        icon={TrendingUp}
                        positive
                      />
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {t("dashboard.recentActivity")}
                        </h3>
                      </div>
                      <div className="divide-y divide-slate-100">
                        <ActivityItem
                          icon={TrendingUp}
                          iconBg="bg-emerald-100"
                          iconColor="text-emerald-600"
                          title={t("dashboard.activity1Title")}
                          subtitle={t("dashboard.activity1Sub")}
                          time={t("dashboard.activity1Time")}
                        />
                        <ActivityItem
                          icon={Users}
                          iconBg="bg-sky-100"
                          iconColor="text-sky-600"
                          title={t("dashboard.activity2Title")}
                          subtitle={t("dashboard.activity2Sub")}
                          time={t("dashboard.activity2Time")}
                        />
                        <ActivityItem
                          icon={Clock}
                          iconBg="bg-amber-100"
                          iconColor="text-amber-600"
                          title={t("dashboard.activity3Title")}
                          subtitle={t("dashboard.activity3Sub")}
                          badge={t("dashboard.actionNeeded")}
                        />
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
              <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-slate-900">
                    50+
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {t("socialProof.garagesInBeta")}
                  </p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-200" />
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-slate-900">
                    2&apos;000+
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {t("socialProof.vehiclesManaged")}
                  </p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-200" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-3xl sm:text-4xl font-bold text-slate-900">
                      4.8
                    </p>
                    <Star className="h-6 w-6 fill-amber-400 text-amber-400 mt-1" />
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {t("socialProof.customerRating")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {t("socialProof.swissHosted")}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <Lock className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {t("socialProof.gdprCompliant")}
                  </span>
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
                {t("problems.title")}
              </h2>
              <p className="text-lg text-slate-600">{t("problems.subtitle")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
              <ProblemCard
                icon={BarChart3}
                title={t("problems.noOverview")}
                description={t("problems.noOverviewDesc")}
              />
              <ProblemCard
                icon={Clock}
                title={t("problems.longStanders")}
                description={t("problems.longStandersDesc")}
              />
              <ProblemCard
                icon={Users}
                title={t("problems.lostLeads")}
                description={t("problems.lostLeadsDesc")}
              />
            </div>

            <div className="flex justify-center mb-16">
              <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center shadow-lg">
                <ChevronRight className="h-6 w-6 text-white rotate-90" />
              </div>
            </div>

            <div className="max-w-3xl mx-auto text-center">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-4">
                {t("solution.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {t("solution.title")}
              </h2>
              <p className="text-lg text-slate-600">{t("solution.description")}</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-28 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 bg-white">
                {t("features.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                {t("features.title")}
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                {t("features.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              <FeatureCard
                icon={Car}
                title={t("features.vehicleManagement")}
                description={t("features.vehicleManagementDesc")}
                iconBg="bg-sky-100"
                iconColor="text-sky-600"
              />
              <FeatureCard
                icon={Clock}
                title={t("features.standtimeTracking")}
                description={t("features.standtimeTrackingDesc")}
                iconBg="bg-amber-100"
                iconColor="text-amber-600"
              />
              <FeatureCard
                icon={Users}
                title={t("features.leadManagement")}
                description={t("features.leadManagementDesc")}
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
              />
              <FeatureCard
                icon={BarChart3}
                title={t("features.realKpis")}
                description={t("features.realKpisDesc")}
                iconBg="bg-violet-100"
                iconColor="text-violet-600"
              />
              <FeatureCard
                icon={Zap}
                title={t("features.listingExport")}
                description={t("features.listingExportDesc")}
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
              />
              <FeatureCard
                icon={Shield}
                title={t("features.swissHosting")}
                description={t("features.swissHostingDesc")}
                iconBg="bg-red-100"
                iconColor="text-red-600"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="demo" className="py-20 sm:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">
                {t("howItWorks.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                {t("howItWorks.title")}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <StepCard
                number={1}
                title={t("howItWorks.step1Title")}
                description={t("howItWorks.step1Desc")}
              />
              <StepCard
                number={2}
                title={t("howItWorks.step2Title")}
                description={t("howItWorks.step2Desc")}
              />
              <StepCard
                number={3}
                title={t("howItWorks.step3Title")}
                description={t("howItWorks.step3Desc")}
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-28 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="bg-sky-500/20 text-sky-300 hover:bg-sky-500/20 mb-4">
                {t("testimonials.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                {t("testimonials.title")}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              <TestimonialCard
                quote={t("testimonials.quote1")}
                name={t("testimonials.name1")}
                role={t("testimonials.role1")}
              />
              <TestimonialCard
                quote={t("testimonials.quote2")}
                name={t("testimonials.name2")}
                role={t("testimonials.role2")}
              />
              <TestimonialCard
                quote={t("testimonials.quote3")}
                name={t("testimonials.name3")}
                role={t("testimonials.role3")}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 sm:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">
                {tPricing("badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                {tPricing("title")}
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                {tPricing("subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <PricingCard
                name={tPricing("starter.name")}
                description={tPricing("starter.description")}
                price={tPricing("starter.price")}
                perMonth={tPricing("perMonth")}
                features={[
                  tPricing("starter.features.0"),
                  tPricing("starter.features.1"),
                  tPricing("starter.features.2"),
                  tPricing("starter.features.3"),
                  tPricing("starter.features.4"),
                  tPricing("starter.features.5"),
                ]}
                ctaText={tPricing("freeTrial")}
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

        {/* FAQ Section */}
        <section className="py-20 sm:py-28 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 bg-white">
                {t("faq.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                {t("faq.title")}
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <FaqItem question={t("faq.q1")} answer={t("faq.a1")} />
              <FaqItem question={t("faq.q2")} answer={t("faq.a2")} />
              <FaqItem question={t("faq.q3")} answer={t("faq.a3")} />
              <FaqItem question={t("faq.q4")} answer={t("faq.a4")} />
              <FaqItem question={t("faq.q5")} answer={t("faq.a5")} />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 sm:py-28 bg-gradient-to-br from-sky-600 to-sky-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff),linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff)] bg-[length:60px_60px] bg-[position:0_0,30px_30px]" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                {t("cta.title")}
              </h2>
              <p className="text-xl text-sky-100 mb-10 max-w-2xl mx-auto">
                {t("cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="h-14 px-10 text-base font-semibold bg-white text-sky-700 hover:bg-sky-50 shadow-xl"
                >
                  <Link href="/register">
                    {t("cta.button")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sky-100">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="text-sm">{t("cta.swissMade")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">{t("cta.swissHosting")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <span className="text-sm">{t("cta.zurichSupport")}</span>
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

// Helper Components
function DashboardCard({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  positive,
  warning,
}: {
  label: string;
  value: string;
  unit?: string;
  subtext: string;
  icon: React.ElementType;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <p className="text-2xl font-bold text-slate-900">
        {value}{" "}
        {unit && <span className="text-base font-normal text-slate-500">{unit}</span>}
      </p>
      <p
        className={`text-xs font-medium mt-1 ${
          warning ? "text-amber-600" : positive ? "text-emerald-600" : "text-slate-500"
        }`}
      >
        {subtext}
      </p>
    </div>
  );
}

function ActivityItem({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  time,
  badge,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  time?: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {time && <span className="text-xs text-slate-400">{time}</span>}
      {badge && (
        <Badge
          variant="outline"
          className="text-amber-600 border-amber-200 bg-amber-50 text-xs"
        >
          {badge}
        </Badge>
      )}
    </div>
  );
}

function ProblemCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-red-600" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card className="border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
      <CardContent className="p-6">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${iconBg}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-sky-600/25">
        {number}
      </div>
      <h3 className="font-semibold text-slate-900 text-lg mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-600 text-white font-semibold text-lg">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-white text-sm">{name}</p>
            <p className="text-xs text-slate-400">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
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
}) {
  return (
    <Card
      className={`relative ${
        popular
          ? "border-sky-300 bg-sky-50/50 shadow-xl shadow-sky-100"
          : enterprise
          ? "bg-slate-50"
          : "border-slate-200"
      }`}
    >
      {popular && popularLabel && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-sky-600 hover:bg-sky-600 shadow-lg">
            {popularLabel}
          </Badge>
        </div>
      )}
      <CardContent className="p-6">
        <h3 className="font-semibold text-slate-900 text-lg mb-1">{name}</h3>
        <p className="text-sm text-slate-500 mb-6">{description}</p>
        <div className="mb-6">
          {perMonth ? (
            <>
              <span className="text-4xl font-bold text-slate-900">{price}</span>
              <span className="text-slate-500 ml-1">{perMonth}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-slate-900">{price}</span>
          )}
        </div>
        <ul className="space-y-3 mb-8">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm text-slate-600"
            >
              <Check
                className={`h-4 w-4 shrink-0 mt-0.5 ${
                  popular ? "text-sky-600" : "text-emerald-500"
                }`}
              />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          variant={popular ? "default" : "outline"}
          className={`w-full ${popular ? "bg-sky-600 hover:bg-sky-700" : ""}`}
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

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-2">{question}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{answer}</p>
    </div>
  );
}
