import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ApprovalLine } from "@/services/inventoryService";
import type { InventoryItem, InventoryRequest } from "@/types/domain";

export function ApproveRequestSheet({
  trigger,
  request,
  items,
  onApprove,
}: {
  trigger: ReactNode;
  request: InventoryRequest;
  items: InventoryItem[];
  onApprove: (approvals: ApprovalLine[]) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next: Record<string, number> = {};
    for (const line of request.items) {
      const available = items.find((i) => i.id === line.itemId)?.availableQuantity ?? 0;
      next[line.itemId] = Math.min(line.requestedQuantity, available);
    }
    setValues(next);
  }, [open, request, items]);

  async function handleApprove() {
    setSaving(true);
    const ok = await onApprove(
      request.items.map((line) => ({ itemId: line.itemId, approvedQuantity: values[line.itemId] ?? 0 })),
    );
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="px-0 text-left">
          <SheetTitle>Approve request</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 pb-6">
          <p className="text-sm text-muted-foreground">
            {request.houseNumber} • {request.purpose}
          </p>
          <ul className="space-y-3">
            {request.items.map((line) => {
              const available = items.find((i) => i.id === line.itemId)?.availableQuantity ?? 0;
              return (
                <li key={line.itemId} className="space-y-1.5 rounded-xl border border-border p-3">
                  <Label htmlFor={`approve-${line.itemId}`}>{line.itemName}</Label>
                  <p className="text-xs text-muted-foreground">
                    Requested {line.requestedQuantity} • {available} available
                  </p>
                  <Input
                    id={`approve-${line.itemId}`}
                    inputMode="numeric"
                    className="h-11 rounded-xl"
                    value={values[line.itemId] ?? 0}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [line.itemId]: Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0),
                      }))
                    }
                  />
                </li>
              );
            })}
          </ul>
          <Button className="h-12 w-full rounded-xl" disabled={saving} onClick={handleApprove}>
            {saving ? "Approving…" : "Approve request"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
