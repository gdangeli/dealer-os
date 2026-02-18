"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StockDataPoint {
  date: string;
  bestand: number;
}

interface SalesDataPoint {
  month: string;
  verkäufe: number;
  umsatz: number;
}

interface LeadsDataPoint {
  date: string;
  leads: number;
  won: number;
}

interface RevenueDataPoint {
  date: string;
  umsatz: number;
  offerten: number;
}

interface StandingTimeDataPoint {
  range: string;
  count: number;
  color: string;
}

interface LeadsBySourceDataPoint {
  source: string;
  count: number;
  color: string;
}

interface TopBrandsDataPoint {
  brand: string;
  sales: number;
  revenue: number;
}

const COLORS = {
  primary: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  slate: "#64748b",
  pink: "#ec4899",
  cyan: "#06b6d4",
  orange: "#f97316",
  lime: "#84cc16",
};

const SOURCE_COLORS: Record<string, string> = {
  website: COLORS.primary,
  autoscout24: "#ff6600",
  "mobile.de": "#1a1a1a",
  tutti: "#e74c3c",
  walkin: COLORS.success,
  phone: COLORS.purple,
  whatsapp: "#25D366",
  other: COLORS.slate,
};

export function StockLineChart({ data }: { data: StockDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Noch keine Daten vorhanden
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          stroke="#64748b"
          fontSize={12}
          tick={{ fontSize: 10 }}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          allowDecimals={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
        />
        <Line
          type="monotone"
          dataKey="bestand"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: "#3b82f6", strokeWidth: 2 }}
          name="Fahrzeuge im Bestand"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SalesBarChart({ data }: { data: SalesDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Noch keine Verkäufe erfasst
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="month" 
          stroke="#64748b"
          fontSize={12}
          tick={{ fontSize: 10 }}
        />
        <YAxis 
          yAxisId="left"
          stroke="#64748b"
          fontSize={12}
          allowDecimals={false}
          width={40}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          width={45}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
          formatter={(value, name) => {
            if (name === "Umsatz" && typeof value === 'number') {
              return [`CHF ${value.toLocaleString("de-CH")}`, name];
            }
            return [value, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar 
          yAxisId="left"
          dataKey="verkäufe" 
          fill="#22c55e" 
          name="Verkäufe"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          yAxisId="right"
          dataKey="umsatz" 
          fill="#3b82f6" 
          name="Umsatz"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LeadsAreaChart({ data }: { data: LeadsDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Noch keine Lead-Daten vorhanden
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="wonGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          stroke="#64748b"
          fontSize={12}
          tick={{ fontSize: 10 }}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          allowDecimals={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Area
          type="monotone"
          dataKey="leads"
          stroke={COLORS.primary}
          fillOpacity={1}
          fill="url(#leadsGradient)"
          name="Neue Leads"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="won"
          stroke={COLORS.success}
          fillOpacity={1}
          fill="url(#wonGradient)"
          name="Gewonnen"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueLineChart({ data }: { data: RevenueDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Noch keine Umsatzdaten vorhanden
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          stroke="#64748b"
          fontSize={12}
          tick={{ fontSize: 10 }}
        />
        <YAxis 
          yAxisId="left"
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          width={45}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          width={45}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
          formatter={(value, name) => {
            if (typeof value === 'number') {
              return [`CHF ${value.toLocaleString("de-CH")}`, name];
            }
            return [value, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="umsatz"
          stroke={COLORS.success}
          strokeWidth={2}
          dot={{ fill: COLORS.success, strokeWidth: 2 }}
          name="Rechnungen (bezahlt)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="offerten"
          stroke={COLORS.purple}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: COLORS.purple, strokeWidth: 2 }}
          name="Offerten (gesendet)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StandingTimeBarChart({ data }: { data: StandingTimeDataPoint[] }) {
  if (data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          Keine Fahrzeuge im Bestand
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          type="number"
          stroke="#64748b"
          fontSize={12}
          allowDecimals={false}
        />
        <YAxis 
          type="category"
          dataKey="range"
          stroke="#64748b"
          fontSize={12}
          width={80}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
          formatter={(value) => [`${value} Fahrzeuge`, "Anzahl"]}
        />
        <Bar 
          dataKey="count" 
          radius={[0, 4, 4, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ConversionFunnelChart({ data }: { data: { stage: string; count: number; color: string }[] }) {
  if (data.length === 0 || data[0].count === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Noch keine Funnel-Daten vorhanden
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count));
  
  return (
    <div className="h-[300px] flex flex-col justify-center gap-3 px-2 sm:px-4">
      {data.map((item, index) => {
        const width = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
        const prevCount = index > 0 ? data[index - 1].count : null;
        const conversionRate = prevCount && prevCount > 0 
          ? Math.round((item.count / prevCount) * 100) 
          : null;
        
        return (
          <div key={item.stage} className="flex items-center gap-2 sm:gap-4">
            <div className="w-16 sm:w-24 text-right text-xs sm:text-sm text-slate-600 truncate">
              {item.stage}
            </div>
            <div className="flex-1 relative">
              <div 
                className="h-8 sm:h-10 rounded-r-lg transition-all duration-500 flex items-center justify-end pr-2 sm:pr-3"
                style={{ 
                  width: `${Math.max(width, 10)}%`,
                  backgroundColor: item.color,
                }}
              >
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {item.count}
                </span>
              </div>
            </div>
            {conversionRate !== null && (
              <div className="w-10 sm:w-16 text-xs text-slate-500">
                {conversionRate}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Leads by Source Pie Chart
export function LeadsBySourceChart({ data }: { data: LeadsBySourceDataPoint[] }) {
  const filteredData = data.filter(d => d.count > 0);
  
  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Noch keine Lead-Quellen erfasst
      </div>
    );
  }

  const total = filteredData.reduce((sum, d) => sum + d.count, 0);

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null; // Don't show labels for small segments
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            innerRadius={40}
            fill="#8884d8"
            dataKey="count"
            nameKey="source"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
            formatter={(value: number, name: string) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              name
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 -mt-4">
        {filteredData.map((item) => (
          <div key={item.source} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-slate-600">{item.source}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Top Brands Bar Chart
export function TopBrandsChart({ data }: { data: TopBrandsDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Noch keine Verkaufsdaten nach Marke
      </div>
    );
  }

  const BRAND_COLORS = [
    COLORS.primary,
    COLORS.success,
    COLORS.purple,
    COLORS.warning,
    COLORS.pink,
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          type="number"
          stroke="#64748b"
          fontSize={12}
          allowDecimals={false}
        />
        <YAxis 
          type="category"
          dataKey="brand"
          stroke="#64748b"
          fontSize={12}
          width={80}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
          formatter={(value, name) => {
            if (name === "Umsatz" && typeof value === 'number') {
              return [`CHF ${value.toLocaleString("de-CH")}`, name];
            }
            return [value, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar 
          dataKey="sales" 
          name="Verkäufe"
          radius={[0, 4, 4, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Mini sparkline for KPI cards
export function MiniSparkline({ 
  data, 
  color = COLORS.primary,
  height = 40 
}: { 
  data: number[]; 
  color?: string;
  height?: number;
}) {
  if (data.length < 2) return null;

  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Trend Indicator Component
export function TrendIndicator({ 
  current, 
  previous, 
  format = "number",
  suffix = ""
}: { 
  current: number; 
  previous: number;
  format?: "number" | "currency" | "percent";
  suffix?: string;
}) {
  if (previous === 0) {
    return <span className="text-xs text-slate-400">Keine Vormonatsdaten</span>;
  }

  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;
  const absChange = Math.abs(change);

  const formatValue = (val: number) => {
    if (format === "currency") {
      return `CHF ${val.toLocaleString("de-CH")}`;
    }
    if (format === "percent") {
      return `${val}%`;
    }
    return val.toLocaleString("de-CH");
  };

  return (
    <div className="flex items-center gap-1">
      <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '↑' : '↓'} {absChange.toFixed(1)}%
      </span>
      <span className="text-xs text-slate-400">
        vs. {formatValue(previous)}{suffix}
      </span>
    </div>
  );
}

// Export types for use in page
export { SOURCE_COLORS };
