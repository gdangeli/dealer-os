// Time range utilities - shared between server and client

export type TimeRange = "7d" | "30d" | "90d" | "365d";

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
