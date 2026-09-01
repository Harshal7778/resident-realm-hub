import { buildSeedAttendance } from "@/data/seed";
import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { ensureSeeded, memberService } from "@/services/memberService";
import {
  ATTENDANCE_STATUSES,
  type AttendanceRecord,
  type AttendanceStatus,
  type House,
  type Member,
  type ServiceResult,
} from "@/types/domain";

const delay = (ms = 140) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();

function houses(): House[] {
  ensureSeeded();
  return readItem<House[]>(STORAGE_KEYS.houses) ?? [];
}

function members(): Member[] {
  ensureSeeded();
  return readItem<Member[]>(STORAGE_KEYS.members) ?? [];
}

function readAll(): AttendanceRecord[] {
  const existing = readItem<AttendanceRecord[]>(STORAGE_KEYS.attendance);
  if (existing) return existing;
  const seeded = buildSeedAttendance(houses(), members());
  writeItem(STORAGE_KEYS.attendance, seeded);
  return seeded;
}

function saveAll(next: AttendanceRecord[]): void {
  writeItem(STORAGE_KEYS.attendance, next);
}

function blankRecordsFor(meetingId: string): AttendanceRecord[] {
  const all = members();
  return houses().map((house) => {
    const member = all.find((m) => m.houseId === house.id);
    return {
      id: `att-${meetingId}-${house.id}`,
      meetingId,
      houseId: house.id,
      houseNumber: house.houseNumber,
      memberId: member?.id ?? "",
      memberName: member?.name ?? house.ownerName,
      status: ATTENDANCE_STATUSES.ABSENT,
      createdAt: now(),
      updatedAt: now(),
    } satisfies AttendanceRecord;
  });
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  total: number;
}

export const attendanceService = {
  /** Creates one attendance row per house when a meeting has none yet. */
  async ensureRecordsForMeeting(meetingId: string): Promise<AttendanceRecord[]> {
    const all = readAll();
    const existing = all.filter((r) => r.meetingId === meetingId);
    if (existing.length > 0) return existing;
    const created = blankRecordsFor(meetingId);
    saveAll([...all, ...created]);
    return created;
  },

  async listByMeeting(meetingId: string): Promise<AttendanceRecord[]> {
    await delay();
    const rows = await attendanceService.ensureRecordsForMeeting(meetingId);
    return [...rows].sort((a, b) => a.houseNumber.localeCompare(b.houseNumber));
  },

  async listByMember(memberId: string): Promise<AttendanceRecord[]> {
    await delay(100);
    return readAll().filter((r) => r.memberId === memberId);
  },

  summaryFor(records: AttendanceRecord[]): AttendanceSummary {
    const present = records.filter((r) => r.status === ATTENDANCE_STATUSES.PRESENT).length;
    return { present, absent: records.length - present, total: records.length };
  },

  summaryForMeeting(meetingId: string): AttendanceSummary {
    return attendanceService.summaryFor(readAll().filter((r) => r.meetingId === meetingId));
  },

  /** Persists the full attendance sheet for a meeting. */
  async saveAttendance(
    meetingId: string,
    statuses: Record<string, AttendanceStatus>,
  ): Promise<ServiceResult<AttendanceSummary>> {
    await delay(220);
    await attendanceService.ensureRecordsForMeeting(meetingId);
    const next = readAll().map((r) =>
      r.meetingId === meetingId && statuses[r.houseId]
        ? { ...r, status: statuses[r.houseId] as AttendanceStatus, updatedAt: now() }
        : r,
    );
    saveAll(next);
    return {
      ok: true,
      data: attendanceService.summaryFor(next.filter((r) => r.meetingId === meetingId)),
    };
  },

  async houseNumberForMember(memberId: string): Promise<string> {
    const member = await memberService.getMemberById(memberId);
    return member ? memberService.houseNumberFor(member) : "—";
  },
};
