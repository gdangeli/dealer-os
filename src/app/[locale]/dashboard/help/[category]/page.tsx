"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const categoryArticles: Record<string, string[]> = {
  "getting-started": ["first-steps", "navigation", "settings-overview"],
  "vehicles": ["add-vehicle", "edit-vehicle", "vehicle-photos", "standtime-alerts"],
  "leads": ["manage-leads", "lead-status", "follow-up"],
  "customers": ["add-customer", "customer-types", "customer-history"],
  "quotes": ["create-quote", "quote-positions", "send-quote", "convert-invoice"],
  "invoices": ["create-invoice", "payment-tracking", "reminders"],
  "integrations": ["bexio-setup", "whatsapp-setup", "email-templates"],
  "analytics": ["dashboard-overview", "reports", "export-data"]
};

const categoryIcons: Record<string, string> = {
  "getting-started": "🚀",
  "vehicles": "🚙",
  "leads": "💬",
  "customers": "👥",
  "quotes": "📄",
  "invoices": "🧾",
  "integrations": "🔗",
  "analytics": "📈"
};

export default function HelpCategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const t = useTranslations("help");

  const articles = categoryArticles[category] || [];
  const icon = categoryIcons[category] || "📖";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/help" className="hover:text-slate-700">
          {t("title")}
        </Link>
        <span>›</span>
        <span className="text-slate-900">{t(`categories.${category}.title`)}</span>
      </nav>

      {/* Category Header */}
      <div className="flex items-center gap-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{t(`categories.${category}.title`)}</h1>
          <p className="text-slate-600">{t(`categories.${category}.description`)}</p>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {articles.map((article, index) => (
          <Link key={article} href={`/dashboard/help/${category}/${article}`}>
            <Card className="hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm text-slate-600">
                      {index + 1}
                    </span>
                    {t(`categories.${category}.articles.${article}.title`)}
                  </CardTitle>
                  <span className="text-slate-400">→</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="ml-11">
                  {t(`categories.${category}.articles.${article}.description`)}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Back Link */}
      <div className="pt-4">
        <Link
          href="/dashboard/help"
          className="text-slate-600 hover:text-slate-900 flex items-center gap-2"
        >
          ← {t("backToOverview")}
        </Link>
      </div>
    </div>
  );
}
