import {
  CONFIGURABLE_PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_LABEL,
  canonicalPermission,
  permissionLabel,
} from "@/lib/permissions";
import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { auditService } from "@/services/auditService";
import { ROLES, type Permission, type Role } from "@/types/domain";

export const PERMISSIONS_EVENT = "sm:permissions-changed";

type Overrides = Partial<Record<Role, Permission[]>>;

function readOverrides(): Overrides {
  return readItem<Overrides>(STORAGE_KEYS.rolePermissions) ?? {};
}

function writeOverrides(next: Overrides) {
  writeItem(STORAGE_KEYS.rolePermissions, next);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PERMISSIONS_EVENT));
}

export const permissionService = {
  /** Effective permissions for a role — admin always keeps everything. */
  effectiveFor(role: Role): Permission[] {
    if (role === ROLES.ADMIN) return ROLE_PERMISSIONS[ROLES.ADMIN];
    const overrides = readOverrides()[role];
    return (overrides ?? ROLE_PERMISSIONS[role] ?? []).map(canonicalPermission);
  },

  allEffective(): Record<Role, Permission[]> {
    return {
      ADMIN: this.effectiveFor(ROLES.ADMIN),
      SECRETARY: this.effectiveFor(ROLES.SECRETARY),
      TREASURER: this.effectiveFor(ROLES.TREASURER),
      MEMBER: this.effectiveFor(ROLES.MEMBER),
    };
  },

  isConfigurable(permission: Permission): boolean {
    return CONFIGURABLE_PERMISSIONS.includes(canonicalPermission(permission));
  },

  /** Turns a single permission on or off for a role and writes an audit entry. */
  async setPermission(
    role: Role,
    permission: Permission,
    enabled: boolean,
  ): Promise<{ ok: boolean; error?: string }> {
    await new Promise((r) => setTimeout(r, 160));
    if (role === ROLES.ADMIN) return { ok: false, error: "Admin permissions cannot be changed." };
    const canonical = canonicalPermission(permission);
    if (!this.isConfigurable(canonical)) {
      return { ok: false, error: "This permission is reserved for Admin." };
    }
    const current = this.effectiveFor(role);
    const was = current.includes(canonical);
    if (was === enabled) return { ok: true };
    const next = enabled ? [...current, canonical] : current.filter((p) => p !== canonical);
    writeOverrides({ ...readOverrides(), [role]: next });
    auditService.log({
      action: "Permission changed",
      entity: `${ROLE_LABEL[role]} role`,
      entityId: role,
      oldValue: `${permissionLabel(canonical)}: ${was ? "ON" : "OFF"}`,
      newValue: `${permissionLabel(canonical)}: ${enabled ? "ON" : "OFF"}`,
      reason: `Changed ${ROLE_LABEL[role]} permissions`,
    });
    return { ok: true };
  },

  /** Restores the built-in defaults for a role. */
  async resetRole(role: Role): Promise<{ ok: boolean }> {
    await new Promise((r) => setTimeout(r, 160));
    const overrides = readOverrides();
    delete overrides[role];
    writeOverrides(overrides);
    auditService.log({
      action: "Permission changed",
      entity: `${ROLE_LABEL[role]} role`,
      entityId: role,
      oldValue: "Custom permissions",
      newValue: "Default permissions",
      reason: "Reset to defaults",
    });
    return { ok: true };
  },

  subscribe(listener: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(PERMISSIONS_EVENT, listener);
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener(PERMISSIONS_EVENT, listener);
      window.removeEventListener("storage", listener);
    };
  },
};
