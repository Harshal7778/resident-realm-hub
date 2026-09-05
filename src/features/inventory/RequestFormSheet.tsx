import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { SearchBar } from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { todayISO } from "@/lib/format";
import type { InventoryItem } from "@/types/domain";

export interface RequestFormValues {
  purpose: string;
  expectedReturnDate: string;
  notes: string;
  lines: { itemId: string; quantity: number }[];
}

export function RequestFormSheet({
  trigger,
  items,
  houseNumber,
  onSubmit,
}: {
  trigger: ReactNode;
  items: InventoryItem[];
  houseNumber: string;
  onSubmit: (values: RequestFormValues) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPurpose("");
    setExpectedReturnDate(todayISO());
    setNotes("");
    setSearch("");
    setQuantities({});
  }, [open]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => (q ? i.name.toLowerCase().includes(q) : true)).slice(0, 40);
  }, [items, search]);

  const selectedCount = Object.values(quantities).filter((q) => q > 0).length;

  function step(item: InventoryItem, delta: number) {
    setQuantities((prev) => {
      const next = Math.max(0, Math.min(item.availableQuantity, (prev[item.id] ?? 0) + delta));
      return { ...prev, [item.id]: next };
    });
  }

  async function handleSubmit() {
    setSaving(true);
    const ok = await onSubmit({
      purpose,
      expectedReturnDate,
      notes,
      lines: Object.entries(quantities)
        .filter(([, q]) => q > 0)
        .map(([itemId, quantity]) => ({ itemId, quantity })),
    });
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="px-0 text-left">
          <SheetTitle>New inventory request</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 pb-6">
          <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            House <span className="font-semibold text-foreground">{houseNumber}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="req-purpose">Purpose</Label>
            <Input
              id="req-purpose"
              className="h-12 rounded-xl"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Wedding, birthday, katha…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="req-return">Expected return date</Label>
            <Input
              id="req-return"
              type="date"
              className="h-12 rounded-xl"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Items ({selectedCount} selected)</Label>
            <SearchBar value={search} onChange={setSearch} placeholder="Search items" label="Search items" />
            <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {visible.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">{item.availableQuantity} available</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-full"
                      aria-label={`Reduce ${item.name}`}
                      onClick={() => step(item, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <input
                      aria-label={`${item.name} quantity`}
                      inputMode="numeric"
                      className="h-9 w-14 rounded-lg border border-border bg-background text-center text-sm"
                      value={quantities[item.id] ?? 0}
                      onChange={(e) => {
                        const raw = Number(e.target.value.replace(/\D/g, ""));
                        setQuantities((prev) => ({
                          ...prev,
                          [item.id]: Math.max(0, Math.min(item.availableQuantity, raw || 0)),
                        }));
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-full"
                      aria-label={`Add ${item.name}`}
                      onClick={() => step(item, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="req-notes">Notes</Label>
            <Textarea
              id="req-notes"
              className="min-h-20 rounded-xl"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any collection or return details"
            />
          </div>

          <Button className="h-12 w-full rounded-xl" disabled={saving} onClick={handleSubmit}>
            {saving ? "Submitting…" : "Submit request"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
