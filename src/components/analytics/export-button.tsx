"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ExportData {
  // KPIs
  leadsTotal: number;
  leadsWon: number;
  conversionRate: number;
  totalRevenue: number;
  vehiclesInStock: number;
  vehiclesSold: number;
  avgStandingTime: number | null;
  avgMargin: number | null;
  avgMarginPercent: number | null;
  // Trends
  currentMonthLeads: number;
  prevMonthLeads: number;
  currentMonthRevenue: number;
  prevMonthRevenue: number;
  currentMonthSales: number;
  prevMonthSales: number;
  // Top brands
  topBrands: { brand: string; sales: number; revenue: number }[];
  // Leads by source
  leadsBySource: { source: string; count: number }[];
  // Time period
  rangeLabel: string;
}

export function ExportButton({ data }: { data: ExportData }) {
  const [isExporting, setIsExporting] = useState(false);

  const generateCSV = () => {
    setIsExporting(true);

    try {
      const lines: string[] = [];
      const now = new Date().toLocaleDateString("de-CH");

      // Header
      lines.push(`DealerOS Analytics Export`);
      lines.push(`Exportiert am: ${now}`);
      lines.push(`Zeitraum: ${data.rangeLabel}`);
      lines.push("");

      // KPIs Section
      lines.push("=== KERNKENNZAHLEN ===");
      lines.push(`Metrik;Wert`);
      lines.push(`Leads Total;${data.leadsTotal}`);
      lines.push(`Leads Gewonnen;${data.leadsWon}`);
      lines.push(`Conversion Rate;${data.conversionRate}%`);
      lines.push(`Gesamtumsatz;CHF ${(data.totalRevenue / 100).toLocaleString("de-CH")}`);
      lines.push(`Fahrzeuge im Bestand;${data.vehiclesInStock}`);
      lines.push(`Fahrzeuge Verkauft;${data.vehiclesSold}`);
      lines.push(`⌀ Standzeit (Tage);${data.avgStandingTime ?? "N/A"}`);
      lines.push(`⌀ Marge;${data.avgMargin ? `CHF ${data.avgMargin.toLocaleString("de-CH")}` : "N/A"}`);
      lines.push(`⌀ Marge (%);${data.avgMarginPercent ?? "N/A"}%`);
      lines.push("");

      // Trend Comparison
      lines.push("=== TREND-VERGLEICH (Aktueller vs. Vormonat) ===");
      lines.push(`Metrik;Aktueller Monat;Vormonat;Änderung`);
      
      const calcChange = (curr: number, prev: number) => {
        if (prev === 0) return "N/A";
        const change = ((curr - prev) / prev) * 100;
        return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
      };
      
      lines.push(`Leads;${data.currentMonthLeads};${data.prevMonthLeads};${calcChange(data.currentMonthLeads, data.prevMonthLeads)}`);
      lines.push(`Umsatz (CHF);${(data.currentMonthRevenue / 100).toLocaleString("de-CH")};${(data.prevMonthRevenue / 100).toLocaleString("de-CH")};${calcChange(data.currentMonthRevenue, data.prevMonthRevenue)}`);
      lines.push(`Verkäufe;${data.currentMonthSales};${data.prevMonthSales};${calcChange(data.currentMonthSales, data.prevMonthSales)}`);
      lines.push("");

      // Top Brands
      if (data.topBrands.length > 0) {
        lines.push("=== TOP MARKEN NACH VERKAUF ===");
        lines.push(`Marke;Verkäufe;Umsatz`);
        data.topBrands.forEach((brand) => {
          lines.push(`${brand.brand};${brand.sales};CHF ${brand.revenue.toLocaleString("de-CH")}`);
        });
        lines.push("");
      }

      // Leads by Source
      if (data.leadsBySource.length > 0) {
        lines.push("=== LEADS NACH QUELLE ===");
        lines.push(`Quelle;Anzahl`);
        data.leadsBySource.forEach((source) => {
          lines.push(`${source.source};${source.count}`);
        });
      }

      // Create and download file
      const csvContent = lines.join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dealeros-analytics-${now.replace(/\./g, "-")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generateCSV}
      disabled={isExporting}
      className="gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {isExporting ? "Exportiere..." : "CSV Export"}
    </Button>
  );
}
