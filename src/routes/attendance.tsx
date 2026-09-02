import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Check, CheckCheck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { SearchBar } from "@/components/common/SearchBar";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { attendanceService } from "@/services/attendanceService";
import { meetingService } from "@/services/meetingService";
import {
  ATTENDANCE_STATUSES,
  PERMISSIONS,
  type AttendanceRecord,
  type AttendanceStatus,
  type Meeting,
} from "@/types/domain";

export const Route = createFileRoute("/attendance")({
  validateSearch: (search: Record<string, unknown>) => ({
    meetingId: typeof search['meetingId'] === "string" ? (search['meetingId'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Attendance — Green Valley Society" },
      { name: "description", content: "Mark and review house-wise attendance for society meetings." },
      { property: "og:title", content: "Attendance — Green Valley Society" },
      { property: "og:description", content: "House-wise present/absent marking with instant totals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const { meetingId } = Route.useSearch();
  const { user, can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_MEETINGS);

  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [selected, setSelected] = useState<string>(meetingId ?? "");
  const [records, setRecords] = useState<AttendanceRecord[] | null>(null);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    void (async () => {
      const rows = await meetingService.listMeetings();
      setMeetings(rows);
      setSelected((current) => current || rows[0]?.id || "");
    })();
  }, []);

  const loadSheet = useCallback(async (id: string) => {
    if (!id) return;
    setRecords(null);
    const rows = await attendanceService.listByMeeting(id);
    setRecords(rows);
    setStatuses(Object.fromEntries(rows.map((r) => [r.houseId, r.status])));
  }, []);

  useEffect(() => {
    if (canManage) void loadSheet(selected);
  }, [canManage, selected, loadSheet]);

  useEffect(() => {
    if (canManage || !user) return;
    void (async () => setHistory(await attendanceService.listByMember(user.memberId)))();
  }, [canManage, user]);

  const filtered = useMemo(() => {
    if (!records) return [];
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) => r.houseNumber.toLowerCase().includes(q) || r.memberName.toLowerCase().includes(q),
    );
  }, [records, query]);

  const present = Object.values(statuses).filter((s) => s === ATTENDANCE_STATUSES.PRESENT).length;
  const total = records?.length ?? 0;
  const meetingById = (id: string) => meetings?.find((m) => m.id === id);

  async function save() {
    setSaving(true);
    const res = await attendanceService.saveAttendance(selected, statuses);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not save attendance");
      return;
    }
    toast.success(`Attendance saved — ${res.data?.present} / ${res.data?.total} Present`);
    await loadSheet(selected);
  }

  if (!canManage) {
    return (
      <ProtectedPage
        title="My attendance"
        subtitle="Your meeting attendance history"
        showBack
        headerAction={<NotificationBell />}
      >
        {history.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No attendance recorded yet" />
        ) : (
          <ul className="space-y-2">
            {history.map((record) => {
              const meeting = meetingById(record.meetingId);
              return (
                <li
                  key={record.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {meeting?.title ?? "Meeting"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {meeting ? formatDate(meeting.date) : ""}
                    </span>
                  </span>
                  <StatusBadge
                    label={record.status === ATTENDANCE_STATUSES.PRESENT ? "Present" : "Absent"}
                    tone={record.status === ATTENDANCE_STATUSES.PRESENT ? "success" : "danger"}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage
      title="Attendance"
      subtitle="Mark house-wise attendance"
      showBack
      headerAction={<NotificationBell />}
    >
      <div className="space-y-3">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="Select meeting" />
          </SelectTrigger>
          <SelectContent>
            {(meetings ?? []).map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.title} • {formatDate(m.date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Present" value={String(present)} tone="positive" />
          <StatCard label="Absent" value={String(Math.max(total - present, 0))} tone="warning" />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-xl"
            onClick={() =>
              setStatuses(
                Object.fromEntries((records ?? []).map((r) => [r.houseId, ATTENDANCE_STATUSES.PRESENT])),
              )
            }
          >
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all present
          </Button>
          <Button className="h-11 flex-1 rounded-xl" disabled={saving || !selected} onClick={save}>
            {saving ? "Saving…" : "Save attendance"}
          </Button>
        </div>

        <SearchBar value={query} onChange={setQuery} placeholder="Search house or member" />

        {records === null ? (
          <LoadingState rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No houses found" />
        ) : (
          <ul className="space-y-2">
            {filtered.map((record) => {
              const status = statuses[record.houseId] ?? record.status;
              const isPresent = status === ATTENDANCE_STATUSES.PRESENT;
              return (
                <li
                  key={record.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {record.houseNumber} {record.memberName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isPresent ? "Present" : "Absent"}
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label={`Mark ${record.houseNumber} present`}
                      aria-pressed={isPresent}
                      onClick={() =>
                        setStatuses((s) => ({ ...s, [record.houseId]: ATTENDANCE_STATUSES.PRESENT }))
                      }
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors",
                        isPresent ? "bg-success/15 text-success" : "text-muted-foreground",
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Mark ${record.houseNumber} absent`}
                      aria-pressed={!isPresent}
                      onClick={() =>
                        setStatuses((s) => ({ ...s, [record.houseId]: ATTENDANCE_STATUSES.ABSENT }))
                      }
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors",
                        !isPresent ? "bg-destructive/12 text-destructive" : "text-muted-foreground",
                      )}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ProtectedPage>
  );
}
