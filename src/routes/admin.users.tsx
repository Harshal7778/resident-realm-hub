import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, UserX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { FilterChips } from "@/components/common/FilterChips";
import { LoadingState } from "@/components/common/LoadingState";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_LABEL } from "@/lib/permissions";
import { userService, type AppUser } from "@/services/userService";
import { ALL_ROLES, ROLES, PERMISSIONS, type Role } from "@/types/domain";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users — Society Management" },
      { name: "description", content: "Society app users for Green Valley Society." },
      { property: "og:title", content: "Users — Society Management" },
      { property: "og:description", content: "Society app users for Green Valley Society." },
    ],
  }),
  component: UsersPage,
});

const roleFilters = [
  { value: "ALL", label: "All roles" },
  { value: ROLES.ADMIN, label: "Admins" },
  { value: ROLES.SECRETARY, label: "Secretaries" },
  { value: ROLES.TREASURER, label: "Treasurers" },
  { value: ROLES.MEMBER, label: "Members" },
];

function UsersPage() {
  const [users, setUsers] = useState<AppUser[] | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const load = useCallback(async () => {
    setUsers(await userService.listUsers());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = (users ?? []).filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.houseNumber.toLowerCase().includes(q) ||
      u.mobile.includes(q)
    );
  });

  const changeRole = async (user: AppUser, role: Role) => {
    if (role === user.role) return;
    const res = await userService.changeRole(user.id, role, `Role set from Users screen`);
    if (!res.ok) {
      toast.error(res.error ?? "Could not change role");
      return;
    }
    toast.success(`${user.name} is now ${ROLE_LABEL[role]}`);
    await load();
  };

  const setActive = async (user: AppUser, isActive: boolean) => {
    const res = await userService.setActive(user.id, isActive, isActive ? "Reactivated" : "Deactivated from Users screen");
    if (!res.ok) {
      toast.error(res.error ?? "Could not update user");
      return;
    }
    toast.success(`${user.name} ${isActive ? "reactivated" : "deactivated"}`);
    await load();
  };

  return (
    <ProtectedPage
      title="Users"
      subtitle={users ? `${users.length} app users` : "Loading…"}
      permission={PERMISSIONS.MANAGE_USERS}
      showBack
    >
      <div className="space-y-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search name, house or mobile" />
        <FilterChips options={roleFilters} value={roleFilter} onChange={setRoleFilter} />

        {users === null ? (
          <LoadingState rows={5} />
        ) : rows.length === 0 ? (
          <EmptyState title="No users found" description="Try a different search or filter." />
        ) : (
          <ul className="space-y-2">
            {rows.map((user) => (
              <li key={user.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      House {user.houseNumber} • +91 {user.mobile || "—"}
                    </p>
                  </div>
                  <StatusBadge label={ROLE_LABEL[user.role]} tone={user.role === ROLES.ADMIN ? "info" : "neutral"} />
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  <Select value={user.role} onValueChange={(v) => void changeRole(user, v as Role)}>
                    <SelectTrigger className="h-9 flex-1 rounded-lg text-sm" aria-label={`Role for ${user.name}`}>
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
                  {user.isActive ? (
                    user.role === ROLES.ADMIN && (users ?? []).filter((u) => u.role === ROLES.ADMIN && u.isActive).length <= 1 ? (
                      <Button variant="outline" className="h-9 shrink-0 rounded-lg text-xs" disabled>
                        <UserX className="mr-1 h-3.5 w-3.5" /> Deactivate
                      </Button>
                    ) : (
                      <ConfirmDialog
                        title={`Deactivate ${user.name}?`}
                        description="They will no longer be able to sign in. Their records are kept."
                        confirmLabel="Deactivate"
                        cancelLabel="Cancel"
                        destructive
                        onConfirm={() => void setActive(user, false)}
                        trigger={
                          <Button variant="outline" className="h-9 shrink-0 rounded-lg text-xs">
                            <UserX className="mr-1 h-3.5 w-3.5" /> Deactivate
                          </Button>
                        }
                      />
                    )
                  ) : (
                    <Button
                      variant="outline"
                      className="h-9 shrink-0 rounded-lg text-xs"
                      onClick={() => void setActive(user, true)}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Role changes and deactivations are recorded in the audit log. Members are never deleted.
        </p>
      </div>
    </ProtectedPage>
  );
}
