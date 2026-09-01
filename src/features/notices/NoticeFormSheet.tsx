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
import type { NoticeInput } from "@/services/noticeService";
import { NOTICE_PRIORITIES, type NoticePriority } from "@/types/domain";

function defaults(): NoticeInput {
  const publishDate = todayISO();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  return {
    title: "",
    message: "",
    priority: NOTICE_PRIORITIES.NORMAL,
    publishDate,
    expiryDate: expiry.toISOString().slice(0, 10),
  };
}

export function NoticeFormSheet({
  trigger,
  title = "New notice",
  initial,
  showPublishToggle = true,
  onSubmit,
}: {
  trigger: ReactNode;
  title?: string;
  initial?: NoticeInput;
  showPublishToggle?: boolean;
  onSubmit: (values: NoticeInput, publish: boolean) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<NoticeInput>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(initial ?? defaults());
  }, [open, initial]);

  const set = (patch: Partial<NoticeInput>) => setValues((v) => ({ ...v, ...patch }));

  async function submit(publish: boolean) {
    setSaving(true);
    const ok = await onSubmit(values, publish);
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
            <Label htmlFor="notice-title">Title</Label>
            <Input
              id="notice-title"
              value={values.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="e.g. Water tank cleaning"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select
              value={values.priority}
              onValueChange={(v) => set({ priority: v as NoticePriority })}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NOTICE_PRIORITIES.IMPORTANT}>Important</SelectItem>
                <SelectItem value={NOTICE_PRIORITIES.NORMAL}>Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notice-message">Message</Label>
            <Textarea
              id="notice-message"
              value={values.message}
              onChange={(e) => set({ message: e.target.value })}
              placeholder="e.g. Water tank cleaning today at 5 PM."
              className="min-h-28 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="notice-publish">Publish date</Label>
              <Input
                id="notice-publish"
                type="date"
                value={values.publishDate}
                onChange={(e) => set({ publishDate: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notice-expiry">Expiry date</Label>
              <Input
                id="notice-expiry"
                type="date"
                value={values.expiryDate}
                onChange={(e) => set({ expiryDate: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Button className="h-12 w-full rounded-xl" disabled={saving} onClick={() => submit(true)}>
              {saving ? "Saving…" : showPublishToggle ? "Publish notice" : "Save notice"}
            </Button>
            {showPublishToggle && (
              <Button
                variant="outline"
                className="h-12 w-full rounded-xl"
                disabled={saving}
                onClick={() => submit(false)}
              >
                Save as draft
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
