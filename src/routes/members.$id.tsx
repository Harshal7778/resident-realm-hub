import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarCheck,
  Package,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
  UserX,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { MemberFormSheet } from "@/features/members/MemberFormSheet";
import { ROLE_LABEL } from "@/lib/permissions";
import { memberService } from "@/services/memberService";
import { ROLES, type Member, type Role } from "@/types/domain";

export const Route = createFileRoute("/members/$id")({
  head: () => ({
    meta: [
      { title: "Member detail — Society Management" },
      { name: "description", content: "Member profile, mobile numbers, role and history for Green Valley Society." },
      { property: "og:title", content: "Member detail — Society Management" },
      { property: "og:description", content: "Manage a society member's details and registered mobile numbers." },
    ],
  }),
  component: MemberDetailPage,
});

const STAFF_ROLES: Role[] = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function Section({ title, icon, description }: { title: string; icon: typeof Wallet; description: string }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <EmptyState icon={icon} title="Nothing here yet" description={description} />
    </section>
  );
}

function MemberDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [member, setMember] = useState<Member | null | undefined>(undefined);
  const [houseNumber, setHouseNumber] = useState("—");
  const [newMobile, setNewMobile] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const next = await memberService.getMemberById(id);
    setMember(next);
    if (next) setHouseNumber(memberService.houseNumberFor(next));
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAddMobile() {
    setAdding(true);
    const res = await memberService.addMobileNumber(id, newMobile);
    setAdding(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not add number");
      return;
    }
    setNewMobile("");
    toast.success("Mobile number added");
    await load();
  }

  return (
    <ProtectedPage title="Member" subtitle={member?.name ?? "Details"} roles={STAFF_ROLES} showBack>
      {member === undefined ? (
        <LoadingState rows={5} />
      ) : member === null ? (
        <EmptyState title="Member not found" description="This member may have been removed." />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {member.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">{member.name}</p>
              <p className="text-sm text-muted-foreground">House {houseNumber}</p>
            </div>
            <StatusBadge
              label={member.isActive ? "Active" : "Inactive"}
              tone={member.isActive ? "success" : "neutral"}
              className="ml-auto"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card">
            <Row label="Name" value={member.name} />
            <Row label="House number" value={houseNumber} />
            <Row label="Role" value={ROLE_LABEL[member.role]} />
            <Row label="Status" value={member.isActive ? "Active" : "Inactive"} />
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Mobile numbers</h3>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {member.mobileNumbers.map((n) => (
                <li key={n.id} className="flex items-center gap-3 px-4 py-3">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">+91 {n.number}</span>
                  {n.label === "PRIMARY" && <StatusBadge label="Primary" tone="info" />}
                  {isAdmin && (
                    <span className="ml-auto flex items-center gap-1">
                      {n.label !== "PRIMARY" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Make ${n.number} primary`}
                          onClick={async () => {
                            await memberService.setPrimaryMobile(member.id, n.id);
                            toast.success("Primary number updated");
                            await load();
                          }}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <ConfirmDialog
                        title="Remove this number?"
                        description={`+91 ${n.number} will no longer be able to log in.`}
                        confirmLabel="Remove"
                        destructive
                        onConfirm={async () => {
                          const res = await memberService.removeMobileNumber(member.id, n.id);
                          if (!res.ok) toast.error(res.error ?? "Could not remove number");
                          else toast.success("Mobile number removed");
                          await load();
                        }}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Remove ${n.number}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        }
                      />
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <Input
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Add 10-digit number"
                  aria-label="New mobile number"
                  className="h-12 rounded-xl"
                />
                <Button className="h-12 rounded-xl" disabled={adding} onClick={handleAddMobile}>
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Only registered active numbers can be used to log in.
            </p>
          </section>

          {isAdmin && (
            <div className="grid gap-2">
              <MemberFormSheet
                title="Edit member"
                submitLabel="Save changes"
                initial={{ name: member.name, houseNumber, role: member.role }}
                onSubmit={async (values) => {
                  const res = await memberService.updateMember(member.id, {
                    name: values.name,
                    houseNumber: values.houseNumber,
                    role: values.role,
                  });
                  if (!res.ok) {
                    toast.error(res.error ?? "Could not save changes");
                    return false;
                  }
                  toast.success("Member updated");
                  await load();
                  return true;
                }}
                trigger={
                  <Button variant="outline" className="h-12 w-full rounded-xl">
                    <Pencil className="mr-2 h-4 w-4" /> Edit member
                  </Button>
                }
              />

              <ConfirmDialog
                title={member.isActive ? "Deactivate member?" : "Reactivate member?"}
                description={
                  member.isActive
                    ? "The member keeps all historical records but cannot log in."
                    : "The member will be able to log in again."
                }
                confirmLabel={member.isActive ? "Deactivate" : "Reactivate"}
                destructive={member.isActive}
                onConfirm={async () => {
                  await memberService.setMemberActive(member.id, !member.isActive);
                  toast.success(member.isActive ? "Member deactivated" : "Member reactivated");
                  await load();
                }}
                trigger={
                  <Button
                    variant="outline"
                    className={member.isActive ? "h-12 w-full rounded-xl text-destructive" : "h-12 w-full rounded-xl"}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    {member.isActive ? "Deactivate member" : "Reactivate member"}
                  </Button>
                }
              />
              <p className="text-xs text-muted-foreground">
                Members are never deleted — historical records depend on them.
              </p>
            </div>
          )}

          <Section
            title="Contribution history"
            icon={Wallet}
            description="Event contributions will appear here once the finance module is live."
          />
          <Section
            title="Inventory history"
            icon={Package}
            description="Borrowed and returned items will appear here."
          />
          <Section
            title="Meeting attendance"
            icon={CalendarCheck}
            description="Meeting attendance records will appear here."
          />
        </div>
      )}
    </ProtectedPage>
  );
}
