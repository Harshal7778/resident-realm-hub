import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ROLE_LABEL, permissionLabel } from "@/lib/permissions";
import { permissionService } from "@/services/permissionService";
import { PERMISSIONS, ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Roles — Society Management" },
      { name: "description", content: "Role definitions for Green Valley Society." },
      { property: "og:title", content: "Roles — Society Management" },
      { property: "og:description", content: "Role definitions for Green Valley Society." },
    ],
  }),
  component: RolesPage,
});

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [ROLES.ADMIN]: "Full control of the society app, including roles, permissions, audit logs and unlocking closed events.",
  [ROLES.SECRETARY]: "Runs day-to-day operations: events, meetings, attendance, notices, members and inventory requests.",
  [ROLES.TREASURER]: "Handles money: contributions, payments, expenses and financial reports.",
  [ROLES.MEMBER]: "A resident of the society with a personal view of events, contributions and notices.",
};

function RolesPage() {
  const effective = permissionService.allEffective();

  return (
    <ProtectedPage
      title="Roles"
      subtitle="Role definitions"
      permission={PERMISSIONS.ROLE_MANAGE}
      showBack
    >
      <div className="space-y-3">
        <ul className="space-y-3">
          {(Object.keys(ROLE_DESCRIPTIONS) as Role[]).map((role) => (
            <li key={role} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{ROLE_LABEL[role]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {effective[role].length} permissions
                </span>
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {effective[role].map((permission) => (
                  <li
                    key={permission}
                    className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {permissionLabel(permission)}
                  </li>
                ))}
              </ul>
              {role !== ROLES.ADMIN && role !== ROLES.MEMBER && (
                <Link
                  to="/admin/permissions"
                  className="mt-3 flex items-center justify-end text-xs font-medium text-primary"
                >
                  Customise {ROLE_LABEL[role]} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Members keep a fixed, limited set of permissions. Admin always has every permission.
        </p>
      </div>
    </ProtectedPage>
  );
}
