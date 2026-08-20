import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users — Society Management" },
      { name: "description", content: "Society app users for Green Valley Society." },
      { property: "og:title", content: "Users — Society Management" },
      { property: "og:description", content: "Society app users for Green Valley Society." },
    ],
  }),
  component: UsersPage,
});

const ALLOWED: Role[] = [ROLES.ADMIN];

function UsersPage() {
  return (
    <ProtectedPage title="Users" subtitle="Society app users" roles={ALLOWED} showBack>
      <ModulePlaceholder title="Users" icon={ShieldCheck} />
    </ProtectedPage>
  );
}
