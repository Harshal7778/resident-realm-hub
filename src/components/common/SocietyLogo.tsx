import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function SocietyLogo({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const box = { sm: "h-10 w-10", md: "h-14 w-14", lg: "h-20 w-20" }[size];
  const icon = { sm: "h-5 w-5", md: "h-7 w-7", lg: "h-10 w-10" }[size];
  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-2xl bg-primary text-primary-foreground",
        box,
        className,
      )}
    >
      <Building2 className={icon} />
    </span>
  );
}
