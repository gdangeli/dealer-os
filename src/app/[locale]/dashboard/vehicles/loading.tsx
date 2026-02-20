import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";

export default function VehiclesLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-slate-200 rounded-full animate-pulse" />
        ))}
      </div>

      {/* Table */}
      <SkeletonTable rows={6} />
    </div>
  );
}
