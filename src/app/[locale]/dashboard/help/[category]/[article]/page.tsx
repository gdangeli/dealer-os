"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function HelpArticlePage() {
  const params = useParams();
  const category = params.category as string;
  const article = params.article as string;
  const t = useTranslations("help");

  const categoryIcon = categoryIcons[category] || "📖";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/help" className="hover:text-slate-700">
          {t("title")}
        </Link>
        <span>›</span>
        <Link href={`/dashboard/help/${category}`} className="hover:text-slate-700">
          {t(`categories.${category}.title`)}
        </Link>
        <span>›</span>
        <span className="text-slate-900">
          {t(`categories.${category}.articles.${article}.title`)}
        </span>
      </nav>

      {/* Article Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{categoryIcon}</span>
          <Badge variant="secondary">{t(`categories.${category}.title`)}</Badge>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {t(`categories.${category}.articles.${article}.title`)}
        </h1>
        <p className="text-slate-600">
          {t(`categories.${category}.articles.${article}.description`)}
        </p>
      </div>

      {/* Article Content */}
      <Card>
        <CardContent className="py-6 prose prose-slate max-w-none">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: t.raw(`categories.${category}.articles.${article}.content`) 
            }} 
          />
        </CardContent>
      </Card>

      {/* Steps if available */}
      {t.has(`categories.${category}.articles.${article}.steps`) && (
        <Card>
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📝</span> {t("stepsTitle")}
            </h2>
            <ol className="space-y-4">
              {(t.raw(`categories.${category}.articles.${article}.steps`) as string[]).map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <div className="pt-1">
                    <p>{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Tips if available */}
      {t.has(`categories.${category}.articles.${article}.tips`) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-2">
              <span>💡</span> {t("tipsTitle")}
            </h3>
            <ul className="space-y-2 text-amber-800">
              {(t.raw(`categories.${category}.articles.${article}.tips`) as string[]).map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Link
          href="/dashboard/help"
          className="text-slate-600 hover:text-slate-900 flex items-center gap-2"
        >
          ← {t("backToOverview")}
        </Link>
        <Link
          href="mailto:support@dealeros.ch"
          className="text-blue-600 hover:text-blue-800"
        >
          {t("stillNeedHelp")} →
        </Link>
      </div>
    </div>
  );
}
