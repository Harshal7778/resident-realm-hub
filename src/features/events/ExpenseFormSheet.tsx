import { Paperclip } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

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
import { todayISO } from "@/lib/format";
import type { ExpenseInput } from "@/services/expenseService";
import { EXPENSE_CATEGORIES, type Expense } from "@/types/domain";

export function ExpenseFormSheet({
  trigger,
  eventId,
  expense,
  onSubmit,
}: {
  trigger: ReactNode;
  eventId: string;
  expense?: Expense;
  onSubmit: (values: ExpenseInput) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>(expense?.category ?? "Food");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [expenseDate, setExpenseDate] = useState(expense?.expenseDate ?? todayISO());
  const [receipt, setReceipt] = useState(expense?.receipt ?? "");
  const [notes, setNotes] = useState(expense?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setCategory(expense?.category ?? "Food");
    setDescription(expense?.description ?? "");
    setAmount(expense ? String(expense.amount) : "");
    setExpenseDate(expense?.expenseDate ?? todayISO());
    setReceipt(expense?.receipt ?? "");
    setNotes(expense?.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSubmit() {
    setSaving(true);
    const ok = await onSubmit({ eventId, category, description, amount, expenseDate, receipt, notes });
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="px-0 text-left">
          <SheetTitle>{expense ? "Edit expense" : "Add expense"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-description">Description</Label>
            <Input
              id="expense-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner catering"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-amount">Amount (₹)</Label>
            <Input
              id="expense-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="e.g. 8500"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-date">Expense date</Label>
            <Input
              id="expense-date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Receipt / bill</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => setReceipt(e.target.files?.[0]?.name ?? "")}
            />
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full justify-start rounded-xl"
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip className="mr-2 h-4 w-4" />
              {receipt || "Attach receipt"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Prototype: only the file name is stored as a reference.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-notes">Notes</Label>
            <Textarea
              id="expense-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paid in cash to vendor"
              className="min-h-20 rounded-xl"
            />
          </div>

          <Button className="h-12 w-full rounded-xl" disabled={saving} onClick={handleSubmit}>
            {saving ? "Saving…" : expense ? "Save changes" : "Add expense"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
