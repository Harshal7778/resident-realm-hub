import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meetings — Society Management" },
      { name: "description", content: "Committee and general body meetings for Green Valley Society." },
      { property: "og:title", content: "Meetings — Society Management" },
      { property: "og:description", content: "Committee and general body meetings for Green Valley Society." },
    ],
  }),
  component: MeetingsPage,
});

const ALLOWED: Role[] = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER];

function MeetingsPage() {
  return (
    <ProtectedPage title="Meetings" subtitle="Committee and general body meetings" roles={ALLOWED} showBack>
      <ModulePlaceholder title="Meetings" icon={Users} />
    </ProtectedPage>
  );
}
