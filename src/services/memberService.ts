import { SEED_VERSION, SOCIETY_ID, buildSeedHouses, buildSeedMembers, demoSociety } from "@/data/seed";
import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { auditService } from "@/services/auditService";
import type { House, Member, MobileNumber, Role, ServiceResult, Society } from "@/types/domain";

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

function saveMembers(next: Member[]): void {
  writeItem(STORAGE_KEYS.members, next);
}

function saveHouses(next: House[]): void {
  writeItem(STORAGE_KEYS.houses, next);
}

const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

const normalizeMobile = (value: string) => value.replace(/\D/g, "");
const isValidMobile = (value: string) => /^[6-9]\d{9}$/.test(normalizeMobile(value));

function updateMember(id: string, fn: (m: Member) => Member): Member | null {
  let updated: Member | null = null;
  const next = members().map((m) => {
    if (m.id !== id) return m;
    updated = { ...fn(m), updatedAt: now() };
    return updated;
  });
  if (updated) saveMembers(next);
  return updated;
}

/** Ensures a house exists for the given number, creating it if needed. */
function ensureHouse(houseNumber: string, ownerName: string): House {
  const value = houseNumber.trim().toUpperCase();
  const existing = houses().find((h) => h.houseNumber.toUpperCase() === value);
  if (existing) return existing;
  const house: House = {
    id: uid("house"),
    societyId: SOCIETY_ID,
    houseNumber: value,
    ownerName,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  };
  saveHouses([...houses(), house]);
  return house;
}

export interface MemberInput {
  name: string;
  houseNumber: string;
  role: Role;
  mobiles: string[];
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

  isValidMobile,

  /** Creates a member (and its house when new). */
  async createMember(input: MemberInput): Promise<ServiceResult<Member>> {
    await delay(200);
    const name = input.name.trim();
    const houseNumber = input.houseNumber.trim();
    if (!name) return { ok: false, error: "Enter the member name." };
    if (!houseNumber) return { ok: false, error: "Enter a house number." };

    const mobiles = input.mobiles.map(normalizeMobile).filter(Boolean);
    if (mobiles.length === 0) return { ok: false, error: "Add at least one mobile number." };
    const invalid = mobiles.find((m) => !isValidMobile(m));
    if (invalid) return { ok: false, error: `${invalid} is not a valid 10-digit mobile number.` };
    const taken = mobiles.find((m) =>
      members().some((mem) => mem.mobileNumbers.some((n) => n.number === m)),
    );
    if (taken) return { ok: false, error: `${taken} is already registered to another member.` };

    const house = ensureHouse(houseNumber, name);
    const member: Member = {
      id: uid("member"),
      societyId: SOCIETY_ID,
      houseId: house.id,
      name,
      isOwner: true,
      isActive: true,
      role: input.role,
      mobileNumbers: mobiles.map((number, i) => ({
        id: uid("mob"),
        number,
        label: i === 0 ? "PRIMARY" : "SECONDARY",
        isActive: true,
      })),
      createdAt: now(),
      updatedAt: now(),
    };
    saveMembers([...members(), member]);
    return { ok: true, data: member };
  },

  /** Updates name, house and role. Mobile numbers are managed separately. */
  async updateMember(
    id: string,
    input: { name: string; houseNumber: string; role: Role },
  ): Promise<ServiceResult<Member>> {
    await delay(180);
    const name = input.name.trim();
    const houseNumber = input.houseNumber.trim();
    if (!name) return { ok: false, error: "Enter the member name." };
    if (!houseNumber) return { ok: false, error: "Enter a house number." };
    const existing = members().find((m) => m.id === id);
    const house = ensureHouse(houseNumber, name);
    const updated = updateMember(id, (m) => ({ ...m, name, role: input.role, houseId: house.id }));
    if (existing && updated && existing.role !== updated.role) {
      auditService.log({
        action: "Role changed",
        entity: updated.name,
        entityId: houseNumberFor(updated),
        oldValue: existing.role,
        newValue: updated.role,
        reason: "Updated member details",
      });
    }
    return updated ? { ok: true, data: updated } : { ok: false, error: "Member not found." };
  },

  async addMobileNumber(id: string, mobile: string): Promise<ServiceResult<Member>> {
    await delay(160);
    const number = normalizeMobile(mobile);
    if (!isValidMobile(number)) return { ok: false, error: "Enter a valid 10-digit mobile number." };
    if (members().some((m) => m.mobileNumbers.some((n) => n.number === number))) {
      return { ok: false, error: "This number is already registered." };
    }
    const updated = updateMember(id, (m) => ({
      ...m,
      mobileNumbers: [
        ...m.mobileNumbers,
        {
          id: uid("mob"),
          number,
          label: m.mobileNumbers.length === 0 ? "PRIMARY" : "SECONDARY",
          isActive: true,
        } satisfies MobileNumber,
      ],
    }));
    return updated ? { ok: true, data: updated } : { ok: false, error: "Member not found." };
  },

  async removeMobileNumber(id: string, mobileId: string): Promise<ServiceResult<Member>> {
    await delay(160);
    const member = members().find((m) => m.id === id);
    if (!member) return { ok: false, error: "Member not found." };
    if (member.mobileNumbers.length <= 1) {
      return { ok: false, error: "A member must keep at least one mobile number." };
    }
    const rest = member.mobileNumbers.filter((n) => n.id !== mobileId);
    if (!rest.some((n) => n.label === "PRIMARY") && rest[0]) rest[0] = { ...rest[0], label: "PRIMARY" };
    const updated = updateMember(id, (m) => ({ ...m, mobileNumbers: rest }));
    return updated ? { ok: true, data: updated } : { ok: false, error: "Member not found." };
  },

  async setPrimaryMobile(id: string, mobileId: string): Promise<ServiceResult<Member>> {
    await delay(140);
    const updated = updateMember(id, (m) => ({
      ...m,
      mobileNumbers: m.mobileNumbers.map((n) => ({
        ...n,
        label: n.id === mobileId ? "PRIMARY" : "SECONDARY",
        isActive: n.id === mobileId ? true : n.isActive,
      })),
    }));
    return updated ? { ok: true, data: updated } : { ok: false, error: "Member not found." };
  },

  /** Soft update only — records are never permanently deleted. */
  async setMemberActive(id: string, isActive: boolean): Promise<ServiceResult<Member>> {
    await delay(160);
    const existing = members().find((m) => m.id === id);
    const updated = updateMember(id, (m) => ({ ...m, isActive }));
    if (existing && updated && existing.isActive !== updated.isActive) {
      auditService.log({
        action: isActive ? "Member reactivated" : "Member deactivated",
        entity: updated.name,
        entityId: houseNumberFor(updated),
        oldValue: isActive ? "Inactive" : "Active",
        newValue: isActive ? "Active" : "Inactive",
        reason: isActive ? "Reactivated by Admin" : "Deactivated by Admin",
      });
    }
    return updated ? { ok: true, data: updated } : { ok: false, error: "Member not found." };
  },
};

function houseNumberFor(member: Member): string {
  return houses().find((house) => house.id === member.houseId)?.houseNumber ?? "—";
}
