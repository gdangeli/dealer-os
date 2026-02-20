"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const helpCategories = [
  {
    id: "getting-started",
    icon: "🚀",
    articles: ["first-steps", "navigation", "settings-overview"]
  },
  {
    id: "vehicles",
    icon: "🚙",
    articles: ["add-vehicle", "edit-vehicle", "vehicle-photos", "standtime-alerts"]
  },
  {
    id: "leads",
    icon: "💬",
    articles: ["manage-leads", "lead-status", "follow-up"]
  },
  {
    id: "customers",
    icon: "👥",
    articles: ["add-customer", "customer-types", "customer-history"]
  },
  {
    id: "quotes",
    icon: "📄",
    articles: ["create-quote", "quote-positions", "send-quote", "convert-invoice"]
  },
  {
    id: "invoices",
    icon: "🧾",
    articles: ["create-invoice", "payment-tracking", "reminders"]
  },
  {
    id: "integrations",
    icon: "🔗",
    articles: ["bexio-setup", "whatsapp-setup", "email-templates"]
  },
  {
    id: "analytics",
    icon: "📈",
    articles: ["dashboard-overview", "reports", "export-data"]
  }
];

export default function HelpPage() {
  const t = useTranslations("help");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = helpCategories.filter(category => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const categoryName = t(`categories.${category.id}.title`).toLowerCase();
    const articleMatches = category.articles.some(article => 
      t(`categories.${category.id}.articles.${article}.title`).toLowerCase().includes(query)
    );
    return categoryName.includes(query) || articleMatches;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-slate-600 text-sm sm:text-base mb-6">{t("subtitle")}</p>
        
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-6 text-lg"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span>💡</span>
          <span className="font-semibold text-blue-900">{t("quickStart.title")}</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">Neu</Badge>
        </div>
        <p className="text-blue-800 text-sm mb-3">{t("quickStart.description")}</p>
        <Link 
          href="/dashboard/help/getting-started"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {t("quickStart.link")} →
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <CardTitle className="text-lg">
                    {t(`categories.${category.id}.title`)}
                  </CardTitle>
                  <CardDescription>
                    {t(`categories.${category.id}.description`)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.articles.map((article) => (
                  <li key={article}>
                    <Link
                      href={`/dashboard/help/${category.id}/${article}`}
                      className="text-sm text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-2"
                    >
                      <span className="text-slate-400">›</span>
                      {t(`categories.${category.id}.articles.${article}.title`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Support */}
      <Card className="bg-slate-50">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🙋</span>
              <div>
                <h3 className="font-semibold">{t("support.title")}</h3>
                <p className="text-sm text-slate-600">{t("support.description")}</p>
              </div>
            </div>
            <Link
              href="mailto:support@dealeros.ch"
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {t("support.button")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
