import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  StockLineChart, 
  SalesBarChart, 
  LeadsAreaChart, 
  RevenueLineChart,
  StandingTimeBarChart,
  ConversionFunnelChart,
  LeadsBySourceChart,
  TopBrandsChart,
  MiniSparkline,
  TrendIndicator,
  SOURCE_COLORS
} from "@/components/analytics/charts";
import { TimeRangeFilter, type TimeRange, getTimeRangeDays, getTimeRangeLabel } from "@/components/analytics/time-range-filter";
import { ExportButton } from "@/components/analytics/export-button";

// Helper: Calculate days in stock
function calculateDaysInStock(acquiredAt: string | null): number {
  if (!acquiredAt) return 0;
  const acquired = new Date(acquiredAt);
  const now = new Date();
  return Math.floor((now.getTime() - acquired.getTime()) / (1000 * 60 * 60 * 24));
}

// Recommendation based on standing time
function getRecommendation(days: number): { text: string; urgency: "low" | "medium" | "high" } {
  if (days > 90) {
    return { text: "Dringend: Aggressive Preisanpassung empfohlen", urgency: "high" };
  } else if (days > 60) {
    return { text: "Preisanpassung um 5-10% empfohlen", urgency: "medium" };
  } else if (days > 30) {
    return { text: "Marketing verstärken", urgency: "low" };
  }
  return { text: "Normal", urgency: "low" };
}

// Format Rappen to CHF
function formatCHF(rappen: number): string {
  return (rappen / 100).toLocaleString("de-CH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Get source label for display
function getSourceLabel(source: string | null): string {
  const labels: Record<string, string> = {
    website: "Website",
    autoscout24: "AutoScout24",
    "mobile.de": "Mobile.de",
    tutti: "Tutti",
    walkin: "Walk-in",
    phone: "Telefon",
    whatsapp: "WhatsApp",
    other: "Andere",
  };
  return labels[source || "other"] || source || "Unbekannt";
}

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const timeRange = (params.range as TimeRange) || "30d";
  const daysBack = getTimeRangeDays(timeRange);
  const rangeLabel = getTimeRangeLabel(timeRange);
  
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dealer } = await supabase
    .from("dealers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!dealer?.id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">Kein Konto gefunden</h2>
      </div>
    );
  }

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - daysBack);
  const rangeStartISO = rangeStart.toISOString();

  // === DATE HELPERS ===
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // === LOAD DATA ===
  
  // All vehicles
  const { data: allVehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("dealer_id", dealer.id);
  const vehicles = allVehicles || [];

  // Leads in range
  const { data: allLeads } = await supabase
    .from("leads")
    .select("*")
    .eq("dealer_id", dealer.id);
  const leads = allLeads || [];
  
  const leadsInRange = leads.filter(l => new Date(l.created_at) >= rangeStart);
  const leadsWonInRange = leadsInRange.filter(l => l.status === "won");

  // Quotes (Offers)
  const { data: allQuotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("dealer_id", dealer.id);
  const quotes = allQuotes || [];
  
  const openQuotes = quotes.filter(q => ["draft", "sent", "viewed"].includes(q.status));
  const quotesInRange = quotes.filter(q => new Date(q.created_at) >= rangeStart);
  const acceptedQuotesInRange = quotesInRange.filter(q => q.status === "accepted" || q.status === "invoiced");

  // Invoices
  const { data: allInvoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("dealer_id", dealer.id);
  const invoices = allInvoices || [];
  
  const paidInvoicesInRange = invoices.filter(i => 
    i.status === "paid" && i.paid_at && new Date(i.paid_at) >= rangeStart
  );
  const totalRevenueInRange = paidInvoicesInRange.reduce((sum, i) => sum + (i.total || 0), 0);

  // === CALCULATE KPIs ===
  
  const inStockVehicles = vehicles.filter(v => v.status === "in_stock");
  const soldVehicles = vehicles.filter(v => v.status === "sold");
  
  // Leads this week (for main card)
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const leadsThisWeek = leads.filter(l => new Date(l.created_at) >= oneWeekAgo);
  
  // Conversion Rate (Leads → Won in range)
  const conversionRate = leadsInRange.length > 0 
    ? Math.round((leadsWonInRange.length / leadsInRange.length) * 100) 
    : 0;

  // Quote Conversion (Sent → Accepted)
  const sentQuotesInRange = quotesInRange.filter(q => q.sent_at);
  const quoteConversionRate = sentQuotesInRange.length > 0
    ? Math.round((acceptedQuotesInRange.length / sentQuotesInRange.length) * 100)
    : 0;

  // Sales this month
  const soldThisMonth = soldVehicles.filter(v => 
    v.sold_at && new Date(v.sold_at) >= firstDayOfMonth
  );
  
  // Sales previous month
  const soldPrevMonth = soldVehicles.filter(v => {
    if (!v.sold_at) return false;
    const soldDate = new Date(v.sold_at);
    return soldDate >= firstDayOfPrevMonth && soldDate <= lastDayOfPrevMonth;
  });

  // Average standing time
  const soldWithDates = soldVehicles.filter(v => v.sold_at && v.acquired_at);
  const avgStandingTime = soldWithDates.length > 0
    ? Math.round(soldWithDates.reduce((sum, v) => {
        const acquired = new Date(v.acquired_at!);
        const sold = new Date(v.sold_at!);
        return sum + Math.floor((sold.getTime() - acquired.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / soldWithDates.length)
    : null;

  // Average margin
  const vehiclesWithMargin = soldVehicles.filter(v => 
    v.purchase_price && v.asking_price && v.purchase_price > 0
  );
  const avgMargin = vehiclesWithMargin.length > 0
    ? Math.round(vehiclesWithMargin.reduce((sum, v) => 
        sum + (v.asking_price! - v.purchase_price!), 0) / vehiclesWithMargin.length)
    : null;
  
  const avgMarginPercent = vehiclesWithMargin.length > 0
    ? Math.round(vehiclesWithMargin.reduce((sum, v) => 
        sum + ((v.asking_price! - v.purchase_price!) / v.purchase_price! * 100), 0) / vehiclesWithMargin.length)
    : null;

  // === TREND DATA: Current vs Previous Month ===
  
  // Leads
  const leadsThisMonth = leads.filter(l => new Date(l.created_at) >= firstDayOfMonth);
  const leadsPrevMonth = leads.filter(l => {
    const d = new Date(l.created_at);
    return d >= firstDayOfPrevMonth && d <= lastDayOfPrevMonth;
  });

  // Revenue
  const revenueThisMonth = invoices
    .filter(i => i.status === "paid" && i.paid_at && new Date(i.paid_at) >= firstDayOfMonth)
    .reduce((sum, i) => sum + (i.total || 0), 0);
  const revenuePrevMonth = invoices
    .filter(i => {
      if (i.status !== "paid" || !i.paid_at) return false;
      const d = new Date(i.paid_at);
      return d >= firstDayOfPrevMonth && d <= lastDayOfPrevMonth;
    })
    .reduce((sum, i) => sum + (i.total || 0), 0);

  // === NEW KPIs ===

  // Top 5 brands by sales
  const brandSales: Record<string, { sales: number; revenue: number }> = {};
  soldVehicles.forEach(v => {
    const brand = v.make || "Unbekannt";
    if (!brandSales[brand]) {
      brandSales[brand] = { sales: 0, revenue: 0 };
    }
    brandSales[brand].sales++;
    brandSales[brand].revenue += v.asking_price || 0;
  });
  const topBrandsData = Object.entries(brandSales)
    .map(([brand, data]) => ({ brand, ...data }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // Leads by source
  const leadsBySource: Record<string, number> = {};
  leadsInRange.forEach(l => {
    const source = l.source || "other";
    leadsBySource[source] = (leadsBySource[source] || 0) + 1;
  });
  const leadsBySourceData = Object.entries(leadsBySource)
    .map(([source, count]) => ({
      source: getSourceLabel(source),
      count,
      color: SOURCE_COLORS[source] || SOURCE_COLORS.other,
    }))
    .sort((a, b) => b.count - a.count);

  // === CHARTS DATA ===

  // Leads over time (grouped by day/week depending on range)
  const leadsOverTime: { date: string; leads: number; won: number }[] = [];
  const groupByWeek = daysBack > 30;
  
  if (groupByWeek) {
    // Group by week for longer periods
    const weeks = Math.ceil(daysBack / 7);
    for (let i = weeks - 1; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);
      
      const weekLabel = `KW${getWeekNumber(weekEnd)}`;
      const weekLeads = leads.filter(l => {
        const d = new Date(l.created_at);
        return d >= weekStart && d < weekEnd;
      });
      
      leadsOverTime.push({
        date: weekLabel,
        leads: weekLeads.length,
        won: weekLeads.filter(l => l.status === "won").length,
      });
    }
  } else {
    // Group by day for shorter periods
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit" });
      
      const dayLeads = leads.filter(l => {
        const ld = new Date(l.created_at);
        return ld.toDateString() === date.toDateString();
      });
      
      leadsOverTime.push({
        date: dateStr,
        leads: dayLeads.length,
        won: dayLeads.filter(l => l.status === "won").length,
      });
    }
  }

  // Revenue over time
  const revenueOverTime: { date: string; umsatz: number; offerten: number }[] = [];
  const months = Math.min(Math.ceil(daysBack / 30), 12);
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toLocaleDateString("de-CH", { month: "short" });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthInvoices = invoices.filter(inv => {
      if (inv.status !== "paid" || !inv.paid_at) return false;
      const paidDate = new Date(inv.paid_at);
      return paidDate >= monthStart && paidDate <= monthEnd;
    });
    
    const monthQuotes = quotes.filter(q => {
      if (!q.sent_at) return false;
      const sentDate = new Date(q.sent_at);
      return sentDate >= monthStart && sentDate <= monthEnd;
    });
    
    revenueOverTime.push({
      date: monthStr,
      umsatz: monthInvoices.reduce((sum, i) => sum + (i.total || 0), 0) / 100,
      offerten: monthQuotes.reduce((sum, q) => sum + (q.total || 0), 0) / 100,
    });
  }

  // Standing time distribution
  const standingTimeData: { range: string; count: number; color: string }[] = [
    { range: "0-30 Tage", count: 0, color: "#22c55e" },
    { range: "31-60 Tage", count: 0, color: "#f59e0b" },
    { range: "61-90 Tage", count: 0, color: "#f97316" },
    { range: ">90 Tage", count: 0, color: "#ef4444" },
  ];
  
  inStockVehicles.forEach(v => {
    const days = calculateDaysInStock(v.acquired_at);
    if (days <= 30) standingTimeData[0].count++;
    else if (days <= 60) standingTimeData[1].count++;
    else if (days <= 90) standingTimeData[2].count++;
    else standingTimeData[3].count++;
  });

  // Conversion Funnel
  const funnelData = [
    { stage: "Leads", count: leadsInRange.length, color: "#3b82f6" },
    { stage: "Kontaktiert", count: leadsInRange.filter(l => ["contacted", "qualified", "won", "lost"].includes(l.status)).length, color: "#8b5cf6" },
    { stage: "Qualifiziert", count: leadsInRange.filter(l => ["qualified", "won"].includes(l.status)).length, color: "#f59e0b" },
    { stage: "Gewonnen", count: leadsWonInRange.length, color: "#22c55e" },
  ];

  // Stock over time (last 6 months)
  const stockOverTime: { date: string; bestand: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toLocaleDateString("de-CH", { month: "short", year: "2-digit" });
    const cutoff = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const count = vehicles.filter(v => {
      const created = new Date(v.created_at);
      const sold = v.sold_at ? new Date(v.sold_at) : null;
      return created <= cutoff && (!sold || sold > cutoff);
    }).length;
    stockOverTime.push({ date: monthStr, bestand: count });
  }

  // Sales per month
  const salesByMonth: { month: string; verkäufe: number; umsatz: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toLocaleDateString("de-CH", { month: "short" });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const monthSales = soldVehicles.filter(v => {
      if (!v.sold_at) return false;
      const soldDate = new Date(v.sold_at);
      return soldDate >= monthStart && soldDate <= monthEnd;
    });
    const umsatz = monthSales.reduce((sum, v) => sum + (v.asking_price || 0), 0);
    salesByMonth.push({ month: monthStr, verkäufe: monthSales.length, umsatz });
  }

  // Sparkline data
  const leadSparkline = leadsOverTime.slice(-7).map(d => d.leads);
  const revenueSparkline = revenueOverTime.slice(-6).map(d => d.umsatz);
  const salesSparkline = salesByMonth.map(d => d.verkäufe);

  // === Long-stander analysis ===
  const longStanders = inStockVehicles
    .filter(v => v.acquired_at)
    .map(v => ({
      ...v,
      daysInStock: calculateDaysInStock(v.acquired_at),
    }))
    .filter(v => v.daysInStock > 30)
    .sort((a, b) => b.daysInStock - a.daysInStock);

  const over30Days = longStanders.filter(v => v.daysInStock > 30 && v.daysInStock <= 60).length;
  const over60Days = longStanders.filter(v => v.daysInStock > 60 && v.daysInStock <= 90).length;
  const over90Days = longStanders.filter(v => v.daysInStock > 90).length;

  // Top performers
  const fastestSales = soldWithDates
    .map(v => ({
      ...v,
      daysToSell: Math.floor(
        (new Date(v.sold_at!).getTime() - new Date(v.acquired_at!).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => a.daysToSell - b.daysToSell)
    .slice(0, 5);

  const bestMargins = vehiclesWithMargin
    .map(v => ({
      ...v,
      margin: v.asking_price! - v.purchase_price!,
      marginPercent: Math.round((v.asking_price! - v.purchase_price!) / v.purchase_price! * 100),
    }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 5);

  // Export data
  const exportData = {
    leadsTotal: leadsInRange.length,
    leadsWon: leadsWonInRange.length,
    conversionRate,
    totalRevenue: totalRevenueInRange,
    vehiclesInStock: inStockVehicles.length,
    vehiclesSold: soldVehicles.length,
    avgStandingTime,
    avgMargin,
    avgMarginPercent,
    currentMonthLeads: leadsThisMonth.length,
    prevMonthLeads: leadsPrevMonth.length,
    currentMonthRevenue: revenueThisMonth,
    prevMonthRevenue: revenuePrevMonth,
    currentMonthSales: soldThisMonth.length,
    prevMonthSales: soldPrevMonth.length,
    topBrands: topBrandsData,
    leadsBySource: leadsBySourceData.map(d => ({ source: d.source, count: d.count })),
    rangeLabel,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="text-sm sm:text-base text-slate-600">
              KPIs und Auswertungen ({rangeLabel})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ExportButton data={exportData} />
            <Suspense fallback={<div className="h-9 w-64 bg-slate-100 rounded animate-pulse" />}>
              <TimeRangeFilter currentRange={timeRange} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Trend Comparison Cards */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            📊 Trend-Vergleich
            <Badge variant="outline" className="font-normal">vs. Vormonat</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm">
              <p className="text-xs sm:text-sm text-slate-500">Leads</p>
              <p className="text-xl sm:text-2xl font-bold">{leadsThisMonth.length}</p>
              <TrendIndicator current={leadsThisMonth.length} previous={leadsPrevMonth.length} />
            </div>
            <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm">
              <p className="text-xs sm:text-sm text-slate-500">Umsatz</p>
              <p className="text-xl sm:text-2xl font-bold">CHF {formatCHF(revenueThisMonth)}</p>
              <TrendIndicator current={revenueThisMonth} previous={revenuePrevMonth} format="currency" />
            </div>
            <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm">
              <p className="text-xs sm:text-sm text-slate-500">Verkäufe</p>
              <p className="text-xl sm:text-2xl font-bold">{soldThisMonth.length}</p>
              <TrendIndicator current={soldThisMonth.length} previous={soldPrevMonth.length} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">Leads / Woche</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-blue-600">{leadsThisWeek.length}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-xs sm:text-sm text-slate-500">
              {leadsInRange.length} im Zeitraum
            </p>
            {leadSparkline.length > 0 && (
              <div className="absolute bottom-2 right-2 w-16 sm:w-20 opacity-50">
                <MiniSparkline data={leadSparkline} color="#3b82f6" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">Offene Offerten</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-purple-600">{openQuotes.length}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              CHF {formatCHF(openQuotes.reduce((s, q) => s + (q.total || 0), 0))}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">Umsatz ({rangeLabel.split(" ")[1] || rangeLabel})</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-green-600">
              <span className="text-lg sm:text-2xl">CHF</span> {formatCHF(totalRevenueInRange)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-xs sm:text-sm text-slate-500">
              {paidInvoicesInRange.length} Rechnungen
            </p>
            {revenueSparkline.length > 0 && (
              <div className="absolute bottom-2 right-2 w-16 sm:w-20 opacity-50">
                <MiniSparkline data={revenueSparkline} color="#22c55e" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">Conversion Rate</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">
              <span className={conversionRate >= 20 ? "text-green-600" : conversionRate >= 10 ? "text-yellow-600" : "text-red-600"}>
                {conversionRate}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-xs sm:text-sm text-slate-500">
              {leadsWonInRange.length}/{leadsInRange.length} Leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">Im Bestand</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{inStockVehicles.length}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-xs sm:text-sm text-slate-500">
              {vehicles.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">Verkauft (Monat)</CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-green-600">{soldThisMonth.length}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-xs sm:text-sm text-slate-500">
              {soldVehicles.length} total
            </p>
            {salesSparkline.length > 0 && (
              <div className="absolute bottom-2 right-2 w-14 sm:w-16 opacity-50">
                <MiniSparkline data={salesSparkline} color="#22c55e" height={30} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">⌀ Standzeit</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">
              {avgStandingTime !== null ? `${avgStandingTime}d` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-xs sm:text-sm text-slate-500">
              {avgStandingTime !== null ? "verkaufte Fzg." : "Keine Daten"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">⌀ Marge</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">
              {avgMargin !== null ? (
                <span className={avgMargin >= 0 ? "text-green-600" : "text-red-600"}>
                  {avgMarginPercent}%
                </span>
              ) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              {avgMargin !== null ? `CHF ${avgMargin.toLocaleString("de-CH")}` : "Keine Daten"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* NEW: Top Brands & Leads by Source */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">🏆 Top 5 Marken</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Nach Verkaufszahl</CardDescription>
          </CardHeader>
          <CardContent>
            <TopBrandsChart data={topBrandsData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">📍 Lead-Quellen</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Woher kommen die Leads? ({rangeLabel})</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadsBySourceChart data={leadsBySourceData} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Leads über Zeit</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Neue Leads und Abschlüsse ({rangeLabel})</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <LeadsAreaChart data={leadsOverTime} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Lead-Funnel</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Conversion pro Stufe ({rangeLabel})</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ConversionFunnelChart data={funnelData} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Umsatz-Entwicklung</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Bezahlte Rechnungen vs. gesendete Offerten</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <RevenueLineChart data={revenueOverTime} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Standzeit-Verteilung</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Fahrzeuge im Bestand nach Alter</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <StandingTimeBarChart data={standingTimeData} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Bestandsentwicklung</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Fahrzeuge im Bestand (letzte 6 Monate)</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <StockLineChart data={stockOverTime} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Verkäufe pro Monat</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Anzahl & Umsatz (letzte 6 Monate)</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <SalesBarChart data={salesByMonth} />
          </CardContent>
        </Card>
      </div>

      {/* Standing Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-2">
            ⏱️ Standzeit-Analyse
            {over90Days > 0 && (
              <Badge variant="destructive">{over90Days} kritisch</Badge>
            )}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Fahrzeuge die länger als 30 Tage im Bestand sind
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-xs sm:text-sm">30-60d: <strong>{over30Days}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs sm:text-sm">60-90d: <strong>{over60Days}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs sm:text-sm">&gt;90d: <strong>{over90Days}</strong></span>
            </div>
          </div>

          {longStanders.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {longStanders.slice(0, 10).map((vehicle) => {
                const rec = getRecommendation(vehicle.daysInStock);
                return (
                  <Link key={vehicle.id} href={`/dashboard/vehicles/${vehicle.id}`}>
                    <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 rounded-lg border transition-colors hover:bg-slate-50 gap-2 ${
                      vehicle.daysInStock > 90 
                        ? "border-red-200 bg-red-50" 
                        : vehicle.daysInStock > 60 
                          ? "border-orange-200 bg-orange-50"
                          : "border-yellow-200 bg-yellow-50"
                    }`}>
                      <div>
                        <div className="font-medium text-sm sm:text-base">
                          {vehicle.make} {vehicle.model}
                          {vehicle.variant && <span className="text-slate-500"> {vehicle.variant}</span>}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">
                          CHF {vehicle.asking_price?.toLocaleString("de-CH") || "—"}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className={`font-bold text-sm sm:text-base ${
                          vehicle.daysInStock > 90 
                            ? "text-red-600" 
                            : vehicle.daysInStock > 60 
                              ? "text-orange-600"
                              : "text-yellow-600"
                        }`}>
                          {vehicle.daysInStock} Tage
                        </div>
                        <div className={`text-xs ${
                          rec.urgency === "high" 
                            ? "text-red-600 font-medium" 
                            : rec.urgency === "medium"
                              ? "text-orange-600"
                              : "text-slate-500"
                        }`}>
                          {rec.text}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {longStanders.length > 10 && (
                <p className="text-center text-xs sm:text-sm text-slate-500 pt-2">
                  ... und {longStanders.length - 10} weitere
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-slate-500">
              <div className="text-3xl sm:text-4xl mb-2">🎉</div>
              <p className="text-sm sm:text-base">Alle Fahrzeuge unter 30 Tagen Standzeit — ausgezeichnet!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">🚀 Schnellste Verkäufe</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Diese Fahrzeuge gingen am schnellsten weg</CardDescription>
          </CardHeader>
          <CardContent>
            {fastestSales.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {fastestSales.map((vehicle, i) => (
                  <div key={vehicle.id} className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-base sm:text-lg font-bold text-slate-400">#{i + 1}</span>
                      <div>
                        <div className="font-medium text-sm sm:text-base">{vehicle.make} {vehicle.model}</div>
                        <div className="text-xs sm:text-sm text-slate-500">
                          CHF {vehicle.asking_price?.toLocaleString("de-CH")}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-green-700 bg-green-100 text-xs sm:text-sm">
                      {vehicle.daysToSell}d
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4 sm:py-6 text-sm">
                Noch keine Verkaufsdaten mit Einkaufs- und Verkaufsdatum
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">💰 Beste Margen</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Die profitabelsten Fahrzeuge</CardDescription>
          </CardHeader>
          <CardContent>
            {bestMargins.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {bestMargins.map((vehicle, i) => (
                  <div key={vehicle.id} className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-base sm:text-lg font-bold text-slate-400">#{i + 1}</span>
                      <div>
                        <div className="font-medium text-sm sm:text-base">{vehicle.make} {vehicle.model}</div>
                        <div className="text-xs text-slate-500 hidden sm:block">
                          EK: CHF {vehicle.purchase_price?.toLocaleString("de-CH")} → VK: CHF {vehicle.asking_price?.toLocaleString("de-CH")}
                        </div>
                        <div className="text-xs text-slate-500 sm:hidden">
                          +{vehicle.marginPercent}% Marge
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-sm sm:text-base">
                        +CHF {vehicle.margin.toLocaleString("de-CH")}
                      </div>
                      <div className="text-xs text-slate-500 hidden sm:block">{vehicle.marginPercent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 sm:py-6">
                <p className="text-slate-500 text-sm">Noch keine Margen-Daten</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Erfassen Sie Einkaufspreise für Margen-Tracking
                </p>
                <Link href="/dashboard/vehicles">
                  <Button variant="outline" className="mt-3" size="sm">
                    Zu den Fahrzeugen
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper: Get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
