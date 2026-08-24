import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { ensureSeeded } from "@/services/memberService";
import {
  CONTRIBUTION_STATUSES,
  type Contribution,
  type ContributionStatus,
  type EventTotals,
  type House,
  type Member,
  type ServiceResult,
} from "@/types/domain";

const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

/** Derives the required-contribution status. Extra payments never affect it. */
export function statusFor(requiredAmount: number, regularPaid: number): ContributionStatus {
  if (regularPaid <= 0) return CONTRIBUTION_STATUSES.PENDING;
  if (regularPaid >= requiredAmount) return CONTRIBUTION_STATUSES.PAID;
  return CONTRIBUTION_STATUSES.PARTIAL;
}

export function totalsFor(contributions: Contribution[], expenses = 0): EventTotals {
  const expected = contributions.reduce((sum, c) => sum + c.requiredAmount, 0);
  const collected = contributions.reduce((sum, c) => sum + c.regularPaid, 0);
  const extra = contributions.reduce((sum, c) => sum + c.extraPaid, 0);
  return {
    expected,
    collected,
    extra,
    pending: Math.max(expected - collected, 0),
    expenses,
    balance: collected + extra - expenses,
  };
}

export function readContributions(): Contribution[] {
  ensureSeeded();
  return readItem<Contribution[]>(STORAGE_KEYS.contributions) ?? [];
}

export function saveContributions(next: Contribution[]): void {
  writeItem(STORAGE_KEYS.contributions, next);
}

/** Builds one contribution record per active house. */
export function buildContributionsForEvent(
  eventId: string,
  requiredAmount: number,
  houses: House[],
  members: Member[],
): Contribution[] {
  return houses
    .filter((h) => h.isActive)
    .map((house) => {
      const member = members.find((m) => m.houseId === house.id && m.isActive);
      return {
        id: uid("contrib"),
        eventId,
        houseId: house.id,
        houseNumber: house.houseNumber,
        memberId: member?.id ?? "",
        memberName: member?.name ?? house.ownerName,
        requiredAmount,
        regularPaid: 0,
        extraPaid: 0,
        status: statusFor(requiredAmount, 0),
        createdAt: now(),
        updatedAt: now(),
      } satisfies Contribution;
    })
    .sort((a, b) => a.houseNumber.localeCompare(b.houseNumber));
}

export const contributionService = {
  async listByEvent(eventId: string): Promise<Contribution[]> {
    await delay();
    return readContributions()
      .filter((c) => c.eventId === eventId)
      .sort((a, b) => a.houseNumber.localeCompare(b.houseNumber));
  },

  async getById(id: string): Promise<Contribution | null> {
    await delay(60);
    return readContributions().find((c) => c.id === id) ?? null;
  },

  async listByHouse(houseId: string): Promise<Contribution[]> {
    await delay(80);
    return readContributions().filter((c) => c.houseId === houseId);
  },

  async totals(eventId: string, expenses = 0): Promise<EventTotals> {
    await delay(60);
    return totalsFor(
      readContributions().filter((c) => c.eventId === eventId),
      expenses,
    );
  },

  /** Adjusts a single required amount (event must be unlocked — checked by caller). */
  async setRequiredAmount(id: string, requiredAmount: number): Promise<ServiceResult<Contribution>> {
    await delay(120);
    if (!Number.isFinite(requiredAmount) || requiredAmount < 0) {
      return { ok: false, error: "Enter a valid required amount." };
    }
    let updated: Contribution | null = null;
    const next = readContributions().map((c) => {
      if (c.id !== id) return c;
      updated = {
        ...c,
        requiredAmount,
        status: statusFor(requiredAmount, c.regularPaid),
        updatedAt: now(),
      };
      return updated;
    });
    if (!updated) return { ok: false, error: "Contribution not found." };
    saveContributions(next);
    return { ok: true, data: updated };
  },
};
