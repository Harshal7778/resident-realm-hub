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
import { formatINR, todayISO } from "@/lib/format";
import type { PaymentInput } from "@/services/paymentService";
import { PAYMENT_TYPES, type Contribution, type PaymentType } from "@/types/domain";

export function RecordPaymentSheet({
  trigger,
  eventId,
  contributions,
  defaultContributionId,
  onSubmit,
}: {
  trigger: ReactNode;
  eventId: string;
  contributions: Contribution[];
  defaultContributionId?: string;
  onSubmit: (values: PaymentInput) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [contributionId, setContributionId] = useState(defaultContributionId ?? "");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<PaymentType>(PAYMENT_TYPES.REGULAR);
  const [paidAt, setPaidAt] = useState(todayISO());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setContributionId(defaultContributionId ?? contributions[0]?.id ?? "");
    setAmount("");
    setType(PAYMENT_TYPES.REGULAR);
    setPaidAt(todayISO());
    setNote("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selected = contributions.find((c) => c.id === contributionId);

  async function handleSubmit() {
    setSaving(true);
    const ok = await onSubmit({ eventId, contributionId, amount, type, paidAt, note });
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="px-0 text-left">
          <SheetTitle>Record payment</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-4">
          <div className="space-y-1.5">
            <Label>House</Label>
            <Select value={contributionId} onValueChange={setContributionId}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select a house" />
              </SelectTrigger>
              <SelectContent>
                {contributions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.houseNumber} — {c.memberName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected && (
              <p className="text-xs text-muted-foreground">
                Required {formatINR(selected.requiredAmount)} • Paid {formatINR(selected.regularPaid)} • Extra{" "}
                {formatINR(selected.extraPaid)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-amount">Amount (₹)</Label>
            <Input
              id="payment-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="e.g. 500"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Payment type</Label>
            <Select value={type} onValueChange={(v) => setType(v as PaymentType)}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PAYMENT_TYPES.REGULAR}>Regular</SelectItem>
                <SelectItem value={PAYMENT_TYPES.EXTRA}>Extra</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Extra payments never change the required contribution status.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-date">Payment date</Label>
            <Input
              id="payment-date"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-note">Note</Label>
            <Textarea
              id="payment-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Cash received by treasurer"
              className="min-h-20 rounded-xl"
            />
          </div>

          <Button className="h-12 w-full rounded-xl" disabled={saving} onClick={handleSubmit}>
            {saving ? "Saving…" : "Record payment"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">Manual cash entry only.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
