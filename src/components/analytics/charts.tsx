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

const COLORS = {
  primary: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  slate: "#64748b",
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
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          allowDecimals={false}
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
        />
        <YAxis 
          yAxisId="left"
          stroke="#64748b"
          fontSize={12}
          allowDecimals={false}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
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
        <Legend />
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
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
        />
        <Legend />
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
        />
        <YAxis 
          yAxisId="left"
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
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
        <Legend />
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
          width={100}
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
    <div className="h-[300px] flex flex-col justify-center gap-3 px-4">
      {data.map((item, index) => {
        const width = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
        const prevCount = index > 0 ? data[index - 1].count : null;
        const conversionRate = prevCount && prevCount > 0 
          ? Math.round((item.count / prevCount) * 100) 
          : null;
        
        return (
          <div key={item.stage} className="flex items-center gap-4">
            <div className="w-24 text-right text-sm text-slate-600">
              {item.stage}
            </div>
            <div className="flex-1 relative">
              <div 
                className="h-10 rounded-r-lg transition-all duration-500 flex items-center justify-end pr-3"
                style={{ 
                  width: `${Math.max(width, 10)}%`,
                  backgroundColor: item.color,
                }}
              >
                <span className="text-white font-semibold text-sm">
                  {item.count}
                </span>
              </div>
            </div>
            {conversionRate !== null && (
              <div className="w-16 text-xs text-slate-500">
                {conversionRate}%
              </div>
            )}
          </div>
        );
      })}
    </div>
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
