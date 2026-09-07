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
  EVENT_VIEW: "EVENT_VIEW",
  EVENT_MANAGE: "EVENT_MANAGE",
  CONTRIBUTION_VIEW: "CONTRIBUTION_VIEW",
  CONTRIBUTION_MANAGE: "CONTRIBUTION_MANAGE",
  PAYMENT_RECORD: "PAYMENT_RECORD",
  EXPENSE_VIEW: "EXPENSE_VIEW",
  EXPENSE_MANAGE: "EXPENSE_MANAGE",
  MEETING_MANAGE: "MEETING_MANAGE",
  ATTENDANCE_MANAGE: "ATTENDANCE_MANAGE",
  NOTICE_MANAGE: "NOTICE_MANAGE",
  INVENTORY_VIEW: "INVENTORY_VIEW",
  INVENTORY_MANAGE: "INVENTORY_MANAGE",
  INVENTORY_APPROVE: "INVENTORY_APPROVE",
  REPORT_VIEW: "REPORT_VIEW",
  ROLE_MANAGE: "ROLE_MANAGE",
  PERMISSION_MANAGE: "PERMISSION_MANAGE",
  EVENT_UNLOCK: "EVENT_UNLOCK",
  AUDIT_VIEW: "AUDIT_VIEW",
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

export interface Meeting extends Timestamps {
  id: string;
  societyId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export const ATTENDANCE_STATUSES = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[keyof typeof ATTENDANCE_STATUSES];

export interface AttendanceRecord extends Timestamps {
  id: string;
  meetingId: string;
  houseId: string;
  houseNumber: string;
  memberId: string;
  memberName: string;
  status: AttendanceStatus;
}

export const NOTICE_PRIORITIES = {
  IMPORTANT: "IMPORTANT",
  NORMAL: "NORMAL",
} as const;

export type NoticePriority = (typeof NOTICE_PRIORITIES)[keyof typeof NOTICE_PRIORITIES];

export const NOTICE_STATUSES = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type NoticeStatus = (typeof NOTICE_STATUSES)[keyof typeof NOTICE_STATUSES];

export interface Notice extends Timestamps {
  id: string;
  societyId: string;
  title: string;
  message: string;
  priority: NoticePriority;
  status: NoticeStatus;
  publishDate: string;
  expiryDate: string;
}

export const NOTIFICATION_TYPES = {
  NEW_NOTICE: "NEW_NOTICE",
  MEETING_REMINDER: "MEETING_REMINDER",
  CONTRIBUTION_REMINDER: "CONTRIBUTION_REMINDER",
  NEW_EVENT: "NEW_EVENT",
  PAYMENT_RECORDED: "PAYMENT_RECORDED",
  INVENTORY_APPROVED: "INVENTORY_APPROVED",
  INVENTORY_ISSUED: "INVENTORY_ISSUED",
  INVENTORY_RETURN_REMINDER: "INVENTORY_RETURN_REMINDER",
  INVENTORY_OVERDUE: "INVENTORY_OVERDUE",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  /** Optional in-app deep link (e.g. /notices). */
  link?: string;
}

export const INVENTORY_CATEGORIES = [
  "Utensils",
  "Cookware",
  "Furniture",
  "Decoration",
  "Electrical",
  "Other",
] as const;

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

export interface InventoryItem extends Timestamps {
  id: string;
  societyId: string;
  name: string;
  category: InventoryCategory;
  totalQuantity: number;
  availableQuantity: number;
  issuedQuantity: number;
  damagedQuantity: number;
  missingQuantity: number;
  description: string;
  isActive: boolean;
}

export const REQUEST_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  ISSUED: "ISSUED",
  RETURNED: "RETURNED",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
} as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[keyof typeof REQUEST_STATUSES];

export interface InventoryRequestItem {
  itemId: string;
  itemName: string;
  requestedQuantity: number;
  approvedQuantity: number;
  issuedQuantity: number;
  returnedQuantity: number;
  damagedQuantity: number;
  missingQuantity: number;
}

export interface InventoryRequest extends Timestamps {
  id: string;
  societyId: string;
  houseId: string;
  houseNumber: string;
  memberId: string;
  memberName: string;
  purpose: string;
  requestDate: string;
  expectedReturnDate: string;
  notes: string;
  status: RequestStatus;
  items: InventoryRequestItem[];
  rejectionReason?: string;
  approvedAt?: string;
  issuedAt?: string;
  returnedAt?: string;
}

export const TRANSACTION_TYPES = {
  ADDED: "ADDED",
  ADJUSTED: "ADJUSTED",
  ISSUED: "ISSUED",
  RETURNED: "RETURNED",
  DAMAGED: "DAMAGED",
  MISSING: "MISSING",
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  requestId?: string;
  houseNumber?: string;
  memberId?: string;
  note: string;
  createdAt: string;
}

export interface InventoryStats {
  totalItems: number;
  totalQuantity: number;
  available: number;
  issued: number;
  damaged: number;
  missing: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  oldValue: string;
  newValue: string;
  reason: string;
}
