import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/common/StatCard";
import { ReportExportButtons } from "@/features/reports/ReportExportButtons";
import { formatDate, formatINR } from "@/lib/format";
import { attendanceService } from "@/services/attendanceService";
import { meetingService } from "@/services/meetingService";
import type { Meeting } from "@/types/domain";

const CSV_HEADERS = ["Meeting", "Date", "Present", "Absent", "Total", "Attendance %"];

interface MeetingRow {
  meeting: Meeting;
  present: number;
  absent: number;
  total: number;
  percent: number;
}

export function AttendanceReport() {
  const [rows, setRows] = useState<MeetingRow[] | null>(null);

  useEffect(() => {
    let active = true;
    meetingService.listMeetings().then((meetings) => {
      if (!active) return;
      setRows(
        meetings.map((meeting) => {
          const summary = attendanceService.summaryForMeeting(meeting.id);
          return {
            meeting,
            present: summary.present,
            absent: summary.absent,
            total: summary.total,
            percent: summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0,
          };
        }),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    const list = rows ?? [];
    const present = list.reduce((sum, r) => sum + r.present, 0);
    const total = list.reduce((sum, r) => sum + r.total, 0);
    return {
      meetings: list.length,
      present,
      absent: total - present,
      percent: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }, [rows]);

  const csv = useCallback(
    () => ({
      headers: CSV_HEADERS,
      rows: (rows ?? []).map((r) => [
        r.meeting.title,
        formatDate(r.meeting.date),
        r.present,
        r.absent,
        r.total,
        r.percent,
      ]),
    }),
    [rows],
  );

  if (!rows) return <LoadingState rows={4} />;

  return (
    <div className="space-y-3">
      <ReportExportButtons filename="meeting-attendance-report.csv" getCsv={csv} />

      {rows.length === 0 ? (
        <EmptyState title="No meetings yet" description="Create a meeting and mark attendance to see this report." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Meetings" value={String(totals.meetings)} />
            <StatCard label="Overall attendance" value={`${totals.percent}%`} tone="positive" />
            <StatCard label="Present (all)" value={String(totals.present)} />
            <StatCard label="Absent (all)" value={String(totals.absent)} tone="warning" />
          </div>

          <ul className="space-y-2">
            {rows.map(({ meeting, present, absent, total, percent }) => (
              <li key={meeting.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold text-foreground">{meeting.title}</p>
                  <span className="shrink-0 text-sm font-semibold text-foreground">{percent}%</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(meeting.date)} • {meeting.time} • {meeting.location}
                </p>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={`Attendance ${percent} percent: ${present} present, ${absent} absent of ${total}`}
                >
                  <div className="h-full rounded-full bg-success" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {present} present • {absent} absent of {total}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
