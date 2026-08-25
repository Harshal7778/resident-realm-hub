import { createFileRoute, useParams } from "@tanstack/react-router";
import { Lock, LockOpen, Receipt } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { ContributionList } from "@/features/events/ContributionList";
import { UnlockEventDialog } from "@/features/events/UnlockEventDialog";
import { contributionStatusTone, eventStatusTone } from "@/features/events/status";
import { formatDateRange, formatINR } from "@/lib/format";
import { contributionService, totalsFor } from "@/services/contributionService";
import { eventService } from "@/services/eventService";
import { paymentService, type PaymentInput } from "@/services/paymentService";
import { PERMISSIONS, ROLES, type Contribution, type Payment, type SocietyEvent } from "@/types/domain";

export const Route = createFileRoute("/events/$id")({
  head: () => ({
    meta: [
      { title: "Event detail — Society Management" },
      { name: "description", content: "Event contributions, collections and balance for Green Valley Society." },
      { property: "og:title", content: "Event detail — Society Management" },
      { property: "og:description", content: "Track expected, collected, extra and pending contributions per house." },
    ],
  }),
  component: EventDetailPage,
});

function EventDetailPage() {
  const { id } = useParams({ from: "/events/$id" });
  const { user, can } = useAuth();
  const [event, setEvent] = useState<SocietyEvent | null>(null);
  const [contributions, setContributions] = useState<Contribution[] | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  const load = useCallback(async () => {
    const [e, c, p] = await Promise.all([
      eventService.getEventById(id),
      contributionService.listByEvent(id),
      paymentService.listByEvent(id),
    ]);
    setEvent(e);
    setContributions(c);
    setPayments(p);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const isMemberOnly = user?.role === ROLES.MEMBER;
  const visibleContributions = useMemo(() => {
    if (!contributions) return [];
    if (!isMemberOnly) return contributions;
    return contributions.filter((c) => c.houseNumber === user?.houseNumber);
  }, [contributions, isMemberOnly, user?.houseNumber]);

  const visiblePayments = useMemo(() => {
    if (isMemberOnly) {
      const ids = new Set(visibleContributions.map((c) => c.id));
      return payments.filter((p) => ids.has(p.contributionId));
    }
    return payments;
  }, [payments, isMemberOnly, visibleContributions]);

  const totals = useMemo(() => totalsFor(contributions ?? [], 0), [contributions]);
  const locked = event ? eventService.isLocked(event) : false;
  const canRecord = can(PERMISSIONS.RECORD_PAYMENT);
  const canClose = can(PERMISSIONS.MANAGE_EVENTS) || can(PERMISSIONS.CLOSE_EVENT);
  const canUnlock = user?.role === ROLES.ADMIN;

  const recordPayment = useCallback(
    async (values: PaymentInput) => {
      const res = await paymentService.recordPayment(values);
      if (!res.ok) {
        toast.error(res.error ?? "Could not record payment");
        return false;
      }
      toast.success(`Payment recorded — ${res.data?.houseNumber} is ${res.data?.status}`);
      await load();
      return true;
    },
    [load],
  );

  if (!event || contributions === null) {
    return (
      <ProtectedPage title="Event" subtitle="Loading…" showBack>
        <LoadingState rows={4} />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage title={event.name} subtitle={`${event.type} • ${formatDateRange(event.startDate, event.endDate)}`} showBack>
      <div className="space-y-4">
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-foreground">{event.name}</h2>
              <p className="text-xs text-muted-foreground">
                {formatDateRange(event.startDate, event.endDate)} • Standard{" "}
                {formatINR(event.standardContribution)}
              </p>
            </div>
            <StatusBadge label={event.status} tone={eventStatusTone(event.status)} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>

          {(canClose || canUnlock) && (
            <div className="mt-3 flex gap-2">
              {!locked && canClose && event.status === "ACTIVE" && (
                <ConfirmDialog
                  title="Are you sure you want to close this event?"
                  description="Payment and contribution editing will be disabled until an admin unlocks it."
                  confirmLabel="Close event"
                  destructive
                  onConfirm={async () => {
                    const res = await eventService.closeEvent(event.id);
                    if (!res.ok) toast.error(res.error ?? "Could not close event");
                    else toast.success("Event closed");
                    await load();
                  }}
                  trigger={
                    <Button variant="outline" className="h-11 flex-1 rounded-xl">
                      <Lock className="mr-2 h-4 w-4" /> Close event
                    </Button>
                  }
                />
              )}
              {locked && canUnlock && (
                <UnlockEventDialog
                  onUnlock={async (reason) => {
                    const res = await eventService.unlockEvent(event.id, reason);
                    if (!res.ok) {
                      toast.error(res.error ?? "Could not unlock event");
                      return false;
                    }
                    toast.success("Event unlocked");
                    await load();
                    return true;
                  }}
                  trigger={
                    <Button className="h-11 flex-1 rounded-xl">
                      <LockOpen className="mr-2 h-4 w-4" /> Unlock event
                    </Button>
                  }
                />
              )}
            </div>
          )}
          {locked && event.unlockReason && (
            <p className="mt-2 text-xs text-muted-foreground">Last unlock reason: {event.unlockReason}</p>
          )}
        </section>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Expected" value={formatINR(totals.expected)} />
              <StatCard label="Collected" value={formatINR(totals.collected)} tone="positive" />
              <StatCard label="Extra" value={formatINR(totals.extra)} />
              <StatCard label="Pending" value={formatINR(totals.pending)} tone="warning" />
              <StatCard label="Expenses" value={formatINR(totals.expenses)} />
              <StatCard label="Balance" value={formatINR(totals.balance)} tone="positive" />
            </div>

            {isMemberOnly && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Your contribution</h3>
                {visibleContributions.length === 0 ? (
                  <EmptyState title="No contribution record" description="No record exists for your house yet." />
                ) : (
                  visibleContributions.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">House {c.houseNumber}</p>
                        <StatusBadge label={c.status} tone={contributionStatusTone(c.status)} />
                      </div>
                      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-muted p-2">
                          <dt className="text-[11px] text-muted-foreground">Required</dt>
                          <dd className="text-sm font-semibold">{formatINR(c.requiredAmount)}</dd>
                        </div>
                        <div className="rounded-xl bg-muted p-2">
                          <dt className="text-[11px] text-muted-foreground">Paid</dt>
                          <dd className="text-sm font-semibold text-success">{formatINR(c.regularPaid)}</dd>
                        </div>
                        <div className="rounded-xl bg-muted p-2">
                          <dt className="text-[11px] text-muted-foreground">Extra</dt>
                          <dd className="text-sm font-semibold">{formatINR(c.extraPaid)}</dd>
                        </div>
                      </dl>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                {isMemberOnly ? "Your payments" : "Recent payments"}
              </h3>
              {visiblePayments.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No payments yet"
                  description={canRecord && !locked ? "Record the first cash payment." : "Payments appear here once recorded."}
                />
              ) : (
                <ul className="space-y-2">
                  {visiblePayments.slice(0, 8).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {p.houseNumber} • {formatINR(p.amount)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatDateRange(p.paidAt, p.paidAt)}
                          {p.note ? ` • ${p.note}` : ""}
                        </p>
                      </div>
                      <StatusBadge label={p.type} tone={p.type === "EXTRA" ? "info" : "success"} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contributions" className="mt-3">
            {isMemberOnly ? (
              visibleContributions.length === 0 ? (
                <EmptyState title="No contribution record" description="Only your own contribution is visible." />
              ) : (
                <div className="space-y-2">
                  {visibleContributions.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">
                          {c.houseNumber} — {formatINR(c.regularPaid)} / {formatINR(c.requiredAmount)}
                        </p>
                        <StatusBadge label={c.status} tone={contributionStatusTone(c.status)} />
                      </div>
                      {c.extraPaid > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">Extra {formatINR(c.extraPaid)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <ContributionList
                eventId={event.id}
                contributions={contributions}
                canRecord={canRecord}
                locked={locked}
                onRecord={recordPayment}
              />
            )}
          </TabsContent>

          <TabsContent value="expenses" className="mt-3">
            <EmptyState
              icon={Receipt}
              title="Expenses coming next"
              description="The expense module lands in the next build phase."
            />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedPage>
  );
}
