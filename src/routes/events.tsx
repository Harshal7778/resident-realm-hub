import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Society Management" },
      { name: "description", content: "Society events and celebrations for Green Valley Society." },
      { property: "og:title", content: "Events — Society Management" },
      { property: "og:description", content: "Society events and celebrations for Green Valley Society." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <ProtectedPage title="Events" subtitle="Society events and celebrations">
      <ModulePlaceholder title="Events" icon={CalendarDays} />
    </ProtectedPage>
  );
}
