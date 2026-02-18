"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export type TimeRange = "7d" | "30d" | "90d" | "365d";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7 Tage" },
  { value: "30d", label: "30 Tage" },
  { value: "90d", label: "90 Tage" },
  { value: "365d", label: "Jahr" },
];

interface TimeRangeFilterProps {
  currentRange: TimeRange;
}

export function TimeRangeFilter({ currentRange }: TimeRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TIME_RANGES.map((range) => (
        <Button
          key={range.value}
          variant={currentRange === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleRangeChange(range.value)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}

export function getTimeRangeDays(range: TimeRange): number {
  const days: Record<TimeRange, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "365d": 365,
  };
  return days[range];
}

export function getTimeRangeLabel(range: TimeRange): string {
  const labels: Record<TimeRange, string> = {
    "7d": "letzte 7 Tage",
    "30d": "letzte 30 Tage",
    "90d": "letzte 90 Tage",
    "365d": "letztes Jahr",
  };
  return labels[range];
}
