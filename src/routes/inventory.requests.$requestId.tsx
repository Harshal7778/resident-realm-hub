import { createFileRoute } from "@tanstack/react-router";
import { Check, PackageCheck, Truck, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { ApproveRequestSheet } from "@/features/inventory/ApproveRequestSheet";
import { ReturnSheet } from "@/features/inventory/ReturnSheet";
import { formatDate } from "@/lib/format";
import { REQUEST_STATUS_TONE, inventoryService } from "@/services/inventoryService";
import { PERMISSIONS, type InventoryItem, type InventoryRequest } from "@/types/domain";

export const Route = createFileRoute("/inventory/requests/$requestId")({
  head: () => ({
    meta: [
      { title: "Request details — Green Valley Society" },
      { name: "description", content: "Review requested items, approve quantities, issue stock and record returns." },
      { property: "og:title", content: "Request details — Green Valley Society" },
      { property: "og:description", content: "Full lifecycle of a society inventory request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequestDetailPage,
});

function RequestDetailPage() {
  const { requestId } = Route.useParams();
  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_INVENTORY);

  const [request, setRequest] = useState<InventoryRequest | null | undefined>(undefined);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [nextRequest, nextItems] = await Promise.all([
      inventoryService.getRequestById(requestId),
      inventoryService.listItems(),
    ]);
    setRequest(nextRequest);
    setItems(nextItems);
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (request === undefined) {
    return (
      <ProtectedPage title="Request" showBack>
        <LoadingState rows={4} />
      </ProtectedPage>
    );
  }

  if (request === null) {
    return (
      <ProtectedPage title="Request" showBack>
        <EmptyState title="Request not found" />
      </ProtectedPage>
    );
  }

  async function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setBusy(true);
    const res = await action();
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Something went wrong");
      return false;
    }
    toast.success(success);
    await load();
    return true;
  }

  return (
    <ProtectedPage title={request.purpose} subtitle={`${request.houseNumber} • ${request.memberName}`} showBack>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <span className="text-sm text-muted-foreground">
            Requested {formatDate(request.requestDate)}
            <br />
            Return by {formatDate(request.expectedReturnDate)}
          </span>
          <StatusBadge label={request.status} tone={REQUEST_STATUS_TONE[request.status]} />
        </div>

        {request.notes && (
          <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">{request.notes}</p>
        )}

        {request.status === "REJECTED" && request.rejectionReason && (
          <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Rejected: {request.rejectionReason}
          </p>
        )}

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Items</h2>
          <ul className="space-y-2">
            {request.items.map((line) => (
              <li key={line.itemId} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">{line.itemName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Requested {line.requestedQuantity} • Approved {line.approvedQuantity} • Issued {line.issuedQuantity}
                </p>
                {(line.returnedQuantity > 0 || line.damagedQuantity > 0 || line.missingQuantity > 0) && (
                  <p className="text-xs text-muted-foreground">
                    Returned {line.returnedQuantity} • Damaged {line.damagedQuantity} • Missing {line.missingQuantity}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        {canManage && request.status === "PENDING" && (
          <div className="space-y-3">
            <ApproveRequestSheet
              request={request}
              items={items}
              onApprove={(approvals) =>
                run(() => inventoryService.approveRequest(request.id, approvals), "Request approved")
              }
              trigger={
                <Button className="h-12 w-full rounded-xl" disabled={busy}>
                  <Check className="mr-2 h-4 w-4" /> Approve request
                </Button>
              }
            />
            <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
              <Input
                className="h-12 rounded-xl"
                placeholder="Reason for rejection"
                aria-label="Reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <Button
                variant="destructive"
                className="h-12 w-full rounded-xl"
                disabled={busy}
                onClick={() => run(() => inventoryService.rejectRequest(request.id, rejectReason), "Request rejected")}
              >
                <X className="mr-2 h-4 w-4" /> Reject request
              </Button>
            </div>
          </div>
        )}

        {canManage && request.status === "APPROVED" && (
          <Button
            className="h-12 w-full rounded-xl"
            disabled={busy}
            onClick={() => run(() => inventoryService.issueRequest(request.id), "Items issued")}
          >
            <Truck className="mr-2 h-4 w-4" /> Issue items
          </Button>
        )}

        {canManage && request.status === "ISSUED" && (
          <ReturnSheet
            request={request}
            onSave={(lines) => run(() => inventoryService.recordReturn(request.id, lines), "Return recorded")}
            trigger={
              <Button className="h-12 w-full rounded-xl" disabled={busy}>
                <PackageCheck className="mr-2 h-4 w-4" /> Record return
              </Button>
            }
          />
        )}
      </div>
    </ProtectedPage>
  );
}
