import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/common/StatCard";
import { ReportExportButtons } from "@/features/reports/ReportExportButtons";
import { formatINR } from "@/lib/format";
import { inventoryService } from "@/services/inventoryService";
import type { InventoryItem } from "@/types/domain";

const CSV_HEADERS = ["Item", "Category", "Total", "Available", "Issued", "Damaged", "Missing"];

export function InventoryReport() {
  const [items, setItems] = useState<InventoryItem[] | null>(null);

  useEffect(() => {
    let active = true;
    inventoryService.listItems().then((rows) => {
      if (active) setItems(rows);
    });
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    const rows = items ?? [];
    return {
      total: rows.reduce((s, i) => s + i.totalQuantity, 0),
      available: rows.reduce((s, i) => s + i.availableQuantity, 0),
      issued: rows.reduce((s, i) => s + i.issuedQuantity, 0),
      damaged: rows.reduce((s, i) => s + i.damagedQuantity, 0),
      missing: rows.reduce((s, i) => s + i.missingQuantity, 0),
    };
  }, [items]);

  const csv = useCallback(
    () => ({
      headers: CSV_HEADERS,
      rows: (items ?? []).map((i) => [
        i.name,
        i.category,
        i.totalQuantity,
        i.availableQuantity,
        i.issuedQuantity,
        i.damagedQuantity,
        i.missingQuantity,
      ]),
    }),
    [items],
  );

  if (!items) return <LoadingState rows={4} />;

  return (
    <div className="space-y-3">
      <ReportExportButtons filename="inventory-report.csv" getCsv={csv} />

      {items.length === 0 ? (
        <EmptyState title="No inventory items" description="Add society items to see the stock report." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Items" value={String(items.length)} />
            <StatCard label="Total quantity" value={String(totals.total)} />
            <StatCard label="Available" value={String(totals.available)} tone="positive" />
            <StatCard label="Issued" value={String(totals.issued)} tone="warning" />
            <StatCard label="Damaged" value={String(totals.damaged)} />
            <StatCard label="Missing" value={String(totals.missing)} />
          </div>

          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold text-foreground">{item.name}</p>
                  <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{item.category}</span>
                </div>
                <dl className="mt-2 grid grid-cols-5 gap-1.5 text-center">
                  <div className="rounded-xl bg-muted p-1.5">
                    <dt className="text-[10px] text-muted-foreground">Total</dt>
                    <dd className="text-xs font-semibold">{item.totalQuantity}</dd>
                  </div>
                  <div className="rounded-xl bg-muted p-1.5">
                    <dt className="text-[10px] text-muted-foreground">Avail.</dt>
                    <dd className="text-xs font-semibold text-success">{item.availableQuantity}</dd>
                  </div>
                  <div className="rounded-xl bg-muted p-1.5">
                    <dt className="text-[10px] text-muted-foreground">Issued</dt>
                    <dd className="text-xs font-semibold text-warning">{item.issuedQuantity}</dd>
                  </div>
                  <div className="rounded-xl bg-muted p-1.5">
                    <dt className="text-[10px] text-muted-foreground">Dmgd</dt>
                    <dd className="text-xs font-semibold">{item.damagedQuantity}</dd>
                  </div>
                  <div className="rounded-xl bg-muted p-1.5">
                    <dt className="text-[10px] text-muted-foreground">Miss.</dt>
                    <dd className="text-xs font-semibold">{item.missingQuantity}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
