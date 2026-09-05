import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ReturnLine } from "@/services/inventoryService";
import type { InventoryRequest } from "@/types/domain";

type Row = { returned: number; damaged: number; missing: number };

export function ReturnSheet({
  trigger,
  request,
  onSave,
}: {
  trigger: ReactNode;
  request: InventoryRequest;
  onSave: (lines: ReturnLine[]) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next: Record<string, Row> = {};
    for (const line of request.items) {
      next[line.itemId] = { returned: line.issuedQuantity, damaged: 0, missing: 0 };
    }
    setRows(next);
  }, [open, request]);

  function set(itemId: string, key: keyof Row, value: number) {
    setRows((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? { returned: 0, damaged: 0, missing: 0 }), [key]: Math.max(0, value) },
    }));
  }

  async function handleSave() {
    setSaving(true);
    const ok = await onSave(
      request.items.map((line) => {
        const row = rows[line.itemId] ?? { returned: 0, damaged: 0, missing: 0 };
        return {
          itemId: line.itemId,
          returnedQuantity: row.returned,
          damagedQuantity: row.damaged,
          missingQuantity: row.missing,
        };
      }),
    );
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="px-0 text-left">
          <SheetTitle>Record return</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 pb-6">
          <p className="text-sm text-muted-foreground">
            Returned + damaged + missing must equal the issued quantity for every item.
          </p>
          <ul className="space-y-3">
            {request.items.map((line) => {
              const row = rows[line.itemId] ?? { returned: 0, damaged: 0, missing: 0 };
              const sum = row.returned + row.damaged + row.missing;
              const balanced = sum === line.issuedQuantity;
              return (
                <li key={line.itemId} className="space-y-2 rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{line.itemName}</span>
                    <span className={cn("text-xs font-medium", balanced ? "text-success" : "text-destructive")}>
                      {sum} / {line.issuedQuantity} issued
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["returned", "damaged", "missing"] as const).map((key) => (
                      <div key={key} className="space-y-1">
                        <Label htmlFor={`${key}-${line.itemId}`} className="text-xs capitalize">
                          {key}
                        </Label>
                        <Input
                          id={`${key}-${line.itemId}`}
                          inputMode="numeric"
                          className="h-11 rounded-xl"
                          value={row[key]}
                          onChange={(e) => set(line.itemId, key, Number(e.target.value.replace(/\D/g, "")) || 0)}
                        />
                      </div>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
          <Button className="h-12 w-full rounded-xl" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save return"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
