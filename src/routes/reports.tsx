import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Society Management" },
      { name: "description", content: "Society reports and statements for Green Valley Society." },
      { property: "og:title", content: "Reports — Society Management" },
      { property: "og:description", content: "Society reports and statements for Green Valley Society." },
    ],
  }),
  component: ReportsPage,
});

const ALLOWED: Role[] = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER];

function ReportsPage() {
  return (
    <ProtectedPage title="Reports" subtitle="Society reports and statements" roles={ALLOWED} showBack>
      <ModulePlaceholder title="Reports" icon={FileBarChart} />
    </ProtectedPage>
  );
}
