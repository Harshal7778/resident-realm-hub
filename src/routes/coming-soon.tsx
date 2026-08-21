import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Rocket } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/coming-soon")({
  head: () => ({
    meta: [
      { title: "Coming next — Society Management" },
      { name: "description", content: "This society module is being built and arrives in the next phase." },
      { property: "og:title", content: "Coming next — Society Management" },
      { property: "og:description", content: "This Green Valley Society feature arrives in the next phase." },
    ],
  }),
  component: ComingSoonPage,
});

function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <ProtectedPage title="Coming next" subtitle="In development" showBack>
      <EmptyState
        icon={Rocket}
        title="Coming next"
        description="This module is part of the next build phase. Member management is fully live today."
        action={
          <Button className="mt-2 h-11" onClick={() => navigate({ to: "/dashboard" })}>
            Back to home
          </Button>
        }
      />
    </ProtectedPage>
  );
}
