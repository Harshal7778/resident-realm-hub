import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, Clock, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formatTime } from "@/routes/meetings.index";
import { formatDate } from "@/lib/format";
import { attendanceService, type AttendanceSummary } from "@/services/attendanceService";
import { meetingService } from "@/services/meetingService";
import {
  ATTENDANCE_STATUSES,
  PERMISSIONS,
  type AttendanceRecord,
  type Meeting,
} from "@/types/domain";

export const Route = createFileRoute("/meetings/$id")({
  head: () => ({
    meta: [
      { title: "Meeting detail — Green Valley Society" },
      { name: "description", content: "Meeting agenda, venue and attendance summary." },
      { property: "og:title", content: "Meeting detail — Green Valley Society" },
      { property: "og:description", content: "Agenda, venue and attendance for this society meeting." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MeetingDetailPage,
});

function MeetingDetailPage() {
  const { id } = Route.useParams();
  const { user, can } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null | undefined>(undefined);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({ present: 0, absent: 0, total: 0 });

  const load = useCallback(async () => {
    const found = await meetingService.getMeetingById(id);
    setMeeting(found);
    if (!found) return;
    const rows = await attendanceService.listByMeeting(found.id);
    setRecords(rows);
    setSummary(attendanceService.summaryFor(rows));
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const canManage = can(PERMISSIONS.MANAGE_MEETINGS);
  const mine = user ? records.find((r) => r.memberId === user.memberId) : undefined;

  return (
    <ProtectedPage
      title={meeting?.title ?? "Meeting"}
      subtitle="Meeting detail"
      showBack
      headerAction={<NotificationBell />}
    >
      {meeting === undefined ? (
        <LoadingState rows={3} />
      ) : meeting === null ? (
        <EmptyState icon={CalendarCheck} title="Meeting not found" />
      ) : (
        <div className="space-y-4">
          <section className="space-y-2 rounded-2xl border border-border bg-card p-4">
            <h2 className="text-base font-semibold text-foreground">{meeting.title}</h2>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarCheck className="h-3.5 w-3.5" /> {formatDate(meeting.date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {formatTime(meeting.time)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {meeting.location}
              </span>
            </p>
            {meeting.description && (
              <p className="text-sm text-muted-foreground">{meeting.description}</p>
            )}
            <StatusBadge label={`${summary.present} / ${summary.total} Present`} tone="success" />
          </section>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Present" value={String(summary.present)} tone="positive" />
            <StatCard label="Absent" value={String(summary.absent)} tone="warning" />
          </div>

          {canManage ? (
            <Button asChild className="h-12 w-full rounded-xl">
              <Link to="/attendance" search={{ meetingId: meeting.id }}>
                <ClipboardList className="mr-2 h-4 w-4" /> Manage attendance
              </Link>
            </Button>
          ) : (
            <section className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">Your attendance</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {mine
                  ? mine.status === ATTENDANCE_STATUSES.PRESENT
                    ? "You were marked present for this meeting."
                    : "You were marked absent for this meeting."
                  : "Attendance has not been recorded yet."}
              </p>
            </section>
          )}
        </div>
      )}
    </ProtectedPage>
  );
}
