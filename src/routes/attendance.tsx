import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Society Management" },
      { name: "description", content: "Meeting attendance records for Green Valley Society." },
      { property: "og:title", content: "Attendance — Society Management" },
      { property: "og:description", content: "Meeting attendance records for Green Valley Society." },
    ],
  }),
  component: AttendancePage,
});

const ALLOWED: Role[] = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER];

function AttendancePage() {
  return (
    <ProtectedPage title="Attendance" subtitle="Meeting attendance records" roles={ALLOWED} showBack>
      <ModulePlaceholder title="Attendance" icon={CalendarCheck} />
    </ProtectedPage>
  );
}
