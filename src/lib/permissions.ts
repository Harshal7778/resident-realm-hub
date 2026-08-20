import { PERMISSIONS, ROLES, type Permission, type Role } from "@/types/domain";

const ALL: Permission[] = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: ALL,
  [ROLES.SECRETARY]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.MANAGE_MEETINGS,
    PERMISSIONS.MANAGE_NOTICES,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.TREASURER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.MANAGE_FINANCE,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.MEMBER]: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_OWN_PROFILE],
};

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return permissionsForRole(role).includes(permission);
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
