import { STORAGE_KEYS, readItem, writeItem } from "@/lib/storage";
import { authService } from "@/services/authService";
import { ROLES, type AuditLog, type Role } from "@/types/domain";

const AUDIT_EVENT = "sm:audit-changed";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function readLogs(): AuditLog[] {
  return readItem<AuditLog[]>(STORAGE_KEYS.auditLogs) ?? [];
}

function writeLogs(logs: AuditLog[]) {
  writeItem(STORAGE_KEYS.auditLogs, logs);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUDIT_EVENT));
}

export interface AuditInput {
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  actor?: { id: string; name: string; role: Role };
}

export const auditService = {
  /** Records an activity entry. Falls back to the signed-in user as actor. */
  log(input: AuditInput): AuditLog {
    const session = authService.getSession();
    const actor = input.actor ?? {
      id: session?.user.id ?? "system",
      name: session?.user.name ?? "System",
      role: session?.user.role ?? ROLES.ADMIN,
    };
    const entry: AuditLog = {
      id: uid("audit"),
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? "",
      timestamp: new Date().toISOString(),
      oldValue: input.oldValue ?? "",
      newValue: input.newValue ?? "",
      reason: input.reason ?? "",
    };
    writeLogs([entry, ...readLogs()].slice(0, 500));
    return entry;
  },

  async list(filter?: { userId?: string; action?: string; date?: string }): Promise<AuditLog[]> {
    await new Promise((r) => setTimeout(r, 180));
    let logs = readLogs();
    if (filter?.userId && filter.userId !== "ALL") {
      logs = logs.filter((l) => l.userId === filter.userId);
    }
    if (filter?.action && filter.action !== "ALL") {
      logs = logs.filter((l) => l.action === filter.action);
    }
    if (filter?.date) {
      logs = logs.filter((l) => l.timestamp.slice(0, 10) === filter.date);
    }
    return logs;
  },

  /** Distinct actors and actions, for the audit filters. */
  async facets(): Promise<{ users: { id: string; name: string }[]; actions: string[] }> {
    const logs = readLogs();
    const users = new Map<string, string>();
    const actions = new Set<string>();
    for (const log of logs) {
      users.set(log.userId, log.userName);
      actions.add(log.action);
    }
    return {
      users: [...users].map(([id, name]) => ({ id, name })),
      actions: [...actions].sort(),
    };
  },

  subscribe(listener: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(AUDIT_EVENT, listener);
    return () => window.removeEventListener(AUDIT_EVENT, listener);
  },
};
