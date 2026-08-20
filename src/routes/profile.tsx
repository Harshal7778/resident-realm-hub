import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, Info, LogOut, Lock } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABEL } from "@/lib/permissions";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Society Management" },
      { name: "description", content: "View your society profile: name, house number, mobile number and role." },
      { property: "og:title", content: "Profile — Society Management" },
      { property: "og:description", content: "Your Green Valley Society account details." },
    ],
  }),
  component: ProfilePage,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  }

  return (
    <ProtectedPage title="Profile">
      {user && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {user.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">House {user.houseNumber}</p>
            </div>
            <StatusBadge label={ROLE_LABEL[user.role]} tone="info" className="ml-auto" />
          </div>

          <div className="rounded-2xl border border-border bg-card">
            <Row label="Name" value={user.name} />
            <Row label="House number" value={user.houseNumber} />
            <Row label="Mobile number" value={`+91 ${user.mobile}`} />
            <Row label="Role" value={ROLE_LABEL[user.role]} />
          </div>

          <p className="flex items-start gap-2 rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            House assignment, role and permissions can only be changed by a society admin.
          </p>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <button
              type="button"
              onClick={() => navigate({ to: "/notifications" })}
              className="flex min-h-14 w-full items-center gap-3 border-b border-border px-4 text-left text-sm font-medium text-foreground hover:bg-accent"
            >
              <Bell className="h-4 w-4 text-muted-foreground" /> Notifications
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() =>
                toast.info("Society Management", { description: "Prototype v1 • Green Valley Society" })
              }
              className="flex min-h-14 w-full items-center gap-3 px-4 text-left text-sm font-medium text-foreground hover:bg-accent"
            >
              <Info className="h-4 w-4 text-muted-foreground" /> About
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </button>
          </div>

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
      )}
    </ProtectedPage>
  );
}
