import { SOCIETY_ID, buildSeedEvents } from "@/data/seed";
import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import {
  buildContributionsForEvent,
  readContributions,
  saveContributions,
} from "@/services/contributionService";
import { ensureSeeded, memberService } from "@/services/memberService";
import {
  EVENT_STATUSES,
  type ServiceResult,
  type SocietyEvent,
} from "@/types/domain";

const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

function readEvents(): SocietyEvent[] {
  ensureSeeded();
  return readItem<SocietyEvent[]>(STORAGE_KEYS.events) ?? [];
}

function saveEvents(next: SocietyEvent[]): void {
  writeItem(STORAGE_KEYS.events, next);
}

/** Creates demo events and their contribution records once. */
async function ensureEventsSeeded(): Promise<void> {
  if (readItem<SocietyEvent[]>(STORAGE_KEYS.events)) return;
  const events = buildSeedEvents();
  saveEvents(events);
  const [houses, members] = await Promise.all([
    memberService.listHouses(),
    memberService.listMembers(),
  ]);
  const contributions = events.flatMap((event) =>
    buildContributionsForEvent(event.id, event.standardContribution, houses, members),
  );
  saveContributions(contributions);
  writeItem(STORAGE_KEYS.payments, readItem(STORAGE_KEYS.payments) ?? []);
}

export interface EventInput {
  name: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  standardContribution: string | number;
}

function validate(input: EventInput): string | null {
  if (!input.name.trim()) return "Enter the event name.";
  if (!input.type.trim()) return "Select an event type.";
  if (!input.description.trim()) return "Enter a short description.";
  if (!input.startDate) return "Select a start date.";
  if (!input.endDate) return "Select an end date.";
  if (input.endDate < input.startDate) return "End date cannot be before the start date.";
  const amount = Number(input.standardContribution);
  if (!Number.isFinite(amount) || amount <= 0) return "Enter a standard contribution amount.";
  return null;
}

export const eventService = {
  async listEvents(): Promise<SocietyEvent[]> {
    await ensureEventsSeeded();
    await delay();
    return readEvents().sort((a, b) => b.startDate.localeCompare(a.startDate));
  },

  async getEventById(id: string): Promise<SocietyEvent | null> {
    await ensureEventsSeeded();
    await delay(80);
    return readEvents().find((e) => e.id === id) ?? null;
  },

  /** Creates the event and one contribution record per active house. */
  async createEvent(input: EventInput): Promise<ServiceResult<SocietyEvent>> {
    await ensureEventsSeeded();
    await delay(220);
    const error = validate(input);
    if (error) return { ok: false, error };

    const event: SocietyEvent = {
      id: uid("event"),
      societyId: SOCIETY_ID,
      name: input.name.trim(),
      type: input.type.trim(),
      description: input.description.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      standardContribution: Number(input.standardContribution),
      status: EVENT_STATUSES.ACTIVE,
      createdAt: now(),
      updatedAt: now(),
    };
    saveEvents([...readEvents(), event]);

    const [houses, members] = await Promise.all([
      memberService.listHouses(),
      memberService.listMembers(),
    ]);
    saveContributions([
      ...readContributions(),
      ...buildContributionsForEvent(event.id, event.standardContribution, houses, members),
    ]);

    return { ok: true, data: event };
  },

  isLocked(event: SocietyEvent): boolean {
    return event.status === EVENT_STATUSES.CLOSED;
  },

  async closeEvent(id: string): Promise<ServiceResult<SocietyEvent>> {
    await delay(160);
    const event = readEvents().find((e) => e.id === id);
    if (!event) return { ok: false, error: "Event not found." };
    if (event.status !== EVENT_STATUSES.ACTIVE) {
      return { ok: false, error: "Only an active event can be closed." };
    }
    const updated: SocietyEvent = {
      ...event,
      status: EVENT_STATUSES.CLOSED,
      closedAt: now(),
      updatedAt: now(),
    };
    saveEvents(readEvents().map((e) => (e.id === id ? updated : e)));
    return { ok: true, data: updated };
  },

  async unlockEvent(id: string, reason: string): Promise<ServiceResult<SocietyEvent>> {
    await delay(160);
    const value = reason.trim();
    if (value.length < 4) return { ok: false, error: "Enter a reason for unlocking this event." };
    const event = readEvents().find((e) => e.id === id);
    if (!event) return { ok: false, error: "Event not found." };
    if (event.status !== EVENT_STATUSES.CLOSED) {
      return { ok: false, error: "Only a closed event can be unlocked." };
    }
    const updated: SocietyEvent = {
      ...event,
      status: EVENT_STATUSES.ACTIVE,
      unlockReason: value,
      unlockedAt: now(),
      updatedAt: now(),
    };
    saveEvents(readEvents().map((e) => (e.id === id ? updated : e)));
    return { ok: true, data: updated };
  },
};
