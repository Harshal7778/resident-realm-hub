import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { InventoryItemInput } from "@/services/inventoryService";
import { INVENTORY_CATEGORIES, type InventoryCategory } from "@/types/domain";

export function InventoryItemFormSheet({
  trigger,
  title = "Add inventory item",
  initial,
  onSubmit,
}: {
  trigger: ReactNode;
  title?: string;
  initial?: InventoryItemInput;
  onSubmit: (values: InventoryItemInput) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("Utensils");
  const [totalQuantity, setTotalQuantity] = useState("0");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setCategory(initial?.category ?? "Utensils");
    setTotalQuantity(initial?.totalQuantity ?? "0");
    setDescription(initial?.description ?? "");
  }, [open, initial]);

  async function handleSubmit() {
    setSaving(true);
    const ok = await onSubmit({ name, category, totalQuantity, description });
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="px-0 text-left">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 pb-6">
          <div className="space-y-1.5">
            <Label htmlFor="item-name">Item name</Label>
            <Input id="item-name" className="h-12 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dinner Plate" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as InventoryCategory)}>
              <SelectTrigger id="item-category" className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVENTORY_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-total">Total quantity</Label>
            <Input
              id="item-total"
              className="h-12 rounded-xl"
              inputMode="numeric"
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              className="min-h-24 rounded-xl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Where the item is stored, condition notes, etc."
            />
          </div>
          <Button className="h-12 w-full rounded-xl" disabled={saving} onClick={handleSubmit}>
            {saving ? "Saving…" : "Save item"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
