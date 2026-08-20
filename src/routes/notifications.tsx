import { createFileRoute } from "@tanstack/react-router";
import { BellRing } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Society Management" },
      { name: "description", content: "Your society notifications for Green Valley Society." },
      { property: "og:title", content: "Notifications — Society Management" },
      { property: "og:description", content: "Your society notifications for Green Valley Society." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <ProtectedPage title="Notifications" subtitle="Your society notifications">
      <ModulePlaceholder title="Notifications" icon={BellRing} />
    </ProtectedPage>
  );
}
