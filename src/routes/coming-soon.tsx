import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";

import { EmptyState } from "@/components/common/EmptyState";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  feature: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/coming-soon")({
  validateSearch: zodValidator(searchSchema),
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
  const { feature } = Route.useSearch();
  const navigate = useNavigate();
  const label = feature.slice(0, 60);

  return (
    <ProtectedPage title="Coming next" subtitle={label || "In development"} showBack>
      <EmptyState
        icon={Rocket}
        title={label ? `${label} is coming next` : "Coming next"}
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
