import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/admin/permissions")({
  head: () => ({
    meta: [
      { title: "Permissions — Society Management" },
      { name: "description", content: "Role permissions for Green Valley Society." },
      { property: "og:title", content: "Permissions — Society Management" },
      { property: "og:description", content: "Role permissions for Green Valley Society." },
    ],
  }),
  component: PermissionsPage,
});

const ALLOWED: Role[] = [ROLES.ADMIN];

function PermissionsPage() {
  return (
    <ProtectedPage title="Permissions" subtitle="Role permissions" roles={ALLOWED} showBack>
      <ModulePlaceholder title="Permissions" icon={ShieldCheck} />
    </ProtectedPage>
  );
}
