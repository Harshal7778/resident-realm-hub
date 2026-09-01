import { SOCIETY_ID, buildSeedNotices } from "@/data/seed";
import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { ensureSeeded } from "@/services/memberService";
import { notificationService } from "@/services/notificationService";
import {
  NOTICE_PRIORITIES,
  NOTICE_STATUSES,
  NOTIFICATION_TYPES,
  type Notice,
  type NoticePriority,
  type ServiceResult,
} from "@/types/domain";

const delay = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

function readNotices(): Notice[] {
  ensureSeeded();
  const existing = readItem<Notice[]>(STORAGE_KEYS.notices);
  if (existing) return existing;
  const seeded = buildSeedNotices();
  writeItem(STORAGE_KEYS.notices, seeded);
  return seeded;
}

function saveNotices(next: Notice[]): void {
  writeItem(STORAGE_KEYS.notices, next);
}

export interface NoticeInput {
  title: string;
  message: string;
  priority: NoticePriority;
  publishDate: string;
  expiryDate: string;
}

function validate(input: NoticeInput): string | null {
  if (!input.title.trim()) return "Enter the notice title.";
  if (!input.message.trim()) return "Enter the notice message.";
  if (!input.publishDate) return "Select a publish date.";
  if (!input.expiryDate) return "Select an expiry date.";
  if (input.expiryDate < input.publishDate) return "Expiry cannot be before the publish date.";
  return null;
}

async function announce(notice: Notice): Promise<void> {
  const prefix = notice.priority === NOTICE_PRIORITIES.IMPORTANT ? "IMPORTANT: " : "";
  await notificationService.notify({
    type: NOTIFICATION_TYPES.NEW_NOTICE,
    title: notice.title,
    message: `${prefix}${notice.message}`,
    link: "/notices",
  });
}

export const noticeService = {
  /** Committee sees every notice; members see published, unexpired notices. */
  async listNotices(options?: { publishedOnly?: boolean }): Promise<Notice[]> {
    await delay();
    const today = new Date().toISOString().slice(0, 10);
    return readNotices()
      .filter((n) =>
        options?.publishedOnly
          ? n.status === NOTICE_STATUSES.PUBLISHED && n.expiryDate >= today
          : true,
      )
      .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  },

  async getNoticeById(id: string): Promise<Notice | null> {
    await delay(80);
    return readNotices().find((n) => n.id === id) ?? null;
  },

  async createNotice(input: NoticeInput, publish: boolean): Promise<ServiceResult<Notice>> {
    await delay(200);
    const error = validate(input);
    if (error) return { ok: false, error };

    const notice: Notice = {
      id: uid("notice"),
      societyId: SOCIETY_ID,
      title: input.title.trim(),
      message: input.message.trim(),
      priority: input.priority,
      status: publish ? NOTICE_STATUSES.PUBLISHED : NOTICE_STATUSES.DRAFT,
      publishDate: input.publishDate,
      expiryDate: input.expiryDate,
      createdAt: now(),
      updatedAt: now(),
    };
    saveNotices([...readNotices(), notice]);
    if (publish) await announce(notice);
    return { ok: true, data: notice };
  },

  async updateNotice(id: string, input: NoticeInput): Promise<ServiceResult<Notice>> {
    await delay(180);
    const error = validate(input);
    if (error) return { ok: false, error };
    const existing = readNotices().find((n) => n.id === id);
    if (!existing) return { ok: false, error: "Notice not found." };
    const updated: Notice = {
      ...existing,
      title: input.title.trim(),
      message: input.message.trim(),
      priority: input.priority,
      publishDate: input.publishDate,
      expiryDate: input.expiryDate,
      updatedAt: now(),
    };
    saveNotices(readNotices().map((n) => (n.id === id ? updated : n)));
    return { ok: true, data: updated };
  },

  /** Publishes a draft notice and sends an in-app notification to every member. */
  async publishNotice(id: string): Promise<ServiceResult<Notice>> {
    await delay(180);
    const existing = readNotices().find((n) => n.id === id);
    if (!existing) return { ok: false, error: "Notice not found." };
    if (existing.status === NOTICE_STATUSES.PUBLISHED) {
      return { ok: false, error: "This notice is already published." };
    }
    const updated: Notice = { ...existing, status: NOTICE_STATUSES.PUBLISHED, updatedAt: now() };
    saveNotices(readNotices().map((n) => (n.id === id ? updated : n)));
    await announce(updated);
    return { ok: true, data: updated };
  },
};
