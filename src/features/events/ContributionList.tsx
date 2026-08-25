import { Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { FilterChips } from "@/components/common/FilterChips";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { RecordPaymentSheet } from "@/features/events/RecordPaymentSheet";
import { contributionStatusTone } from "@/features/events/status";
import { formatINR } from "@/lib/format";
import type { PaymentInput } from "@/services/paymentService";
import type { Contribution } from "@/types/domain";

const filters = [
  { value: "ALL", label: "All" },
  { value: "PAID", label: "Paid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PENDING", label: "Pending" },
];

export function ContributionList({
  eventId,
  contributions,
  canRecord,
  locked,
  onRecord,
}: {
  eventId: string;
  contributions: Contribution[];
  canRecord: boolean;
  locked: boolean;
  onRecord: (values: PaymentInput) => Promise<boolean>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contributions.filter((c) => {
      if (filter !== "ALL" && c.status !== filter) return false;
      if (!q) return true;
      return c.houseNumber.toLowerCase().includes(q) || c.memberName.toLowerCase().includes(q);
    });
  }, [contributions, query, filter]);

  return (
    <div className="space-y-3">
      <SearchBar value={query} onChange={setQuery} placeholder="Search house or member name" />
      <FilterChips options={filters} value={filter} onChange={setFilter} />

      {canRecord && !locked && (
        <RecordPaymentSheet
          eventId={eventId}
          contributions={contributions}
          onSubmit={onRecord}
          trigger={
            <Button className="h-12 w-full rounded-xl">
              <Wallet className="mr-2 h-4 w-4" /> Record payment
            </Button>
          }
        />
      )}
      {locked && (
        <p className="rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
          This event is closed — payment and contribution editing is disabled.
        </p>
      )}

      {rows.length === 0 ? (
        <EmptyState title="No contributions found" description="Try a different search or filter." />
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => (
            <li key={c.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {c.houseNumber} — {formatINR(c.regularPaid)} / {formatINR(c.requiredAmount)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{c.memberName}</p>
                  {c.extraPaid > 0 && (
                    <p className="text-xs text-muted-foreground">Extra {formatINR(c.extraPaid)}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StatusBadge label={c.status} tone={contributionStatusTone(c.status)} />
                  {canRecord && !locked && (
                    <RecordPaymentSheet
                      eventId={eventId}
                      contributions={contributions}
                      defaultContributionId={c.id}
                      onSubmit={onRecord}
                      trigger={
                        <Button variant="outline" size="sm" className="h-9 rounded-xl">
                          Pay
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
