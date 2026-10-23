import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { FilterChips } from "@/components/common/FilterChips";
import { LoadingState } from "@/components/common/LoadingState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auditService } from "@/services/auditService";
import { ROLES, PERMISSIONS, type AuditLog, type Role } from "@/types/domain";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Society Management" },
      { name: "description", content: "System activity log for Green Valley Society." },
      { property: "og:title", content: "Audit Logs — Society Management" },
      { property: "og:description", content: "System activity log for Green Valley Society." },
    ],
  }),
  component: AuditLogsPage,
});

const dateFilters = [
  { value: "ALL", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
];

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [userFilter, setUserFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [customDate, setCustomDate] = useState("");

  const load = useCallback(async () => {
    const [entries, facets] = await Promise.all([auditService.list(), auditService.facets()]);
    setLogs(entries);
    setUsers(facets.users);
    setActions(facets.actions);
  }, []);

  useEffect(() => {
    void load();
    return auditService.subscribe(load);
  }, [load]);

  const rows = useMemo(() => {
    if (!logs) return [];
    const today = new Date().toISOString().slice(0, 10);
    const weekStart = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const date = customDate || dateFilter;
    return logs.filter((log) => {
      if (userFilter !== "ALL" && log.userId !== userFilter) return false;
      if (actionFilter !== "ALL" && log.action !== actionFilter) return false;
      const day = log.timestamp.slice(0, 10);
      if (date === "today") return day === today;
      if (date === "week") return day >= weekStart && day <= today;
      if (date && date !== "ALL" && date !== "today" && date !== "week") return day === date;
      return true;
    });
  }, [logs, userFilter, actionFilter, dateFilter, customDate]);

  return (
    <ProtectedPage
      title="Audit Logs"
      subtitle={logs ? `${rows.length} of ${logs.length} entries` : "System activity log"}
      permission={PERMISSIONS.AUDIT_VIEW}
      showBack
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="h-10 rounded-xl text-sm" aria-label="Filter by user">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All users</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="h-10 rounded-xl text-sm" aria-label="Filter by action">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All actions</SelectItem>
              {actions.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FilterChips
          options={dateFilters}
          value={customDate ? "custom" : dateFilter}
          onChange={(v) => {
            if (v === "custom") {
              setDateFilter("ALL");
              return;
            }
            setCustomDate("");
            setDateFilter(v);
          }}
        />
        <Input
          type="date"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          className="h-10 rounded-xl text-sm"
          aria-label="Filter by exact date"
        />

        {logs === null ? (
          <LoadingState rows={5} />
        ) : rows.length === 0 ? (
          <EmptyState title="No activity found" description="Try different filters, or activity will appear as actions happen." />
        ) : (
          <ul className="space-y-2">
            {rows.map((log) => (
              <li key={log.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {log.userName.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{log.userName}</p>
                      <StatusBadge
                        label={log.userRole === ROLES.ADMIN ? "Admin" : log.userRole}
                        tone={log.userRole === ROLES.ADMIN ? "info" : "neutral"}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatWhen(log.timestamp)}</p>
                    <p className="mt-1 text-sm text-foreground">
                      {log.action} • <span className="font-medium">{log.entity}</span>
                      {log.entityId && <span className="text-muted-foreground"> ({log.entityId})</span>}
                    </p>
                    {(log.oldValue || log.newValue) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {log.oldValue ? `${log.oldValue} → ` : ""}
                        {log.newValue}
                      </p>
                    )}
                    {log.reason && <p className="mt-1 text-xs italic text-muted-foreground">Reason: {log.reason}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedPage>
  );
}
