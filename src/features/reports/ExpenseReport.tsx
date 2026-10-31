import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { FilterChips } from "@/components/common/FilterChips";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ReportExportButtons } from "@/features/reports/ReportExportButtons";
import { formatDate, formatINR } from "@/lib/format";
import { eventService } from "@/services/eventService";
import { expenseService } from "@/services/expenseService";
import { EXPENSE_CATEGORIES, type Expense, type SocietyEvent } from "@/types/domain";

const CSV_HEADERS = ["Category", "Description", "Amount", "Date", "Event"];

const categoryFilters = [
  { value: "ALL", label: "All" },
  ...EXPENSE_CATEGORIES.map((category) => ({ value: category, label: category })),
];

export function ExpenseReport() {
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [events, setEvents] = useState<SocietyEvent[] | null>(null);
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    let active = true;
    Promise.all([expenseService.listAll(), eventService.listEvents()]).then(([rows, eventRows]) => {
      if (!active) return;
      setExpenses(rows);
      setEvents(eventRows);
    });
    return () => {
      active = false;
    };
  }, []);

  const eventName = useMemo(() => {
    const map = new Map<string, string>();
    (events ?? []).forEach((e) => map.set(e.id, e.name));
    return map;
  }, [events]);

  const visible = useMemo(() => {
    if (!expenses) return [];
    return expenses
      .filter((e) => (category === "ALL" ? true : e.category === category))
      .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
  }, [expenses, category]);

  const total = useMemo(() => visible.reduce((sum, e) => sum + e.amount, 0), [visible]);

  const csv = useCallback(
    () => ({
      headers: CSV_HEADERS,
      rows: visible.map((e) => [
        e.category,
        e.description,
        e.amount,
        formatDate(e.expenseDate),
        eventName.get(e.eventId) ?? "—",
      ]),
    }),
    [visible, eventName],
  );

  if (!expenses || !events) return <LoadingState rows={4} />;

  return (
    <div className="space-y-3">
      <FilterChips options={categoryFilters} value={category} onChange={setCategory} />

      <ReportExportButtons filename="expense-report.csv" getCsv={csv} />

      {expenses.length === 0 ? (
        <EmptyState title="No expenses recorded" description="Event expenses appear here once added." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total expenses" value={formatINR(total)} />
            <StatCard label="Entries" value={String(visible.length)} hint={category === "ALL" ? "All categories" : category} />
          </div>

          {visible.length === 0 ? (
            <EmptyState title="No expenses in this category" description="Try another category filter." />
          ) : (
            <ul className="space-y-2">
              {visible.map((e) => (
                <li key={e.id} className="rounded-2xl border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{e.description}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDate(e.expenseDate)} • {eventName.get(e.eventId) ?? "—"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground">{formatINR(e.amount)}</span>
                  </div>
                  <div className="mt-2">
                    <StatusBadge label={e.category} tone="info" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
