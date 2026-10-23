import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CONFIGURABLE_PERMISSIONS,
  ROLE_LABEL,
  permissionLabel,
} from "@/lib/permissions";
import { permissionService } from "@/services/permissionService";
import { PERMISSIONS, type Permission, type Role } from "@/types/domain";

export const Route = createFileRoute("/admin/permissions")({
  head: () => ({
    meta: [
      { title: "Permissions — Society Management" },
      { name: "description", content: "Role permissions for Green Valley Society." },
      { property: "og:title", content: "Permissions — Society Management" },
      { property: "og:description", content: "Role permissions for Green Valley Society." },
    ],
  }),
  component: PermissionsPage,
});

const TAB_ROLES: Role[] = ["SECRETARY", "TREASURER"];

function PermissionsPage() {
  const [effective, setEffective] = useState<Record<Role, Permission[]>>(() =>
    permissionService.allEffective(),
  );
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => permissionService.subscribe(() => setEffective(permissionService.allEffective())), []);

  const toggle = useCallback(async (role: Role, permission: Permission, enabled: boolean) => {
    setSaving(`${role}:${permission}`);
    const res = await permissionService.setPermission(role, permission, enabled);
    setSaving(null);
    if (!res.ok) {
      toast.error(res.error ?? "Could not change permission");
      return;
    }
    toast.success(
      `${permissionLabel(permission)} ${enabled ? "enabled" : "disabled"} for ${ROLE_LABEL[role]}`,
    );
  }, []);

  const resetRole = useCallback(async (role: Role) => {
    setSaving(`reset:${role}`);
    await permissionService.resetRole(role);
    setSaving(null);
    toast.success(`${ROLE_LABEL[role]} permissions restored to defaults`);
  }, []);

  return (
    <ProtectedPage
      title="Permissions"
      subtitle="Customise what staff roles can do"
      permission={PERMISSIONS.PERMISSION_MANAGE}
      showBack
    >
      <Tabs defaultValue={TAB_ROLES[0]} className="space-y-3">
        <TabsList className="grid w-full grid-cols-2 rounded-xl">
          {TAB_ROLES.map((role) => (
            <TabsTrigger key={role} value={role} className="rounded-lg">
              {ROLE_LABEL[role]}
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_ROLES.map((role) => (
          <TabsContent key={role} value={role} className="space-y-3">
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {CONFIGURABLE_PERMISSIONS.map((permission) => {
                const checked = effective[role]?.includes(permission) ?? false;
                const key = `${role}:${permission}`;
                return (
                  <li key={permission} className="flex items-center gap-3 px-4 py-3">
                    <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                      {permissionLabel(permission)}
                    </span>
                    <Switch
                      checked={checked}
                      disabled={saving === key}
                      onCheckedChange={(v) => void toggle(role, permission, v)}
                      aria-label={`${permissionLabel(permission)} for ${ROLE_LABEL[role]}`}
                    />
                  </li>
                );
              })}
            </ul>
            <ConfirmDialog
              title={`Reset ${ROLE_LABEL[role]} permissions?`}
              description="All custom changes for this role will be cleared and defaults restored."
              confirmLabel="Reset to defaults"
              cancelLabel="Cancel"
              destructive
              onConfirm={() => void resetRole(role)}
              trigger={
                <Button variant="outline" className="h-11 w-full rounded-xl" disabled={saving === `reset:${role}`}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset {ROLE_LABEL[role]} to defaults
                </Button>
              }
            />
          </TabsContent>
        ))}
      </Tabs>
      <p className="mt-3 text-xs text-muted-foreground">
        Admin keeps every permission and Members cannot be customised. Changes apply immediately to anyone signed in
        with the role and are recorded in the audit log.
      </p>
    </ProtectedPage>
  );
}
