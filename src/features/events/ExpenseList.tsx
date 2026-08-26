import { Lock, Paperclip, Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ExpenseFormSheet } from "@/features/events/ExpenseFormSheet";
import { formatDate, formatINR } from "@/lib/format";
import type { ExpenseInput } from "@/services/expenseService";
import { EXPENSE_CATEGORIES, type Expense } from "@/types/domain";

export function ExpenseList({
  eventId,
  expenses,
  canManage,
  locked,
  onAdd,
  onEdit,
  onRemove,
}: {
  eventId: string;
  expenses: Expense[];
  canManage: boolean;
  locked: boolean;
  onAdd: (values: ExpenseInput) => Promise<boolean>;
  onEdit: (id: string, values: ExpenseInput) => Promise<boolean>;
  onRemove: (id: string) => void;
}) {
  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const byCategory = useMemo(
    () =>
      EXPENSE_CATEGORIES.map((c) => ({
        category: c,
        amount: expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
      })).filter((row) => row.amount > 0),
    [expenses],
  );
  const editable = canManage && !locked;

  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total expenses</p>
            <p className="text-2xl font-semibold text-foreground">{formatINR(total)}</p>
          </div>
          {locked ? (
            <StatusBadge label="Event closed" tone="neutral" />
          ) : (
            canManage && (
              <ExpenseFormSheet
                eventId={eventId}
                onSubmit={onAdd}
                trigger={
                  <Button className="h-11 rounded-xl">
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                }
              />
            )
          )}
        </div>
        {byCategory.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {byCategory.map((row) => (
              <li key={row.category} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {row.category} • {formatINR(row.amount)}
              </li>
            ))}
          </ul>
        )}
      </section>

      {locked && (
        <p className="flex items-center gap-2 rounded-2xl border border-border bg-muted p-3 text-xs text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" /> Event closed — expenses are read-only. An admin can unlock the
          event to make changes.
        </p>
      )}

      {expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description={editable ? "Add the first event expense." : "Expenses appear here once recorded."}
        />
      ) : (
        <ul className="space-y-2">
          {expenses.map((expense) => (
            <li key={expense.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {expense.category} • {formatDate(expense.expenseDate)}
                  </p>
                  {expense.notes && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">{expense.notes}</p>
                  )}
                  {expense.receipt && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                      <Paperclip className="h-3.5 w-3.5" /> {expense.receipt}
                    </p>
                  )}
                </div>
                <p className="shrink-0 text-sm font-semibold text-foreground">{formatINR(expense.amount)}</p>
              </div>

              {editable && (
                <div className="mt-3 flex gap-2">
                  <ExpenseFormSheet
                    eventId={eventId}
                    expense={expense}
                    onSubmit={(values) => onEdit(expense.id, values)}
                    trigger={
                      <Button variant="outline" className="h-10 flex-1 rounded-xl">
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    title="Remove this expense?"
                    description="The event financial summary will be recalculated."
                    confirmLabel="Remove"
                    destructive
                    onConfirm={() => onRemove(expense.id)}
                    trigger={
                      <Button variant="outline" className="h-10 rounded-xl px-4">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
