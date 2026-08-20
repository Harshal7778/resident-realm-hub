import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Roles — Society Management" },
      { name: "description", content: "Role definitions for Green Valley Society." },
      { property: "og:title", content: "Roles — Society Management" },
      { property: "og:description", content: "Role definitions for Green Valley Society." },
    ],
  }),
  component: RolesPage,
});

const ALLOWED: Role[] = [ROLES.ADMIN];

function RolesPage() {
  return (
    <ProtectedPage title="Roles" subtitle="Role definitions" roles={ALLOWED} showBack>
      <ModulePlaceholder title="Roles" icon={ShieldCheck} />
    </ProtectedPage>
  );
}
