import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";

export function ModulePlaceholder({
  title,
  icon,
  description = "Coming in the next module.",
}: {
  title: string;
  icon?: LucideIcon;
  description?: string;
}) {
  return <EmptyState icon={icon} title={title} description={description} />;
}
