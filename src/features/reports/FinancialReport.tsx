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
import { ReportChart, type ReportChartDatum } from "@/features/reports/ReportChart";
import { ReportExportButtons } from "@/features/reports/ReportExportButtons";
import { formatDateRange, formatINR } from "@/lib/format";
import { contributionService, totalsFor } from "@/services/contributionService";
import { eventService } from "@/services/eventService";
import { expenseService, expenseTotal } from "@/services/expenseService";
import type { Contribution, Expense, SocietyEvent } from "@/types/domain";

const CSV_HEADERS = ["House", "Member", "Required", "Paid", "Extra", "Pending", "Status"];

export function FinancialReport() {
  const [events, setEvents] = useState<SocietyEvent[] | null>(null);
  const [eventId, setEventId] = useState("");
  const [contributions, setContributions] = useState<Contribution[] | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);

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

  const load = useCallback(async () => {
    if (!eventId) return;
    setContributions(null);
    setExpenses(null);
    const [contribs, eventExpenses] = await Promise.all([
      contributionService.listByEvent(eventId),
      expenseService.listByEvent(eventId),
    ]);
    setContributions(contribs);
    setExpenses(eventExpenses);
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(
    () => totalsFor(contributions ?? [], expenseTotal(expenses ?? [])),
    [contributions, expenses],
  );

  const csv = useCallback(
    () => ({
      headers: CSV_HEADERS,
      rows: (contributions ?? []).map((c) => [
        c.houseNumber,
        c.memberName,
        c.requiredAmount,
        c.regularPaid,
        c.extraPaid,
        Math.max(c.requiredAmount - c.regularPaid, 0),
        c.status,
      ]),
    }),
    [contributions],
  );

  if (!events) return <LoadingState rows={4} />;

  if (events.length === 0) {
    return (
      <EmptyState title="No events yet" description="Create an event to see its financial report." />
    );
  }

  const event = events.find((e) => e.id === eventId) ?? null;
  const ready = contributions !== null && expenses !== null && !!event;
  const chartData: ReportChartDatum[] = [
    { label: "Collected", value: totals.collected, color: "var(--success)" },
    { label: "Extra", value: totals.extra, color: "var(--primary)" },
    { label: "Pending", value: totals.pending, color: "var(--warning)" },
    { label: "Expenses", value: totals.expenses, color: "var(--destructive)" },
  ];

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

      <ReportExportButtons
        filename="event-financial-report.csv"
        getCsv={csv}
        disabled={!ready}
      />

      {!ready ? (
        <LoadingState rows={4} />
      ) : (
        <>
          {event && (
            <p className="text-xs text-muted-foreground">
              {event.type} • {formatDateRange(event.startDate, event.endDate)}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Expected" value={formatINR(totals.expected)} />
            <StatCard label="Collected" value={formatINR(totals.collected)} tone="positive" />
            <StatCard label="Extra" value={formatINR(totals.extra)} />
            <StatCard label="Pending" value={formatINR(totals.pending)} tone="warning" />
            <StatCard label="Expenses" value={formatINR(totals.expenses)} />
            <StatCard label="Balance" value={formatINR(totals.balance)} tone="positive" />
          </div>

          <section className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Collection overview</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Collected, extra, pending and expenses for {event?.name}
            </p>
            <div className="mt-3">
              <ReportChart data={chartData} ariaLabel="Financial overview bar chart" formatValue={formatINR} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Balance = Collected + Extra − Expenses = {formatINR(totals.balance)}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">House-wise contributions</h3>
            {contributions.length === 0 ? (
              <EmptyState title="No contributions found" description="No contribution records exist for this event." />
            ) : (
              <ul className="space-y-2">
                {contributions.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        House {c.houseNumber} • {formatINR(c.regularPaid)} / {formatINR(c.requiredAmount)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.memberName}
                        {c.extraPaid > 0 ? ` • Extra ${formatINR(c.extraPaid)}` : ""}
                      </p>
                    </div>
                    <StatusBadge label={c.status} tone={contributionStatusTone(c.status)} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
