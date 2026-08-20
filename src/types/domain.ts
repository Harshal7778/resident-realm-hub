// Core domain types for the Society Management prototype.

export const ROLES = {
  ADMIN: "ADMIN",
  SECRETARY: "SECRETARY",
  TREASURER: "TREASURER",
  MEMBER: "MEMBER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER, ROLES.MEMBER];

export const PERMISSIONS = {
  VIEW_DASHBOARD: "VIEW_DASHBOARD",
  VIEW_OWN_PROFILE: "VIEW_OWN_PROFILE",
  MANAGE_EVENTS: "MANAGE_EVENTS",
  MANAGE_FINANCE: "MANAGE_FINANCE",
  MANAGE_INVENTORY: "MANAGE_INVENTORY",
  MANAGE_MEMBERS: "MANAGE_MEMBERS",
  MANAGE_MEETINGS: "MANAGE_MEETINGS",
  MANAGE_NOTICES: "MANAGE_NOTICES",
  VIEW_REPORTS: "VIEW_REPORTS",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_ROLES: "MANAGE_ROLES",
  VIEW_AUDIT_LOGS: "VIEW_AUDIT_LOGS",
  MANAGE_SETTINGS: "MANAGE_SETTINGS",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface Society extends Timestamps {
  id: string;
  name: string;
  address: string;
  city: string;
  registrationNo: string;
}

export interface MobileNumber {
  id: string;
  number: string;
  label: "PRIMARY" | "SECONDARY";
  isActive: boolean;
}

export interface Member extends Timestamps {
  id: string;
  societyId: string;
  houseId: string;
  name: string;
  isOwner: boolean;
  isActive: boolean;
  mobileNumbers: MobileNumber[];
  role: Role;
}

export interface House extends Timestamps {
  id: string;
  societyId: string;
  houseNumber: string;
  ownerName: string;
  isActive: boolean;
}

export interface User {
  id: string;
  memberId: string;
  societyId: string;
  name: string;
  houseNumber: string;
  mobile: string;
  role: Role;
  permissions: Permission[];
}

export interface Session {
  user: User;
  token: string;
  loginMethod: "OTP" | "DEMO";
  issuedAt: string;
}

export interface ServiceResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
