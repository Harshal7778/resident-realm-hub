import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { auditService } from "@/services/auditService";
import { eventService } from "@/services/eventService";
import { ensureSeeded } from "@/services/memberService";
import {
  EXPENSE_CATEGORIES,
  type Expense,
  type ExpenseCategory,
  type ServiceResult,
} from "@/types/domain";

const delay = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

function readExpenses(): Expense[] {
  ensureSeeded();
  return readItem<Expense[]>(STORAGE_KEYS.expenses) ?? [];
}

function saveExpenses(next: Expense[]): void {
  writeItem(STORAGE_KEYS.expenses, next);
}

export interface ExpenseInput {
  eventId: string;
  category: ExpenseCategory | string;
  description: string;
  amount: string | number;
  expenseDate: string;
  receipt?: string;
  notes?: string;
}

function validate(input: ExpenseInput): string | null {
  if (!input.category || !EXPENSE_CATEGORIES.includes(input.category as ExpenseCategory)) {
    return "Select an expense category.";
  }
  if (!input.description.trim()) return "Enter a description.";
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return "Amount must be greater than 0.";
  if (!input.expenseDate) return "Select the expense date.";
  return null;
}

export function expenseTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export const expenseService = {
  async listByEvent(eventId: string): Promise<Expense[]> {
    await delay(120);
    return readExpenses()
      .filter((e) => e.eventId === eventId)
      .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
  },

  /** All recorded expenses across every event, newest first. */
  async listAll(): Promise<Expense[]> {
    await delay(120);
    return readExpenses().sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
  },

  async totalForEvent(eventId: string): Promise<number> {
    await delay(60);
    return expenseTotal(readExpenses().filter((e) => e.eventId === eventId));
  },

  async addExpense(input: ExpenseInput): Promise<ServiceResult<Expense>> {
    await delay(200);
    const error = validate(input);
    if (error) return { ok: false, error };

    const event = await eventService.getEventById(input.eventId);
    if (!event) return { ok: false, error: "Event not found." };
    if (eventService.isLocked(event)) {
      return { ok: false, error: "This event is closed. Unlock it to add expenses." };
    }

    const expense: Expense = {
      id: uid("exp"),
      eventId: input.eventId,
      category: input.category as ExpenseCategory,
      description: input.description.trim(),
      amount: Number(input.amount),
      expenseDate: input.expenseDate,
      receipt: input.receipt?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
      createdAt: now(),
      updatedAt: now(),
    };
    saveExpenses([...readExpenses(), expense]);
    auditService.log({
      action: "Expense added",
      entity: `${event.name} · ${expense.description}`,
      entityId: expense.id,
      oldValue: "No expense",
      newValue: `${expense.category} · ₹${expense.amount.toLocaleString("en-IN")}`,
      reason: expense.notes || "Expense entry",
    });
    return { ok: true, data: expense };
  },

  async updateExpense(id: string, input: ExpenseInput): Promise<ServiceResult<Expense>> {
    await delay(200);
    const error = validate(input);
    if (error) return { ok: false, error };

    const existing = readExpenses().find((e) => e.id === id);
    if (!existing) return { ok: false, error: "Expense not found." };

    const event = await eventService.getEventById(existing.eventId);
    if (!event) return { ok: false, error: "Event not found." };
    if (eventService.isLocked(event)) {
      return { ok: false, error: "This event is closed. Unlock it to edit expenses." };
    }

    const updated: Expense = {
      ...existing,
      category: input.category as ExpenseCategory,
      description: input.description.trim(),
      amount: Number(input.amount),
      expenseDate: input.expenseDate,
      receipt: input.receipt?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
      updatedAt: now(),
    };
    saveExpenses(readExpenses().map((e) => (e.id === id ? updated : e)));
    auditService.log({
      action: "Expense updated",
      entity: `${event.name} · ${updated.description}`,
      entityId: updated.id,
      oldValue: `${existing.category} · ₹${existing.amount.toLocaleString("en-IN")}`,
      newValue: `${updated.category} · ₹${updated.amount.toLocaleString("en-IN")}`,
      reason: updated.notes || "Expense updated",
    });
    return { ok: true, data: updated };
  },

  async removeExpense(id: string): Promise<ServiceResult<string>> {
    await delay(160);
    const existing = readExpenses().find((e) => e.id === id);
    if (!existing) return { ok: false, error: "Expense not found." };
    const event = await eventService.getEventById(existing.eventId);
    if (event && eventService.isLocked(event)) {
      return { ok: false, error: "This event is closed. Unlock it to remove expenses." };
    }
    saveExpenses(readExpenses().filter((e) => e.id !== id));
    auditService.log({
      action: "Expense removed",
      entity: `${event?.name ?? "Event"} · ${existing.description}`,
      entityId: existing.id,
      oldValue: `${existing.category} · ₹${existing.amount.toLocaleString("en-IN")}`,
      newValue: "Removed",
      reason: "Expense removed",
    });
    return { ok: true, data: id };
  },
};
