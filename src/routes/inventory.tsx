import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Society Management" },
      { name: "description", content: "Society inventory and item requests for Green Valley Society." },
      { property: "og:title", content: "Inventory — Society Management" },
      { property: "og:description", content: "Society inventory and item requests for Green Valley Society." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  return (
    <ProtectedPage title="Inventory" subtitle="Society inventory and item requests">
      <ModulePlaceholder title="Inventory" icon={Package} />
    </ProtectedPage>
  );
}
