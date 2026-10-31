import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contributionStatusTone } from "@/features/events/status";
import { ReportExportButtons } from "@/features/reports/ReportExportButtons";
import { formatINR } from "@/lib/format";
import { contributionService, totalsFor } from "@/services/contributionService";
import { eventService } from "@/services/eventService";
import type { Contribution, SocietyEvent } from "@/types/domain";

const CSV_HEADERS = ["House", "Member", "Required", "Paid", "Extra", "Pending", "Status"];

export function ContributionReport({
  fullAccess,
  houseNumber,
}: {
  fullAccess: boolean;
  houseNumber: string;
}) {
  const [events, setEvents] = useState<SocietyEvent[] | null>(null);
  const [eventId, setEventId] = useState("");
  const [contributions, setContributions] = useState<Contribution[] | null>(null);

  useEffect(() => {
    let active = true;
    eventService.listEvents().then((list) => {
      if (!active) return;
      setEvents(list);
      setEventId((current) => current || list[0]?.id || "");
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!eventId) {
      setContributions(null);
      return;
    }
    contributionService.listByEvent(eventId).then((rows) => {
      if (active) setContributions(rows);
    });
    return () => {
      active = false;
    };
  }, [eventId]);

  const visible = useMemo(() => {
    if (!contributions) return null;
    if (fullAccess) return contributions;
    return contributions.filter((c) => c.houseNumber === houseNumber);
  }, [contributions, fullAccess, houseNumber]);

  const totals = useMemo(() => totalsFor(visible ?? []), [visible]);

  const csv = useCallback(
    () => ({
      headers: CSV_HEADERS,
      rows: (visible ?? []).map((c) => [
        c.houseNumber,
        c.memberName,
        c.requiredAmount,
        c.regularPaid,
        c.extraPaid,
        Math.max(c.requiredAmount - c.regularPaid, 0),
        c.status,
      ]),
    }),
    [visible],
  );

  if (!events) return <LoadingState rows={4} />;

  if (events.length === 0) {
    return (
      <EmptyState title="No events yet" description="Contribution records appear once an event is created." />
    );
  }

  const ready = visible !== null;

  return (
    <div className="space-y-3">
      <Select value={eventId} onValueChange={setEventId}>
        <SelectTrigger aria-label="Select event" className="h-12 rounded-xl">
          <SelectValue placeholder="Select event" />
        </SelectTrigger>
        <SelectContent>
          {events.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ReportExportButtons filename="member-contribution-report.csv" getCsv={csv} disabled={!ready} />

      {!ready ? (
        <LoadingState rows={3} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No contribution records"
          description={fullAccess ? "No contribution records exist for this event." : "No contribution record exists for your house in this event."}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Expected" value={formatINR(totals.expected)} />
            <StatCard label="Collected" value={formatINR(totals.collected)} tone="positive" />
            <StatCard label="Extra" value={formatINR(totals.extra)} />
            <StatCard label="Pending" value={formatINR(totals.pending)} tone="warning" />
          </div>

          <ul className="space-y-2">
            {visible.map((c) => (
              <li key={c.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                    House {c.houseNumber} — {c.memberName}
                  </p>
                  <StatusBadge label={c.status} tone={contributionStatusTone(c.status)} />
                </div>
                <dl className="mt-2 grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl bg-muted p-2">
                    <dt className="text-[10px] text-muted-foreground">Required</dt>
                    <dd className="text-xs font-semibold">{formatINR(c.requiredAmount)}</dd>
                  </div>
                  <div className="rounded-xl bg-muted p-2">
                    <dt className="text-[10px] text-muted-foreground">Paid</dt>
                    <dd className="text-xs font-semibold text-success">{formatINR(c.regularPaid)}</dd>
                  </div>
                  <div className="rounded-xl bg-muted p-2">
                    <dt className="text-[10px] text-muted-foreground">Extra</dt>
                    <dd className="text-xs font-semibold">{formatINR(c.extraPaid)}</dd>
                  </div>
                  <div className="rounded-xl bg-muted p-2">
                    <dt className="text-[10px] text-muted-foreground">Pending</dt>
                    <dd className="text-xs font-semibold text-warning">
                      {formatINR(Math.max(c.requiredAmount - c.regularPaid, 0))}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
