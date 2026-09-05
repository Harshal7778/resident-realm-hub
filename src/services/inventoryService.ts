import { SOCIETY_ID } from "@/data/seed";
import { buildSeedInventory } from "@/data/inventorySeed";
import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { ensureSeeded } from "@/services/memberService";
import { notificationService } from "@/services/notificationService";
import {
  NOTIFICATION_TYPES,
  REQUEST_STATUSES,
  TRANSACTION_TYPES,
  type InventoryCategory,
  type InventoryItem,
  type InventoryRequest,
  type InventoryRequestItem,
  type InventoryStats,
  type InventoryTransaction,
  type RequestStatus,
  type ServiceResult,
  type TransactionType,
} from "@/types/domain";

const delay = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

function seedIfNeeded(): void {
  ensureSeeded();
  if (readItem<InventoryItem[]>(STORAGE_KEYS.inventoryItems)) return;
  const { items, requests, transactions } = buildSeedInventory();
  writeItem(STORAGE_KEYS.inventoryItems, items);
  writeItem(STORAGE_KEYS.inventoryRequests, requests);
  writeItem(STORAGE_KEYS.inventoryTransactions, transactions);
}

function readItems(): InventoryItem[] {
  seedIfNeeded();
  return readItem<InventoryItem[]>(STORAGE_KEYS.inventoryItems) ?? [];
}
function saveItems(next: InventoryItem[]): void {
  writeItem(STORAGE_KEYS.inventoryItems, next);
}
function readRequests(): InventoryRequest[] {
  seedIfNeeded();
  return readItem<InventoryRequest[]>(STORAGE_KEYS.inventoryRequests) ?? [];
}
function saveRequests(next: InventoryRequest[]): void {
  writeItem(STORAGE_KEYS.inventoryRequests, next);
}
function readTransactions(): InventoryTransaction[] {
  seedIfNeeded();
  return readItem<InventoryTransaction[]>(STORAGE_KEYS.inventoryTransactions) ?? [];
}
function saveTransactions(next: InventoryTransaction[]): void {
  writeItem(STORAGE_KEYS.inventoryTransactions, next);
}

function addTransaction(entry: {
  item: InventoryItem;
  type: TransactionType;
  quantity: number;
  note: string;
  requestId?: string;
  houseNumber?: string;
  memberId?: string;
}): InventoryTransaction {
  const tx: InventoryTransaction = {
    id: uid("invtx"),
    itemId: entry.item.id,
    itemName: entry.item.name,
    type: entry.type,
    quantity: entry.quantity,
    note: entry.note,
    createdAt: now(),
    ...(entry.requestId ? { requestId: entry.requestId } : {}),
    ...(entry.houseNumber ? { houseNumber: entry.houseNumber } : {}),
    ...(entry.memberId ? { memberId: entry.memberId } : {}),
  };
  saveTransactions([...readTransactions(), tx]);
  return tx;
}

export interface InventoryItemInput {
  name: string;
  category: InventoryCategory;
  totalQuantity: string;
  description: string;
}

export interface RequestLineInput {
  itemId: string;
  quantity: number;
}

export interface RequestInput {
  houseId: string;
  houseNumber: string;
  memberId: string;
  memberName: string;
  purpose: string;
  expectedReturnDate: string;
  notes: string;
  lines: RequestLineInput[];
}

export interface ApprovalLine {
  itemId: string;
  approvedQuantity: number;
}

export interface ReturnLine {
  itemId: string;
  returnedQuantity: number;
  damagedQuantity: number;
  missingQuantity: number;
}

const NOT_ENOUGH = "Not enough stock available.";

export const inventoryService = {
  async listItems(filter?: { search?: string; category?: string }): Promise<InventoryItem[]> {
    await delay();
    const q = (filter?.search ?? "").trim().toLowerCase();
    return readItems()
      .filter((i) => i.isActive)
      .filter((i) => (filter?.category && filter.category !== "ALL" ? i.category === filter.category : true))
      .filter((i) => (q ? i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getItemById(id: string): Promise<InventoryItem | null> {
    await delay(80);
    return readItems().find((i) => i.id === id) ?? null;
  },

  async stats(): Promise<InventoryStats> {
    await delay(80);
    const items = readItems().filter((i) => i.isActive);
    return {
      totalItems: items.length,
      totalQuantity: items.reduce((s, i) => s + i.totalQuantity, 0),
      available: items.reduce((s, i) => s + i.availableQuantity, 0),
      issued: items.reduce((s, i) => s + i.issuedQuantity, 0),
      damaged: items.reduce((s, i) => s + i.damagedQuantity, 0),
      missing: items.reduce((s, i) => s + i.missingQuantity, 0),
    };
  },

  async createItem(input: InventoryItemInput): Promise<ServiceResult<InventoryItem>> {
    await delay(200);
    const total = Number(input.totalQuantity);
    if (!input.name.trim()) return { ok: false, error: "Enter the item name." };
    if (!Number.isFinite(total) || total < 0) return { ok: false, error: "Total quantity must be 0 or more." };

    const item: InventoryItem = {
      id: uid("inv"),
      societyId: SOCIETY_ID,
      name: input.name.trim(),
      category: input.category,
      totalQuantity: Math.round(total),
      availableQuantity: Math.round(total),
      issuedQuantity: 0,
      damagedQuantity: 0,
      missingQuantity: 0,
      description: input.description.trim(),
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    saveItems([...readItems(), item]);
    addTransaction({ item, type: TRANSACTION_TYPES.ADDED, quantity: item.totalQuantity, note: "Item added to inventory." });
    return { ok: true, data: item };
  },

  /** Edits item details; a changed total adjusts available stock and logs the change. */
  async updateItem(id: string, input: InventoryItemInput): Promise<ServiceResult<InventoryItem>> {
    await delay(200);
    const total = Number(input.totalQuantity);
    if (!input.name.trim()) return { ok: false, error: "Enter the item name." };
    if (!Number.isFinite(total) || total < 0) return { ok: false, error: "Total quantity must be 0 or more." };

    const existing = readItems().find((i) => i.id === id);
    if (!existing) return { ok: false, error: "Item not found." };

    const diff = Math.round(total) - existing.totalQuantity;
    if (existing.availableQuantity + diff < 0) return { ok: false, error: NOT_ENOUGH };

    const updated: InventoryItem = {
      ...existing,
      name: input.name.trim(),
      category: input.category,
      description: input.description.trim(),
      totalQuantity: Math.round(total),
      availableQuantity: existing.availableQuantity + diff,
      updatedAt: now(),
    };
    saveItems(readItems().map((i) => (i.id === id ? updated : i)));
    if (diff !== 0) {
      addTransaction({
        item: updated,
        type: diff > 0 ? TRANSACTION_TYPES.ADDED : TRANSACTION_TYPES.ADJUSTED,
        quantity: Math.abs(diff),
        note: diff > 0 ? "Stock added by committee." : "Stock reduced by committee.",
      });
    }
    return { ok: true, data: updated };
  },

  async listTransactions(filter?: { itemId?: string; memberId?: string }): Promise<InventoryTransaction[]> {
    await delay(80);
    return readTransactions()
      .filter((t) => (filter?.itemId ? t.itemId === filter.itemId : true))
      .filter((t) => (filter?.memberId ? t.memberId === filter.memberId : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listRequests(filter?: { memberId?: string; status?: RequestStatus | "ALL" }): Promise<InventoryRequest[]> {
    await delay();
    return readRequests()
      .filter((r) => (filter?.memberId ? r.memberId === filter.memberId : true))
      .filter((r) => (filter?.status && filter.status !== "ALL" ? r.status === filter.status : true))
      .sort((a, b) => b.requestDate.localeCompare(a.requestDate));
  },

  async getRequestById(id: string): Promise<InventoryRequest | null> {
    await delay(80);
    return readRequests().find((r) => r.id === id) ?? null;
  },

  async createRequest(input: RequestInput): Promise<ServiceResult<InventoryRequest>> {
    await delay(220);
    if (!input.purpose.trim()) return { ok: false, error: "Enter the purpose of the request." };
    if (!input.expectedReturnDate) return { ok: false, error: "Select an expected return date." };
    const lines = input.lines.filter((l) => l.quantity > 0);
    if (lines.length === 0) return { ok: false, error: "Add at least one item with a quantity." };

    const items = readItems();
    for (const line of lines) {
      const item = items.find((i) => i.id === line.itemId);
      if (!item) return { ok: false, error: "Selected item is no longer available." };
      if (line.quantity > item.availableQuantity) {
        return { ok: false, error: `${NOT_ENOUGH} ${item.name} has only ${item.availableQuantity} left.` };
      }
    }

    const request: InventoryRequest = {
      id: uid("invreq"),
      societyId: SOCIETY_ID,
      houseId: input.houseId,
      houseNumber: input.houseNumber,
      memberId: input.memberId,
      memberName: input.memberName,
      purpose: input.purpose.trim(),
      requestDate: now().slice(0, 10),
      expectedReturnDate: input.expectedReturnDate,
      notes: input.notes.trim(),
      status: REQUEST_STATUSES.PENDING,
      items: lines.map((line) => {
        const item = items.find((i) => i.id === line.itemId)!;
        return {
          itemId: item.id,
          itemName: item.name,
          requestedQuantity: line.quantity,
          approvedQuantity: 0,
          issuedQuantity: 0,
          returnedQuantity: 0,
          damagedQuantity: 0,
          missingQuantity: 0,
        } satisfies InventoryRequestItem;
      }),
      createdAt: now(),
      updatedAt: now(),
    };
    saveRequests([...readRequests(), request]);
    return { ok: true, data: request };
  },

  /** Sets approved quantities after validating against available stock. */
  async approveRequest(id: string, approvals: ApprovalLine[]): Promise<ServiceResult<InventoryRequest>> {
    await delay(220);
    const request = readRequests().find((r) => r.id === id);
    if (!request) return { ok: false, error: "Request not found." };
    if (request.status !== REQUEST_STATUSES.PENDING) {
      return { ok: false, error: "Only pending requests can be approved." };
    }

    const items = readItems();
    let approvedTotal = 0;
    for (const line of request.items) {
      const approved = approvals.find((a) => a.itemId === line.itemId)?.approvedQuantity ?? 0;
      if (approved < 0) return { ok: false, error: "Approved quantity cannot be negative." };
      if (approved > line.requestedQuantity) {
        return { ok: false, error: `Approved quantity cannot exceed the requested ${line.requestedQuantity}.` };
      }
      const item = items.find((i) => i.id === line.itemId);
      if (approved > (item?.availableQuantity ?? 0)) {
        return { ok: false, error: `${NOT_ENOUGH} ${line.itemName} has only ${item?.availableQuantity ?? 0} left.` };
      }
      approvedTotal += approved;
    }
    if (approvedTotal === 0) return { ok: false, error: "Approve at least one item, or reject the request." };

    const updated: InventoryRequest = {
      ...request,
      status: REQUEST_STATUSES.APPROVED,
      approvedAt: now(),
      updatedAt: now(),
      items: request.items.map((line) => ({
        ...line,
        approvedQuantity: approvals.find((a) => a.itemId === line.itemId)?.approvedQuantity ?? 0,
      })),
    };
    saveRequests(readRequests().map((r) => (r.id === id ? updated : r)));
    await notificationService.notify({
      type: NOTIFICATION_TYPES.INVENTORY_APPROVED,
      title: "Inventory request approved",
      message: `Your request for ${updated.purpose} has been approved. Please collect the items.`,
      link: "/inventory/requests",
      userIds: [updated.memberId],
    });
    return { ok: true, data: updated };
  },

  async rejectRequest(id: string, reason: string): Promise<ServiceResult<InventoryRequest>> {
    await delay(200);
    if (!reason.trim()) return { ok: false, error: "Enter a reason for rejecting this request." };
    const request = readRequests().find((r) => r.id === id);
    if (!request) return { ok: false, error: "Request not found." };
    if (request.status !== REQUEST_STATUSES.PENDING) {
      return { ok: false, error: "Only pending requests can be rejected." };
    }
    const updated: InventoryRequest = {
      ...request,
      status: REQUEST_STATUSES.REJECTED,
      rejectionReason: reason.trim(),
      updatedAt: now(),
    };
    saveRequests(readRequests().map((r) => (r.id === id ? updated : r)));
    await notificationService.notify({
      type: NOTIFICATION_TYPES.INVENTORY_APPROVED,
      title: "Inventory request rejected",
      message: `Your request for ${updated.purpose} was rejected. Reason: ${updated.rejectionReason}`,
      link: "/inventory/requests",
      userIds: [updated.memberId],
    });
    return { ok: true, data: updated };
  },

  /** Issues approved quantities: available decreases, issued increases. */
  async issueRequest(id: string): Promise<ServiceResult<InventoryRequest>> {
    await delay(240);
    const request = readRequests().find((r) => r.id === id);
    if (!request) return { ok: false, error: "Request not found." };
    if (request.status !== REQUEST_STATUSES.APPROVED) {
      return { ok: false, error: "Only approved requests can be issued." };
    }

    const items = readItems();
    for (const line of request.items) {
      const item = items.find((i) => i.id === line.itemId);
      if (!item) return { ok: false, error: `${line.itemName} is no longer in inventory.` };
      if (line.approvedQuantity > item.availableQuantity) {
        return { ok: false, error: `${NOT_ENOUGH} ${item.name} has only ${item.availableQuantity} left.` };
      }
    }

    const nextItems = items.map((item) => {
      const line = request.items.find((l) => l.itemId === item.id);
      if (!line || line.approvedQuantity <= 0) return item;
      return {
        ...item,
        availableQuantity: item.availableQuantity - line.approvedQuantity,
        issuedQuantity: item.issuedQuantity + line.approvedQuantity,
        updatedAt: now(),
      };
    });
    saveItems(nextItems);

    for (const line of request.items) {
      if (line.approvedQuantity <= 0) continue;
      const item = nextItems.find((i) => i.id === line.itemId)!;
      addTransaction({
        item,
        type: TRANSACTION_TYPES.ISSUED,
        quantity: line.approvedQuantity,
        note: `Issued to ${request.houseNumber} for ${request.purpose}.`,
        requestId: request.id,
        houseNumber: request.houseNumber,
        memberId: request.memberId,
      });
    }

    const updated: InventoryRequest = {
      ...request,
      status: REQUEST_STATUSES.ISSUED,
      issuedAt: now(),
      updatedAt: now(),
      items: request.items.map((line) => ({ ...line, issuedQuantity: line.approvedQuantity })),
    };
    saveRequests(readRequests().map((r) => (r.id === id ? updated : r)));
    await notificationService.notify({
      type: NOTIFICATION_TYPES.INVENTORY_ISSUED,
      title: "Inventory issued",
      message: `Items for ${updated.purpose} have been issued. Please return them by ${updated.expectedReturnDate}.`,
      link: "/inventory/requests",
      userIds: [updated.memberId],
    });
    return { ok: true, data: updated };
  },

  /**
   * Records a return. Returned + Damaged + Missing must equal Issued for every line.
   * Available increases by returned, damaged/missing counters increase, issued decreases.
   */
  async recordReturn(id: string, returns: ReturnLine[]): Promise<ServiceResult<InventoryRequest>> {
    await delay(240);
    const request = readRequests().find((r) => r.id === id);
    if (!request) return { ok: false, error: "Request not found." };
    if (request.status !== REQUEST_STATUSES.ISSUED && request.status !== REQUEST_STATUSES.RETURNED) {
      return { ok: false, error: "Only issued requests can be returned." };
    }

    for (const line of request.items) {
      if (line.issuedQuantity <= 0) continue;
      const entry = returns.find((r) => r.itemId === line.itemId);
      const returned = entry?.returnedQuantity ?? 0;
      const damaged = entry?.damagedQuantity ?? 0;
      const missing = entry?.missingQuantity ?? 0;
      if (returned < 0 || damaged < 0 || missing < 0) {
        return { ok: false, error: "Quantities cannot be negative." };
      }
      if (returned + damaged + missing !== line.issuedQuantity) {
        return {
          ok: false,
          error: `${line.itemName}: returned + damaged + missing must equal ${line.issuedQuantity}.`,
        };
      }
    }

    const items = readItems();
    const nextItems = items.map((item) => {
      const line = request.items.find((l) => l.itemId === item.id);
      const entry = returns.find((r) => r.itemId === item.id);
      if (!line || !entry || line.issuedQuantity <= 0) return item;
      return {
        ...item,
        availableQuantity: item.availableQuantity + entry.returnedQuantity,
        issuedQuantity: Math.max(0, item.issuedQuantity - line.issuedQuantity),
        damagedQuantity: item.damagedQuantity + entry.damagedQuantity,
        missingQuantity: item.missingQuantity + entry.missingQuantity,
        updatedAt: now(),
      };
    });
    saveItems(nextItems);

    for (const line of request.items) {
      const entry = returns.find((r) => r.itemId === line.itemId);
      if (!entry || line.issuedQuantity <= 0) continue;
      const item = nextItems.find((i) => i.id === line.itemId)!;
      const base = {
        requestId: request.id,
        houseNumber: request.houseNumber,
        memberId: request.memberId,
      };
      if (entry.returnedQuantity > 0) {
        addTransaction({ item, type: TRANSACTION_TYPES.RETURNED, quantity: entry.returnedQuantity, note: `Returned by ${request.houseNumber}.`, ...base });
      }
      if (entry.damagedQuantity > 0) {
        addTransaction({ item, type: TRANSACTION_TYPES.DAMAGED, quantity: entry.damagedQuantity, note: `Reported damaged by ${request.houseNumber}.`, ...base });
      }
      if (entry.missingQuantity > 0) {
        addTransaction({ item, type: TRANSACTION_TYPES.MISSING, quantity: entry.missingQuantity, note: `Reported missing by ${request.houseNumber}.`, ...base });
      }
    }

    const updated: InventoryRequest = {
      ...request,
      status: REQUEST_STATUSES.COMPLETED,
      returnedAt: now(),
      updatedAt: now(),
      items: request.items.map((line) => {
        const entry = returns.find((r) => r.itemId === line.itemId);
        return {
          ...line,
          returnedQuantity: entry?.returnedQuantity ?? 0,
          damagedQuantity: entry?.damagedQuantity ?? 0,
          missingQuantity: entry?.missingQuantity ?? 0,
        };
      }),
    };
    saveRequests(readRequests().map((r) => (r.id === id ? updated : r)));
    return { ok: true, data: updated };
  },
};

export const REQUEST_STATUS_TONE: Record<RequestStatus, "success" | "warning" | "danger" | "neutral" | "info"> = {
  PENDING: "warning",
  APPROVED: "info",
  ISSUED: "info",
  RETURNED: "neutral",
  COMPLETED: "success",
  REJECTED: "danger",
};
