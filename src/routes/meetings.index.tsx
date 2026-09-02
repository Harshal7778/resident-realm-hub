import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, ChevronRight, Clock, MapPin, Plus, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { MeetingFormSheet } from "@/features/meetings/MeetingFormSheet";
import { formatDate } from "@/lib/format";
import { attendanceService } from "@/services/attendanceService";
import { meetingService } from "@/services/meetingService";
import { PERMISSIONS, type Meeting } from "@/types/domain";

export const Route = createFileRoute("/meetings/")({
  head: () => ({
    meta: [
      { title: "Meetings — Green Valley Society" },
      { name: "description", content: "Society meetings with date, time, venue and attendance counts." },
      { property: "og:title", content: "Meetings — Green Valley Society" },
      { property: "og:description", content: "Monthly meetings, AGM schedule and attendance for Green Valley Society." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MeetingsPage,
});

export function formatTime(time: string): string {
  const [h = "0", m = "00"] = time.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${suffix}`;
}

function MeetingsPage() {
  const { can } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [counts, setCounts] = useState<Record<string, { present: number; total: number }>>({});

  const load = useCallback(async () => {
    const rows = await meetingService.listMeetings();
    setMeetings(rows);
    const next: Record<string, { present: number; total: number }> = {};
    for (const meeting of rows) {
      await attendanceService.ensureRecordsForMeeting(meeting.id);
      const summary = attendanceService.summaryForMeeting(meeting.id);
      next[meeting.id] = { present: summary.present, total: summary.total };
    }
    setCounts(next);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const canManage = can(PERMISSIONS.MANAGE_MEETINGS);

  return (
    <ProtectedPage
      title="Meetings"
      subtitle="Committee and general body meetings"
      headerAction={<NotificationBell />}
    >
      <div className="space-y-3">
        {canManage && (
          <MeetingFormSheet
            onSubmit={async (values) => {
              const res = await meetingService.createMeeting(values);
              if (!res.ok) {
                toast.error(res.error ?? "Could not create meeting");
                return false;
              }
              toast.success(`${res.data?.title} scheduled — members notified`);
              await load();
              return true;
            }}
            trigger={
              <Button className="h-12 w-full rounded-xl">
                <Plus className="mr-2 h-4 w-4" /> Schedule meeting
              </Button>
            }
          />
        )}

        {meetings === null ? (
          <LoadingState rows={3} />
        ) : meetings.length === 0 ? (
          <EmptyState icon={Users} title="No meetings yet" description="Scheduled meetings appear here." />
        ) : (
          <ul className="space-y-2">
            {meetings.map((meeting) => {
              const count = counts[meeting.id];
              return (
                <li key={meeting.id}>
                  <Link
                    to="/meetings/$id"
                    params={{ id: meeting.id }}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CalendarCheck className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {meeting.title}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{formatDate(meeting.date)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatTime(meeting.time)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {meeting.location}
                        </span>
                      </span>
                      {count && (
                        <span className="mt-1 inline-block">
                          <StatusBadge
                            label={`${count.present} / ${count.total} Present`}
                            tone={count.present > 0 ? "success" : "neutral"}
                          />
                        </span>
                      )}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ProtectedPage>
  );
}
