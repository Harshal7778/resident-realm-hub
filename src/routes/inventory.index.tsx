import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ChevronRight, ClipboardList, Package, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { FilterChips } from "@/components/common/FilterChips";
import { LoadingState } from "@/components/common/LoadingState";
import { SearchBar } from "@/components/common/SearchBar";
import { StatCard } from "@/components/common/StatCard";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { InventoryItemFormSheet } from "@/features/inventory/InventoryItemFormSheet";
import { RequestFormSheet } from "@/features/inventory/RequestFormSheet";
import { inventoryService } from "@/services/inventoryService";
import {
  INVENTORY_CATEGORIES,
  PERMISSIONS,
  type InventoryItem,
  type InventoryStats,
} from "@/types/domain";

export const Route = createFileRoute("/inventory/")({
  head: () => ({
    meta: [
      { title: "Society Inventory — Green Valley Society" },
      {
        name: "description",
        content: "Browse society inventory — plates, glasses, chairs and cookware — and request items for your function.",
      },
      { property: "og:title", content: "Society Inventory — Green Valley Society" },
      { property: "og:description", content: "Track available, issued, damaged and missing society items." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InventoryIndexPage,
});

function InventoryIndexPage() {
  const { user, can } = useAuth();
  const navigate = useNavigate();
  const canManage = can(PERMISSIONS.MANAGE_INVENTORY);

  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const load = useCallback(async () => {
    const [nextStats, nextItems] = await Promise.all([
      inventoryService.stats(),
      inventoryService.listItems({ search, category }),
    ]);
    setStats(nextStats);
    setItems(nextItems);
  }, [search, category]);

  useEffect(() => {
    void load();
  }, [load]);

  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  useEffect(() => {
    void inventoryService.listItems().then(setAllItems);
  }, [items]);

  return (
    <ProtectedPage
      title="Inventory"
      subtitle="Society items and requests"
      headerAction={<NotificationBell />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total items" value={stats ? String(stats.totalItems) : "—"} icon={Package} hint={`${stats?.totalQuantity ?? 0} pieces`} />
          <StatCard label="Available" value={stats ? String(stats.available) : "—"} tone="positive" />
          <StatCard label="Issued" value={stats ? String(stats.issued) : "—"} tone="warning" />
          <StatCard
            label="Damaged / Missing"
            value={stats ? `${stats.damaged} / ${stats.missing}` : "—"}
            icon={AlertTriangle}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 rounded-xl" onClick={() => navigate({ to: "/inventory/requests" })}>
            <ClipboardList className="mr-2 h-4 w-4" /> Requests
          </Button>
          {canManage ? (
            <InventoryItemFormSheet
              onSubmit={async (values) => {
                const res = await inventoryService.createItem(values);
                if (!res.ok) {
                  toast.error(res.error ?? "Could not add item");
                  return false;
                }
                toast.success(`${res.data?.name} added to inventory`);
                await load();
                return true;
              }}
              trigger={
                <Button className="h-12 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" /> Add item
                </Button>
              }
            />
          ) : (
            user && (
              <RequestFormSheet
                items={allItems}
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
                  <Button className="h-12 rounded-xl">
                    <Plus className="mr-2 h-4 w-4" /> Request
                  </Button>
                }
              />
            )
          )}
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search items" label="Search inventory" />
        <FilterChips
          value={category}
          onChange={setCategory}
          options={[{ value: "ALL", label: "All" }, ...INVENTORY_CATEGORIES.map((c) => ({ value: c, label: c }))]}
        />

        {items === null ? (
          <LoadingState rows={4} />
        ) : items.length === 0 ? (
          <EmptyState icon={Search} title="No items found" description="Try a different search or category." />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  to="/inventory/$id"
                  params={{ id: item.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {item.category} • {item.availableQuantity} of {item.totalQuantity} available
                    </span>
                  </span>
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
