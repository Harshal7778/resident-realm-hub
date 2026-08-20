import { DEMO_LOGIN_MOBILES } from "@/data/seed";
import { permissionsForRole } from "@/lib/permissions";
import { STORAGE_KEYS, readItem, removeItem, writeItem } from "@/lib/storage";
import { memberService } from "@/services/memberService";
import type { Member, Role, ServiceResult, Session, User } from "@/types/domain";

const MOCK_OTP = "123456";
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

function toUser(member: Member, mobile: string): User {
  return {
    id: `user-${member.id}`,
    memberId: member.id,
    societyId: member.societyId,
    name: member.name,
    houseNumber: memberService.houseNumberFor(member),
    mobile,
    role: member.role,
    permissions: permissionsForRole(member.role),
  };
}

function persist(session: Session): Session {
  writeItem(STORAGE_KEYS.session, session);
  return session;
}

export const authService = {
  isValidMobile(mobile: string): boolean {
    return /^[6-9]\d{9}$/.test(mobile.trim());
  },

  /** Step 1 — checks the number belongs to an active society member. */
  async requestOtp(mobile: string): Promise<ServiceResult<{ mobile: string }>> {
    await delay();
    const value = mobile.trim();
    if (!authService.isValidMobile(value)) {
      return { ok: false, error: "Enter a valid 10-digit mobile number." };
    }
    const member = await memberService.findActiveMemberByMobile(value);
    if (!member) {
      return { ok: false, error: "This number is not registered with Green Valley Society." };
    }
    return { ok: true, data: { mobile: value } };
  },

  /** Step 2 — verifies the mock OTP and creates a session. */
  async verifyOtp(mobile: string, otp: string): Promise<ServiceResult<Session>> {
    await delay();
    if (otp.length !== 6) return { ok: false, error: "Please enter the 6-digit OTP." };
    if (otp !== MOCK_OTP) return { ok: false, error: "Invalid OTP. Please try again." };
    const member = await memberService.findActiveMemberByMobile(mobile);
    if (!member) return { ok: false, error: "This number is no longer active." };
    return {
      ok: true,
      data: persist({
        user: toUser(member, mobile),
        token: `mock-token-${member.id}`,
        loginMethod: "OTP",
        issuedAt: new Date().toISOString(),
      }),
    };
  },

  /** Prototype shortcut — same session system as OTP login. */
  async demoLogin(role: Role): Promise<ServiceResult<Session>> {
    await delay(300);
    const mobile = DEMO_LOGIN_MOBILES[role];
    const member = await memberService.findActiveMemberByMobile(mobile);
    if (!member) return { ok: false, error: "Demo user unavailable." };
    return {
      ok: true,
      data: persist({
        user: toUser(member, mobile),
        token: `demo-token-${member.id}`,
        loginMethod: "DEMO",
        issuedAt: new Date().toISOString(),
      }),
    };
  },

  getSession(): Session | null {
    return readItem<Session>(STORAGE_KEYS.session);
  },

  async logout(): Promise<void> {
    await delay(150);
    removeItem(STORAGE_KEYS.session); // seeded society data is intentionally kept
  },
};
