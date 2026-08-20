import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Society Management" },
      { name: "description", content: "Society configuration for Green Valley Society." },
      { property: "og:title", content: "Settings — Society Management" },
      { property: "og:description", content: "Society configuration for Green Valley Society." },
    ],
  }),
  component: SettingsPage,
});

const ALLOWED: Role[] = [ROLES.ADMIN];

function SettingsPage() {
  return (
    <ProtectedPage title="Settings" subtitle="Society configuration" roles={ALLOWED} showBack>
      <ModulePlaceholder title="Settings" icon={Settings} />
    </ProtectedPage>
  );
}
