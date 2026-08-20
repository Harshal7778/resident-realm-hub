import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Society Management" },
      { name: "description", content: "System activity log for Green Valley Society." },
      { property: "og:title", content: "Audit Logs — Society Management" },
      { property: "og:description", content: "System activity log for Green Valley Society." },
    ],
  }),
  component: AuditLogsPage,
});

const ALLOWED: Role[] = [ROLES.ADMIN];

function AuditLogsPage() {
  return (
    <ProtectedPage title="Audit Logs" subtitle="System activity log" roles={ALLOWED} showBack>
      <ModulePlaceholder title="Audit Logs" icon={ClipboardList} />
    </ProtectedPage>
  );
}
