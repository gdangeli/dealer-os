"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { type TimeRange } from "@/lib/analytics/time-range";

// Re-export for backwards compatibility
export { type TimeRange, getTimeRangeDays, getTimeRangeLabel } from "@/lib/analytics/time-range";

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
