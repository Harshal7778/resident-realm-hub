import { PERMISSIONS, ROLES, type Permission, type Role } from "@/types/domain";

/**
 * Some permissions were introduced under older names. They map onto a single
 * canonical permission so existing screens keep working while the admin
 * permission editor manages one clean list.
 */
const ALIASES: Partial<Record<Permission, Permission>> = {
  [PERMISSIONS.MANAGE_EVENTS]: PERMISSIONS.EVENT_MANAGE,
  [PERMISSIONS.MANAGE_INVENTORY]: PERMISSIONS.INVENTORY_MANAGE,
  [PERMISSIONS.MANAGE_MEETINGS]: PERMISSIONS.MEETING_MANAGE,
  [PERMISSIONS.MANAGE_NOTICES]: PERMISSIONS.NOTICE_MANAGE,
  [PERMISSIONS.MANAGE_FINANCE]: PERMISSIONS.EXPENSE_MANAGE,
  [PERMISSIONS.VIEW_REPORTS]: PERMISSIONS.REPORT_VIEW,
  [PERMISSIONS.RECORD_PAYMENT]: PERMISSIONS.PAYMENT_RECORD,
  [PERMISSIONS.UNLOCK_EVENT]: PERMISSIONS.EVENT_UNLOCK,
  [PERMISSIONS.VIEW_AUDIT_LOGS]: PERMISSIONS.AUDIT_VIEW,
  [PERMISSIONS.MANAGE_ROLES]: PERMISSIONS.ROLE_MANAGE,
};

export function canonicalPermission(permission: Permission): Permission {
  return ALIASES[permission] ?? permission;
}

/** Permissions an admin can toggle for Secretary / Treasurer. */
export const CONFIGURABLE_PERMISSIONS: Permission[] = [
  PERMISSIONS.EVENT_VIEW,
  PERMISSIONS.EVENT_MANAGE,
  PERMISSIONS.CONTRIBUTION_VIEW,
  PERMISSIONS.CONTRIBUTION_MANAGE,
  PERMISSIONS.PAYMENT_RECORD,
  PERMISSIONS.EXPENSE_VIEW,
  PERMISSIONS.EXPENSE_MANAGE,
  PERMISSIONS.CLOSE_EVENT,
  PERMISSIONS.MEETING_MANAGE,
  PERMISSIONS.ATTENDANCE_MANAGE,
  PERMISSIONS.NOTICE_MANAGE,
  PERMISSIONS.INVENTORY_VIEW,
  PERMISSIONS.INVENTORY_MANAGE,
  PERMISSIONS.INVENTORY_APPROVE,
  PERMISSIONS.REPORT_VIEW,
  PERMISSIONS.MANAGE_MEMBERS,
];

/** Never configurable — reserved for the Admin role. */
export const ADMIN_ONLY_PERMISSIONS: Permission[] = [
  PERMISSIONS.ROLE_MANAGE,
  PERMISSIONS.PERMISSION_MANAGE,
  PERMISSIONS.EVENT_UNLOCK,
  PERMISSIONS.AUDIT_VIEW,
  PERMISSIONS.MANAGE_USERS,
  PERMISSIONS.MANAGE_SETTINGS,
];

export const CONFIGURABLE_ROLES: Role[] = [ROLES.SECRETARY, ROLES.TREASURER];

export const PERMISSION_LABEL: Partial<Record<Permission, string>> = {
  [PERMISSIONS.EVENT_VIEW]: "View events",
  [PERMISSIONS.EVENT_MANAGE]: "Manage events",
  [PERMISSIONS.CONTRIBUTION_VIEW]: "View contributions",
  [PERMISSIONS.CONTRIBUTION_MANAGE]: "Manage contributions",
  [PERMISSIONS.PAYMENT_RECORD]: "Record payments",
  [PERMISSIONS.EXPENSE_VIEW]: "View expenses",
  [PERMISSIONS.EXPENSE_MANAGE]: "Manage expenses",
  [PERMISSIONS.CLOSE_EVENT]: "Close events",
  [PERMISSIONS.MEETING_MANAGE]: "Manage meetings",
  [PERMISSIONS.ATTENDANCE_MANAGE]: "Manage attendance",
  [PERMISSIONS.NOTICE_MANAGE]: "Manage notices",
  [PERMISSIONS.INVENTORY_VIEW]: "View inventory",
  [PERMISSIONS.INVENTORY_MANAGE]: "Manage inventory",
  [PERMISSIONS.INVENTORY_APPROVE]: "Approve inventory requests",
  [PERMISSIONS.REPORT_VIEW]: "View reports",
  [PERMISSIONS.MANAGE_MEMBERS]: "Manage members",
  [PERMISSIONS.ROLE_MANAGE]: "Manage roles",
  [PERMISSIONS.PERMISSION_MANAGE]: "Manage permissions",
  [PERMISSIONS.EVENT_UNLOCK]: "Unlock closed events",
  [PERMISSIONS.AUDIT_VIEW]: "View audit logs",
  [PERMISSIONS.MANAGE_USERS]: "Manage users",
  [PERMISSIONS.MANAGE_SETTINGS]: "Manage settings",
};

export function permissionLabel(permission: Permission): string {
  return PERMISSION_LABEL[permission] ?? permission.replace(/_/g, " ").toLowerCase();
}

const BASE: Permission[] = [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_OWN_PROFILE];

const ALL_CANONICAL: Permission[] = Array.from(
  new Set(Object.values(PERMISSIONS).map(canonicalPermission)),
);

/** Defaults used until an admin customises a role. */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: ALL_CANONICAL,
  [ROLES.SECRETARY]: [
    ...BASE,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_MANAGE,
    PERMISSIONS.CONTRIBUTION_VIEW,
    PERMISSIONS.CONTRIBUTION_MANAGE,
    PERMISSIONS.PAYMENT_RECORD,
    PERMISSIONS.EXPENSE_VIEW,
    PERMISSIONS.CLOSE_EVENT,
    PERMISSIONS.MEETING_MANAGE,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.NOTICE_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.INVENTORY_APPROVE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.MANAGE_MEMBERS,
  ],
  [ROLES.TREASURER]: [
    ...BASE,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.CONTRIBUTION_VIEW,
    PERMISSIONS.CONTRIBUTION_MANAGE,
    PERMISSIONS.PAYMENT_RECORD,
    PERMISSIONS.EXPENSE_VIEW,
    PERMISSIONS.EXPENSE_MANAGE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
  ],
  [ROLES.MEMBER]: [
    ...BASE,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.CONTRIBUTION_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
  ],
};

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(
  role: Role,
  permission: Permission,
  granted?: Permission[],
): boolean {
  const set = granted ?? permissionsForRole(role);
  return set.includes(canonicalPermission(permission));
}

export function isStaffRole(role: Role): boolean {
  return role !== ROLES.MEMBER;
}

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  SECRETARY: "Secretary",
  TREASURER: "Treasurer",
  MEMBER: "Member",
};
