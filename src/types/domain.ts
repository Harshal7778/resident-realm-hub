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
  RECORD_PAYMENT: "RECORD_PAYMENT",
  CLOSE_EVENT: "CLOSE_EVENT",
  UNLOCK_EVENT: "UNLOCK_EVENT",
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

export const EVENT_STATUSES = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
} as const;

export type EventStatus = (typeof EVENT_STATUSES)[keyof typeof EVENT_STATUSES];

export interface SocietyEvent extends Timestamps {
  id: string;
  societyId: string;
  name: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  standardContribution: number;
  status: EventStatus;
  closedAt?: string;
  unlockReason?: string;
  unlockedAt?: string;
}

export const CONTRIBUTION_STATUSES = {
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
} as const;

export type ContributionStatus =
  (typeof CONTRIBUTION_STATUSES)[keyof typeof CONTRIBUTION_STATUSES];

export interface Contribution extends Timestamps {
  id: string;
  eventId: string;
  houseId: string;
  houseNumber: string;
  memberId: string;
  memberName: string;
  requiredAmount: number;
  regularPaid: number;
  extraPaid: number;
  status: ContributionStatus;
}

export const PAYMENT_TYPES = {
  REGULAR: "REGULAR",
  EXTRA: "EXTRA",
} as const;

export type PaymentType = (typeof PAYMENT_TYPES)[keyof typeof PAYMENT_TYPES];

export interface Payment extends Timestamps {
  id: string;
  eventId: string;
  contributionId: string;
  houseId: string;
  houseNumber: string;
  amount: number;
  type: PaymentType;
  paidAt: string;
  note: string;
}

export interface EventTotals {
  expected: number;
  collected: number;
  extra: number;
  pending: number;
  expenses: number;
  balance: number;
}

export const EXPENSE_CATEGORIES = ["Food", "Decoration", "Sound", "Venue", "Transport", "Other"] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense extends Timestamps {
  id: string;
  eventId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  /** Prototype: local/mock file reference only (name of the picked receipt). */
  receipt: string;
  notes: string;
}
