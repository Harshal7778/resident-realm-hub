import { SEED_VERSION, buildSeedHouses, buildSeedMembers, demoSociety } from "@/data/seed";
import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import type { House, Member, Society } from "@/types/domain";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

/** Seeds society/house/member data once. Never wiped on logout. */
export function ensureSeeded(): void {
  const version = readItem<string>(STORAGE_KEYS.seedVersion);
  if (version === SEED_VERSION && readItem<House[]>(STORAGE_KEYS.houses)) return;
  writeItem(STORAGE_KEYS.society, demoSociety);
  writeItem(STORAGE_KEYS.houses, buildSeedHouses());
  writeItem(STORAGE_KEYS.members, buildSeedMembers());
  writeItem(STORAGE_KEYS.seedVersion, SEED_VERSION);
}

function houses(): House[] {
  ensureSeeded();
  return readItem<House[]>(STORAGE_KEYS.houses) ?? [];
}

function members(): Member[] {
  ensureSeeded();
  return readItem<Member[]>(STORAGE_KEYS.members) ?? [];
}

export const memberService = {
  async getSociety(): Promise<Society> {
    ensureSeeded();
    await delay(80);
    return readItem<Society>(STORAGE_KEYS.society) ?? demoSociety;
  },

  async listHouses(): Promise<House[]> {
    await delay();
    return houses();
  },

  async listMembers(): Promise<Member[]> {
    await delay();
    return members();
  },

  async getMemberById(id: string): Promise<Member | null> {
    await delay(80);
    return members().find((m) => m.id === id) ?? null;
  },

  /** Finds an ACTIVE member owning the given mobile number. */
  async findActiveMemberByMobile(mobile: string): Promise<Member | null> {
    await delay(80);
    return (
      members().find(
        (m) => m.isActive && m.mobileNumbers.some((n) => n.isActive && n.number === mobile),
      ) ?? null
    );
  },

  async getHouseById(id: string): Promise<House | null> {
    await delay(60);
    return houses().find((h) => h.id === id) ?? null;
  },

  houseNumberFor(member: Member): string {
    return houses().find((h) => h.id === member.houseId)?.houseNumber ?? "—";
  },

  /** Soft update only — records are never permanently deleted. */
  async setMemberActive(id: string, isActive: boolean): Promise<void> {
    const next = members().map((m) =>
      m.id === id ? { ...m, isActive, updatedAt: new Date().toISOString() } : m,
    );
    writeItem(STORAGE_KEYS.members, next);
    await delay(60);
  },
};
