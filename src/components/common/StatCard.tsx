import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "positive" | "warning";
  onClick?: () => void;
}

const toneClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  positive: "text-success",
  warning: "text-warning",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "default", onClick }: StatCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      {...(onClick ? { onClick, type: "button" as const } : {})}
      className={cn(
        "flex w-full flex-col gap-1 rounded-2xl border border-border bg-card p-4 text-left",
        onClick && "transition-colors hover:bg-accent active:bg-accent",
      )}
    >
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span className="truncate">{label}</span>
      </span>
      <span className={cn("text-xl font-semibold leading-tight", toneClass[tone])}>{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </Comp>
  );
}
