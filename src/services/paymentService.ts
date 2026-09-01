import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { readContributions, saveContributions, statusFor } from "@/services/contributionService";
import { eventService } from "@/services/eventService";
import { ensureSeeded } from "@/services/memberService";
import { notificationService } from "@/services/notificationService";
import {
  NOTIFICATION_TYPES,
  PAYMENT_TYPES,
  type Contribution,
  type Payment,
  type PaymentType,
  type ServiceResult,
} from "@/types/domain";

const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

function readPayments(): Payment[] {
  ensureSeeded();
  return readItem<Payment[]>(STORAGE_KEYS.payments) ?? [];
}

function savePayments(next: Payment[]): void {
  writeItem(STORAGE_KEYS.payments, next);
}

export interface PaymentInput {
  eventId: string;
  contributionId: string;
  amount: string | number;
  type: PaymentType;
  paidAt: string;
  note?: string;
}

export const paymentService = {
  async listByEvent(eventId: string): Promise<Payment[]> {
    await delay(120);
    return readPayments()
      .filter((p) => p.eventId === eventId)
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  },

  async listByContribution(contributionId: string): Promise<Payment[]> {
    await delay(80);
    return readPayments()
      .filter((p) => p.contributionId === contributionId)
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  },

  async listByHouse(houseId: string): Promise<Payment[]> {
    await delay(80);
    return readPayments().filter((p) => p.houseId === houseId);
  },

  /** Records a manual cash payment and recalculates the contribution status. */
  async recordPayment(input: PaymentInput): Promise<ServiceResult<Contribution>> {
    await delay(220);
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter a valid amount." };
    if (!input.paidAt) return { ok: false, error: "Select a payment date." };

    const event = await eventService.getEventById(input.eventId);
    if (!event) return { ok: false, error: "Event not found." };
    if (eventService.isLocked(event)) {
      return { ok: false, error: "This event is closed. Unlock it to record payments." };
    }

    const contribution = readContributions().find((c) => c.id === input.contributionId);
    if (!contribution) return { ok: false, error: "Select a house." };

    const isExtra = input.type === PAYMENT_TYPES.EXTRA;
    const updated: Contribution = {
      ...contribution,
      regularPaid: isExtra ? contribution.regularPaid : contribution.regularPaid + amount,
      extraPaid: isExtra ? contribution.extraPaid + amount : contribution.extraPaid,
      updatedAt: now(),
    };
    updated.status = statusFor(updated.requiredAmount, updated.regularPaid);

    saveContributions(readContributions().map((c) => (c.id === updated.id ? updated : c)));
    savePayments([
      ...readPayments(),
      {
        id: uid("pay"),
        eventId: input.eventId,
        contributionId: contribution.id,
        houseId: contribution.houseId,
        houseNumber: contribution.houseNumber,
        amount,
        type: input.type,
        paidAt: input.paidAt,
        note: input.note?.trim() ?? "",
        createdAt: now(),
        updatedAt: now(),
      },
    ]);

    await notificationService.notify({
      type: NOTIFICATION_TYPES.PAYMENT_RECORDED,
      title: "Payment recorded",
      message: `₹${amount.toLocaleString("en-IN")} ${input.type.toLowerCase()} payment recorded for ${contribution.houseNumber} (${event.name}).`,
      link: "/events",
      ...(contribution.memberId ? { userIds: [contribution.memberId] } : {}),
    });

    return { ok: true, data: updated };
  },
};
