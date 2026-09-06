import { createFileRoute } from "@tanstack/react-router";
import { History, Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { InventoryItemFormSheet } from "@/features/inventory/InventoryItemFormSheet";
import { formatDate } from "@/lib/format";
import { inventoryService } from "@/services/inventoryService";
import {
  PERMISSIONS,
  type InventoryItem,
  type InventoryTransaction,
  type TransactionType,
} from "@/types/domain";

export const Route = createFileRoute("/inventory/$id")({
  head: () => ({
    meta: [
      { title: "Inventory item — Green Valley Society" },
      { name: "description", content: "Item stock levels and full transaction history for a society inventory item." },
      { property: "og:title", content: "Inventory item — Green Valley Society" },
      { property: "og:description", content: "Available, issued, damaged and missing counts with transaction history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InventoryItemPage,
});

const TX_TONE: Record<TransactionType, "success" | "warning" | "danger" | "neutral" | "info"> = {
  ADDED: "success",
  ADJUSTED: "neutral",
  ISSUED: "info",
  RETURNED: "success",
  DAMAGED: "warning",
  MISSING: "danger",
};

function InventoryItemPage() {
  const { id } = Route.useParams();
  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_INVENTORY);

  const [item, setItem] = useState<InventoryItem | null | undefined>(undefined);
  const [history, setHistory] = useState<InventoryTransaction[]>([]);

  const load = useCallback(async () => {
    const [nextItem, nextHistory] = await Promise.all([
      inventoryService.getItemById(id),
      inventoryService.listTransactions({ itemId: id }),
    ]);
    setItem(nextItem);
    setHistory(nextHistory);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (item === undefined) {
    return (
      <ProtectedPage title="Item" showBack>
        <LoadingState rows={4} />
      </ProtectedPage>
    );
  }

  if (item === null) {
    return (
      <ProtectedPage title="Item" showBack>
        <EmptyState title="Item not found" description="This inventory item may have been removed." />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage title={item.name} subtitle={item.category} showBack>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total" value={String(item.totalQuantity)} />
          <StatCard label="Available" value={String(item.availableQuantity)} tone="positive" />
          <StatCard label="Issued" value={String(item.issuedQuantity)} tone="warning" />
          <StatCard label="Damaged / Missing" value={`${item.damagedQuantity} / ${item.missingQuantity}`} />
        </div>

        {item.description && (
          <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            {item.description}
          </p>
        )}

        {canManage && (
          <InventoryItemFormSheet
            title="Edit item"
            initial={{
              name: item.name,
              category: item.category,
              totalQuantity: String(item.totalQuantity),
              description: item.description,
            }}
            onSubmit={async (values) => {
              const res = await inventoryService.updateItem(item.id, values);
              if (!res.ok) {
                toast.error(res.error ?? "Could not update item");
                return false;
              }
              toast.success("Item updated");
              await load();
              return true;
            }}
            trigger={
              <Button variant="outline" className="h-12 w-full rounded-xl">
                <Pencil className="mr-2 h-4 w-4" /> Edit item
              </Button>
            }
          />
        )}

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Transaction history</h2>
          {history.length === 0 ? (
            <EmptyState icon={History} title="No transactions yet" />
          ) : (
            <ul className="space-y-2">
              {history.map((tx) => (
                <li key={tx.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                  <StatusBadge label={tx.type} tone={TX_TONE[tx.type]} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {tx.quantity} {tx.quantity === 1 ? "piece" : "pieces"}
                      {tx.houseNumber ? ` • ${tx.houseNumber}` : ""}
                    </span>
                    <span className="block text-xs text-muted-foreground">{tx.note}</span>
                    <span className="block text-xs text-muted-foreground">{formatDate(tx.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ProtectedPage>
  );
}
