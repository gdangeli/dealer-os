import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-9 w-32 bg-slate-200 rounded animate-pulse" />
      </div>
      <SkeletonTable rows={5} />
    </div>
  );
}
