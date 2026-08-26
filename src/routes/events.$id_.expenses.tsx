import { createFileRoute, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/common/StatCard";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { useAuth } from "@/context/AuthContext";
import { ExpenseList } from "@/features/events/ExpenseList";
import { formatINR } from "@/lib/format";
import { contributionService, totalsFor } from "@/services/contributionService";
import { eventService } from "@/services/eventService";
import { expenseService, expenseTotal, type ExpenseInput } from "@/services/expenseService";
import { PERMISSIONS, ROLES, type Contribution, type Expense, type SocietyEvent } from "@/types/domain";

export const Route = createFileRoute("/events/$id_/expenses")({
  head: () => ({
    meta: [
      { title: "Event expenses — Society Management" },
      { name: "description", content: "Record and review event expenses by category for Green Valley Society." },
      { property: "og:title", content: "Event expenses — Society Management" },
      { property: "og:description", content: "Add, edit and total event expenses with receipt references." },
    ],
  }),
  component: EventExpensesPage,
});

function EventExpensesPage() {
  const { id } = useParams({ from: "/events/$id_/expenses" });
  const { can, user } = useAuth();
  const [event, setEvent] = useState<SocietyEvent | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  const load = useCallback(async () => {
    const [e, x, c] = await Promise.all([
      eventService.getEventById(id),
      expenseService.listByEvent(id),
      contributionService.listByEvent(id),
    ]);
    setEvent(e);
    setExpenses(x);
    setContributions(c);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAdd = useCallback(
    async (values: ExpenseInput) => {
      const res = await expenseService.addExpense(values);
      if (!res.ok) {
        toast.error(res.error ?? "Could not add expense");
        return false;
      }
      toast.success("Expense added");
      await load();
      return true;
    },
    [load],
  );

  const handleEdit = useCallback(
    async (expenseId: string, values: ExpenseInput) => {
      const res = await expenseService.updateExpense(expenseId, values);
      if (!res.ok) {
        toast.error(res.error ?? "Could not save expense");
        return false;
      }
      toast.success("Expense updated");
      await load();
      return true;
    },
    [load],
  );

  const handleRemove = useCallback(
    async (expenseId: string) => {
      const res = await expenseService.removeExpense(expenseId);
      if (!res.ok) toast.error(res.error ?? "Could not remove expense");
      else toast.success("Expense removed");
      await load();
    },
    [load],
  );

  if (!event || expenses === null) {
    return (
      <ProtectedPage title="Expenses" subtitle="Loading…" showBack>
        <LoadingState rows={4} />
      </ProtectedPage>
    );
  }

  const locked = eventService.isLocked(event);
  const canManage = can(PERMISSIONS.MANAGE_FINANCE) || can(PERMISSIONS.MANAGE_EVENTS);
  const totals = totalsFor(contributions, expenseTotal(expenses));

  return (
    <ProtectedPage
      title="Expenses"
      subtitle={`${event.name} • ${locked ? "Closed" : "Active"}`}
      showBack
      roles={[ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Collected" value={formatINR(totals.collected + totals.extra)} tone="positive" />
          <StatCard label="Balance" value={formatINR(totals.balance)} tone={totals.balance < 0 ? "warning" : "positive"} />
        </div>
        <ExpenseList
          eventId={event.id}
          expenses={expenses}
          canManage={canManage && user !== null}
          locked={locked}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>
    </ProtectedPage>
  );
}
