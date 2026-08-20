import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/notices")({
  head: () => ({
    meta: [
      { title: "Notices — Society Management" },
      { name: "description", content: "Society notices and circulars for Green Valley Society." },
      { property: "og:title", content: "Notices — Society Management" },
      { property: "og:description", content: "Society notices and circulars for Green Valley Society." },
    ],
  }),
  component: NoticesPage,
});

const ALLOWED: Role[] = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER];

function NoticesPage() {
  return (
    <ProtectedPage title="Notices" subtitle="Society notices and circulars" roles={ALLOWED} showBack>
      <ModulePlaceholder title="Notices" icon={Bell} />
    </ProtectedPage>
  );
}
