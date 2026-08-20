import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ rows = 3, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite" aria-label={label}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ))}
    </div>
  );
}
