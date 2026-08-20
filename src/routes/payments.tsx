import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Society Management" },
      { name: "description", content: "Your contributions and payment history for Green Valley Society." },
      { property: "og:title", content: "Payments — Society Management" },
      { property: "og:description", content: "Your contributions and payment history for Green Valley Society." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  return (
    <ProtectedPage title="Payments" subtitle="Your contributions and payment history">
      <ModulePlaceholder title="Payments" icon={Wallet} />
    </ProtectedPage>
  );
}
