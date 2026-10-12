import { ROLE_LABEL } from "@/lib/permissions";
import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { auditService } from "@/services/auditService";
import { authService } from "@/services/authService";
import { memberService } from "@/services/memberService";
import { ROLES, type Member, type Role, type ServiceResult, type Session } from "@/types/domain";

export const USERS_EVENT = "sm:users-changed";

export interface AppUser {
  id: string;
  name: string;
  houseNumber: string;
  mobile: string;
  role: Role;
  isActive: boolean;
}

function toUser(member: Member): AppUser {
  const primary =
    member.mobileNumbers.find((m) => m.label === "PRIMARY" && m.isActive) ??
    member.mobileNumbers[0];
  return {
    id: member.id,
    name: member.name,
    houseNumber: memberService.houseNumberFor(member),
    mobile: primary?.number ?? "",
    role: member.role,
    isActive: member.isActive,
  };
}

export const userService = {
  /** Committee first, then everyone else. */
  async listUsers(filter?: { search?: string; role?: Role | "ALL" }): Promise<AppUser[]> {
    const members = await memberService.listMembers();
    const order: Role[] = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER, ROLES.MEMBER];
    let users = members.map(toUser).sort((a, b) => {
      const diff = order.indexOf(a.role) - order.indexOf(b.role);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
    const search = filter?.search?.trim().toLowerCase();
    if (search) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.houseNumber.toLowerCase().includes(search) ||
          u.mobile.includes(search),
      );
    }
    if (filter?.role && filter.role !== "ALL") users = users.filter((u) => u.role === filter.role);
    return users;
  },

  async getUser(id: string): Promise<AppUser | null> {
    const member = await memberService.getMemberById(id);
    return member ? toUser(member) : null;
  },

  /** Assigns a new role, records it in the audit log and refreshes the session if needed. */
  async changeRole(id: string, role: Role, reason = ""): Promise<ServiceResult<AppUser>> {
    await new Promise((r) => setTimeout(r, 200));
    const member = await memberService.getMemberById(id);
    if (!member) return { ok: false, error: "User not found." };
    if (member.role === role) return { ok: true, data: toUser(member) };

    const previous = member.role;
    const members = readItem<Member[]>(STORAGE_KEYS.members) ?? [];
    if (previous === ROLES.ADMIN && role !== ROLES.ADMIN && members.filter((m) => m.isActive && m.role === ROLES.ADMIN).length <= 1) {
      return { ok: false, error: "At least one active Admin must remain." };
    }
    const next = members.map((m) =>
      m.id === id ? { ...m, role, updatedAt: new Date().toISOString() } : m,
    );
    writeItem(STORAGE_KEYS.members, next);

    auditService.log({
      action: "Role changed",
      entity: member.name,
      entityId: memberService.houseNumberFor(member),
      oldValue: ROLE_LABEL[previous],
      newValue: ROLE_LABEL[role],
      reason,
    });

    // Keep the active session in step when the signed-in user's role changes.
    const session = authService.getSession();
    if (session && session.user.memberId === id) {
      const updated: Session = { ...session, user: { ...session.user, role } };
      writeItem(STORAGE_KEYS.session, updated);
    }

    if (typeof window !== "undefined") window.dispatchEvent(new Event(USERS_EVENT));
    const saved = next.find((m) => m.id === id)!;
    return { ok: true, data: toUser(saved) };
  },

  async setActive(id: string, isActive: boolean, reason = ""): Promise<ServiceResult<AppUser>> {
    const member = await memberService.getMemberById(id);
    if (!member) return { ok: false, error: "User not found." };
    const members = readItem<Member[]>(STORAGE_KEYS.members) ?? [];
    if (!isActive && member.role === ROLES.ADMIN && members.filter((m) => m.isActive && m.role === ROLES.ADMIN).length <= 1) {
      return { ok: false, error: "At least one active Admin must remain." };
    }
    const res = await memberService.setMemberActive(id, isActive);
    if (!res.ok || !res.data) return { ok: false, error: res.error ?? "Could not update user." };
    if (typeof window !== "undefined") window.dispatchEvent(new Event(USERS_EVENT));
    return { ok: true, data: toUser(res.data) };
  },
};
