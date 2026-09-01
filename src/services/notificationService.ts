import { buildSeedNotifications } from "@/data/seed";
import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { ensureSeeded } from "@/services/memberService";
import type { AppNotification, Member, NotificationType } from "@/types/domain";

const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

/**
 * Delivery adapter abstraction. Today everything is delivered in-app only.
 * A future Firebase/FCM adapter can be registered without touching callers.
 */
export interface NotificationChannel {
  deliver: (notification: AppNotification) => void | Promise<void>;
}

const channels: NotificationChannel[] = [];

export function registerNotificationChannel(channel: NotificationChannel): void {
  channels.push(channel);
}

function readAll(): AppNotification[] {
  ensureSeeded();
  const existing = readItem<AppNotification[]>(STORAGE_KEYS.notifications);
  if (existing) return existing;
  const members = readItem<Member[]>(STORAGE_KEYS.members) ?? [];
  const seeded = buildSeedNotifications(members);
  writeItem(STORAGE_KEYS.notifications, seeded);
  return seeded;
}

function saveAll(next: AppNotification[]): void {
  writeItem(STORAGE_KEYS.notifications, next);
}

function activeMemberIds(): string[] {
  ensureSeeded();
  return (readItem<Member[]>(STORAGE_KEYS.members) ?? []).filter((m) => m.isActive).map((m) => m.id);
}

export interface NotifyInput {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  /** Defaults to every active member (society-wide broadcast). */
  userIds?: string[];
}

export const notificationService = {
  async listForUser(userId: string): Promise<AppNotification[]> {
    return readAll()
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  unreadCountFor(userId: string): number {
    return readAll().filter((n) => n.userId === userId && !n.read).length;
  },

  /** Creates one in-app notification per recipient and fans out to channels. */
  async notify(input: NotifyInput): Promise<AppNotification[]> {
    const recipients = input.userIds ?? activeMemberIds();
    const created: AppNotification[] = recipients.map((userId) => ({
      id: uid("notif"),
      userId,
      type: input.type,
      title: input.title,
      message: input.message,
      timestamp: now(),
      read: false,
      ...(input.link ? { link: input.link } : {}),
    }));
    saveAll([...readAll(), ...created]);
    await Promise.all(created.flatMap((n) => channels.map((c) => c.deliver(n))));
    return created;
  },

  async markAsRead(id: string): Promise<void> {
    saveAll(readAll().map((n) => (n.id === id ? { ...n, read: true } : n)));
  },

  async markAllAsRead(userId: string): Promise<void> {
    saveAll(readAll().map((n) => (n.userId === userId ? { ...n, read: true } : n)));
  },
};
