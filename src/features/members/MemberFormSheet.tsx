import { Plus, Trash2 } from "lucide-react";
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
import { ROLE_LABEL } from "@/lib/permissions";
import { ALL_ROLES, type Role } from "@/types/domain";

export interface MemberFormValues {
  name: string;
  houseNumber: string;
  role: Role;
  mobiles: string[];
}

interface MemberFormSheetProps {
  trigger: ReactNode;
  title: string;
  submitLabel: string;
  /** Omit for edit mode — numbers are managed on the detail page. */
  withMobiles?: boolean;
  initial?: Partial<MemberFormValues>;
  onSubmit: (values: MemberFormValues) => Promise<boolean>;
}

export function MemberFormSheet({
  trigger,
  title,
  submitLabel,
  withMobiles,
  initial,
  onSubmit,
}: MemberFormSheetProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [houseNumber, setHouseNumber] = useState(initial?.houseNumber ?? "");
  const [role, setRole] = useState<Role>(initial?.role ?? "MEMBER");
  const [mobiles, setMobiles] = useState<string[]>(initial?.mobiles?.length ? initial.mobiles : [""]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setHouseNumber(initial?.houseNumber ?? "");
    setRole(initial?.role ?? "MEMBER");
    setMobiles(initial?.mobiles?.length ? initial.mobiles : [""]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSubmit() {
    setSaving(true);
    const ok = await onSubmit({ name, houseNumber, role, mobiles });
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="px-0 text-left">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-4">
          <div className="space-y-1.5">
            <Label htmlFor="member-name">Name</Label>
            <Input
              id="member-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajesh Patel"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-house">House number</Label>
            <Input
              id="member-house"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="e.g. H26"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {withMobiles && (
            <div className="space-y-2">
              <Label>Mobile numbers</Label>
              {mobiles.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={value}
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(e) =>
                      setMobiles((prev) => prev.map((m, i) => (i === index ? e.target.value : m)))
                    }
                    placeholder="10-digit number"
                    className="h-12 rounded-xl"
                    aria-label={index === 0 ? "Primary mobile number" : `Mobile number ${index + 1}`}
                  />
                  {mobiles.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove number"
                      onClick={() => setMobiles((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl"
                onClick={() => setMobiles((prev) => [...prev, ""])}
              >
                <Plus className="mr-2 h-4 w-4" /> Add another number
              </Button>
              <p className="text-xs text-muted-foreground">
                The first number is the primary login number.
              </p>
            </div>
          )}

          <Button className="h-12 w-full rounded-xl" disabled={saving} onClick={handleSubmit}>
            {saving ? "Saving…" : submitLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
