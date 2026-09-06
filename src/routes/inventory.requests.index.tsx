import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, ClipboardList, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { FilterChips } from "@/components/common/FilterChips";
import { LoadingState } from "@/components/common/LoadingState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { RequestFormSheet } from "@/features/inventory/RequestFormSheet";
import { formatDate } from "@/lib/format";
import { REQUEST_STATUS_TONE, inventoryService } from "@/services/inventoryService";
import {
  PERMISSIONS,
  REQUEST_STATUSES,
  type InventoryItem,
  type InventoryRequest,
} from "@/types/domain";

export const Route = createFileRoute("/inventory/requests/")({
  head: () => ({
    meta: [
      { title: "Inventory requests — Green Valley Society" },
      { name: "description", content: "Track society inventory requests from submission through approval, issue and return." },
      { property: "og:title", content: "Inventory requests — Green Valley Society" },
      { property: "og:description", content: "Approve, issue and close item requests raised by society houses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InventoryRequestsPage,
});

function InventoryRequestsPage() {
  const { user, can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_INVENTORY);

  const [requests, setRequests] = useState<InventoryRequest[] | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [status, setStatus] = useState("ALL");

  const load = useCallback(async () => {
    const [nextRequests, nextItems] = await Promise.all([
      inventoryService.listRequests({
        status,
        memberId: canManage ? undefined : user?.memberId,
      }),
      inventoryService.listItems(),
    ]);
    setRequests(nextRequests);
    setItems(nextItems);
  }, [status, canManage, user?.memberId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ProtectedPage
      title="Inventory requests"
      subtitle={canManage ? "All society requests" : "Your requests"}
      showBack
    >
      <div className="space-y-4">
        {user && !canManage && (
          <RequestFormSheet
            items={items}
            houseNumber={user.houseNumber}
            onSubmit={async (values) => {
              const res = await inventoryService.createRequest({
                houseId: `house-${user.houseNumber}`,
                houseNumber: user.houseNumber,
                memberId: user.memberId,
                memberName: user.name,
                purpose: values.purpose,
                expectedReturnDate: values.expectedReturnDate,
                notes: values.notes,
                lines: values.lines,
              });
              if (!res.ok) {
                toast.error(res.error ?? "Could not create request");
                return false;
              }
              toast.success("Request submitted for approval");
              await load();
              return true;
            }}
            trigger={
              <Button className="h-12 w-full rounded-xl">
                <Plus className="mr-2 h-4 w-4" /> New request
              </Button>
            }
          />
        )}

        <FilterChips
          value={status}
          onChange={setStatus}
          options={[{ value: "ALL", label: "All" }, ...REQUEST_STATUSES.map((s) => ({ value: s, label: s }))]}
        />

        {requests === null ? (
          <LoadingState rows={4} />
        ) : requests.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No requests" description="Item requests will appear here." />
        ) : (
          <ul className="space-y-2">
            {requests.map((request) => (
              <li key={request.id}>
                <Link
                  to="/inventory/requests/$requestId"
                  params={{ requestId: request.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {request.houseNumber} • {request.purpose}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {request.items.length} items • requested {formatDate(request.requestDate)}
                    </span>
                  </span>
                  <StatusBadge label={request.status} tone={REQUEST_STATUS_TONE[request.status]} />
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedPage>
  );
}
