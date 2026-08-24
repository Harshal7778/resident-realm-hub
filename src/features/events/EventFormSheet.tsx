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
import { todayISO } from "@/lib/format";
import type { EventInput } from "@/services/eventService";

const EVENT_TYPES = ["Festival", "Annual", "Cultural", "Sports", "Maintenance", "Other"];

export function EventFormSheet({
  trigger,
  onSubmit,
}: {
  trigger: ReactNode;
  onSubmit: (values: EventInput) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState(EVENT_TYPES[0] as string);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [standardContribution, setStandardContribution] = useState("1000");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setType(EVENT_TYPES[0] as string);
    setDescription("");
    setStartDate(todayISO());
    setEndDate(todayISO());
    setStandardContribution("1000");
  }, [open]);

  async function handleSubmit() {
    setSaving(true);
    const ok = await onSubmit({ name, type, description, startDate, endDate, standardContribution });
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="px-0 text-left">
          <SheetTitle>Create event</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-4">
          <div className="space-y-1.5">
            <Label htmlFor="event-name">Event name</Label>
            <Input
              id="event-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diwali Function 2026"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Event type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this event about?"
              className="min-h-24 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-start">Start date</Label>
              <Input
                id="event-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-end">End date</Label>
              <Input
                id="event-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-amount">Standard contribution (₹)</Label>
            <Input
              id="event-amount"
              inputMode="numeric"
              value={standardContribution}
              onChange={(e) => setStandardContribution(e.target.value.replace(/[^\d]/g, ""))}
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              A contribution record is created for every active house.
            </p>
          </div>

          <Button className="h-12 w-full rounded-xl" disabled={saving} onClick={handleSubmit}>
            {saving ? "Creating…" : "Create event"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
