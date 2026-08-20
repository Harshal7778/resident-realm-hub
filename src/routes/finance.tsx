import { createFileRoute } from "@tanstack/react-router";
import { IndianRupee } from "lucide-react";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance — Society Management" },
      { name: "description", content: "Contributions, expenses and balances for Green Valley Society." },
      { property: "og:title", content: "Finance — Society Management" },
      { property: "og:description", content: "Contributions, expenses and balances for Green Valley Society." },
    ],
  }),
  component: FinancePage,
});

const ALLOWED: Role[] = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER];

function FinancePage() {
  return (
    <ProtectedPage title="Finance" subtitle="Contributions, expenses and balances" roles={ALLOWED} showBack>
      <ModulePlaceholder title="Finance" icon={IndianRupee} />
    </ProtectedPage>
  );
}
