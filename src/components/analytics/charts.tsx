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
          formatter={(value: number, name: string) => {
            if (name === "Umsatz") {
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
