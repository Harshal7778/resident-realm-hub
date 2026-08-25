import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReactNode } from "react";

export function UnlockEventDialog({
  trigger,
  onUnlock,
}: {
  trigger: ReactNode;
  onUnlock: (reason: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    const ok = await onUnlock(reason);
    setSaving(false);
    if (ok) {
      setReason("");
      setOpen(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setReason("");
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>Unlock event</DialogTitle>
          <DialogDescription>A reason is required and stored with the event.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="unlock-reason">Reason</Label>
          <Textarea
            id="unlock-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Correction in contribution"
            className="min-h-20 rounded-xl"
          />
        </div>
        <Button className="h-11 w-full rounded-xl" disabled={saving} onClick={submit}>
          {saving ? "Unlocking…" : "Unlock event"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
