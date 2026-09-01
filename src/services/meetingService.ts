import { SOCIETY_ID, buildSeedMeetings } from "@/data/seed";
import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { attendanceService } from "@/services/attendanceService";
import { ensureSeeded } from "@/services/memberService";
import { notificationService } from "@/services/notificationService";
import { NOTIFICATION_TYPES, type Meeting, type ServiceResult } from "@/types/domain";

const delay = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

function readMeetings(): Meeting[] {
  ensureSeeded();
  const existing = readItem<Meeting[]>(STORAGE_KEYS.meetings);
  if (existing) return existing;
  const seeded = buildSeedMeetings();
  writeItem(STORAGE_KEYS.meetings, seeded);
  return seeded;
}

function saveMeetings(next: Meeting[]): void {
  writeItem(STORAGE_KEYS.meetings, next);
}

export interface MeetingInput {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

function validate(input: MeetingInput): string | null {
  if (!input.title.trim()) return "Enter the meeting title.";
  if (!input.date) return "Select a meeting date.";
  if (!input.time) return "Select a meeting time.";
  if (!input.location.trim()) return "Enter the meeting location.";
  return null;
}

export const meetingService = {
  async listMeetings(): Promise<Meeting[]> {
    await delay();
    return readMeetings().sort((a, b) => b.date.localeCompare(a.date));
  },

  async getMeetingById(id: string): Promise<Meeting | null> {
    await delay(80);
    return readMeetings().find((m) => m.id === id) ?? null;
  },

  async createMeeting(input: MeetingInput): Promise<ServiceResult<Meeting>> {
    await delay(200);
    const error = validate(input);
    if (error) return { ok: false, error };

    const meeting: Meeting = {
      id: uid("meeting"),
      societyId: SOCIETY_ID,
      title: input.title.trim(),
      date: input.date,
      time: input.time,
      location: input.location.trim(),
      description: input.description.trim(),
      createdAt: now(),
      updatedAt: now(),
    };
    saveMeetings([...readMeetings(), meeting]);
    await attendanceService.ensureRecordsForMeeting(meeting.id);
    await notificationService.notify({
      type: NOTIFICATION_TYPES.MEETING_REMINDER,
      title: meeting.title,
      message: `Meeting on ${meeting.date} at ${meeting.time}, ${meeting.location}.`,
      link: "/meetings",
    });

    return { ok: true, data: meeting };
  },

  async updateMeeting(id: string, input: MeetingInput): Promise<ServiceResult<Meeting>> {
    await delay(180);
    const error = validate(input);
    if (error) return { ok: false, error };
    const existing = readMeetings().find((m) => m.id === id);
    if (!existing) return { ok: false, error: "Meeting not found." };
    const updated: Meeting = {
      ...existing,
      title: input.title.trim(),
      date: input.date,
      time: input.time,
      location: input.location.trim(),
      description: input.description.trim(),
      updatedAt: now(),
    };
    saveMeetings(readMeetings().map((m) => (m.id === id ? updated : m)));
    return { ok: true, data: updated };
  },
};
