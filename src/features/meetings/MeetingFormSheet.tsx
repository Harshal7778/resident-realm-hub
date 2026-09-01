import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { todayISO } from "@/lib/format";
import type { MeetingInput } from "@/services/meetingService";

export function MeetingFormSheet({
  trigger,
  title = "Schedule meeting",
  initial,
  onSubmit,
}: {
  trigger: ReactNode;
  title?: string;
  initial?: MeetingInput;
  onSubmit: (values: MeetingInput) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<MeetingInput>({
    title: "",
    date: todayISO(),
    time: "20:00",
    location: "Society Hall",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(
      initial ?? {
        title: "",
        date: todayISO(),
        time: "20:00",
        location: "Society Hall",
        description: "",
      },
    );
  }, [open, initial]);

  const set = (patch: Partial<MeetingInput>) => setValues((v) => ({ ...v, ...patch }));

  async function handleSubmit() {
    setSaving(true);
    const ok = await onSubmit(values);
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

        <div className="space-y-4 pb-4">
          <div className="space-y-1.5">
            <Label htmlFor="meeting-title">Title</Label>
            <Input
              id="meeting-title"
              value={values.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="e.g. Monthly Society Meeting"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="meeting-date">Date</Label>
              <Input
                id="meeting-date"
                type="date"
                value={values.date}
                onChange={(e) => set({ date: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-time">Time</Label>
              <Input
                id="meeting-time"
                type="time"
                value={values.time}
                onChange={(e) => set({ time: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meeting-location">Location</Label>
            <Input
              id="meeting-location"
              value={values.location}
              onChange={(e) => set({ location: e.target.value })}
              placeholder="e.g. Society Hall"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meeting-description">Agenda / description</Label>
            <Textarea
              id="meeting-description"
              value={values.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Points to discuss"
              className="min-h-24 rounded-xl"
            />
          </div>

          <Button className="h-12 w-full rounded-xl" disabled={saving} onClick={handleSubmit}>
            {saving ? "Saving…" : "Save meeting"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
