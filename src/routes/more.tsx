import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BellRing,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  FileBarChart,
  KeyRound,
  LogOut,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ROLES, type Permission, type Role } from "@/types/domain";
import { PERMISSIONS } from "@/types/domain";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "More — Society Management" },
      { name: "description", content: "Committee tools: members, meetings, notices, reports and settings." },
      { property: "og:title", content: "More — Society Management" },
      { property: "og:description", content: "All committee sections of Green Valley Society in one list." },
    ],
  }),
  component: MorePage,
});

interface MoreItem {
  label: string;
  to: string;
  icon: LucideIcon;
  permission: Permission;
}

const items: MoreItem[] = [
  { label: "Members", to: "/members", icon: UsersRound, permission: PERMISSIONS.MANAGE_MEMBERS },
  { label: "Meetings", to: "/meetings", icon: Users, permission: PERMISSIONS.MANAGE_MEETINGS },
  { label: "Attendance", to: "/attendance", icon: CalendarCheck, permission: PERMISSIONS.MANAGE_MEETINGS },
  { label: "Notices", to: "/notices", icon: Bell, permission: PERMISSIONS.MANAGE_NOTICES },
  { label: "Notifications", to: "/notifications", icon: BellRing, permission: PERMISSIONS.VIEW_OWN_PROFILE },
  { label: "Reports", to: "/reports", icon: FileBarChart, permission: PERMISSIONS.VIEW_REPORTS },
  { label: "Users & Roles", to: "/admin/users", icon: ShieldCheck, permission: PERMISSIONS.MANAGE_USERS },
  { label: "Role permissions", to: "/admin/permissions", icon: KeyRound, permission: PERMISSIONS.PERMISSION_MANAGE },
  { label: "Role definitions", to: "/admin/roles", icon: UserCog, permission: PERMISSIONS.ROLE_MANAGE },
  { label: "Settings", to: "/settings", icon: Settings, permission: PERMISSIONS.MANAGE_SETTINGS },
  { label: "Audit Logs", to: "/admin/audit", icon: ClipboardList, permission: PERMISSIONS.VIEW_AUDIT_LOGS },
];

const STAFF_ROLES: Role[] = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER];

function MorePage() {
  const { can, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  }

  return (
    <ProtectedPage title="More" roles={STAFF_ROLES}>
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {items
            .filter((item) => can(item.permission))
            .map(({ label, to, icon: Icon }) => (
              <button
                key={to}
                type="button"
                onClick={() => navigate({ to })}
                className="flex min-h-14 w-full items-center gap-3 border-b border-border px-4 text-left text-sm font-medium text-foreground last:border-0 hover:bg-accent"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </button>
            ))}
        </div>

        <button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 text-left text-sm font-medium text-foreground hover:bg-accent"
        >
          <UsersRound className="h-4 w-4 text-muted-foreground" /> My profile
          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
        </button>

        <ConfirmDialog
          title="Log out?"
          description="You'll need to sign in again with your mobile number."
          confirmLabel="Log out"
          destructive
          onConfirm={handleLogout}
          trigger={
            <Button variant="outline" className="h-12 w-full rounded-xl text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          }
        />
      </div>
    </ProtectedPage>
  );
}
