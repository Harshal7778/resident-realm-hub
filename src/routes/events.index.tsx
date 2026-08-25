import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { FilterChips } from "@/components/common/FilterChips";
import { LoadingState } from "@/components/common/LoadingState";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { EventFormSheet } from "@/features/events/EventFormSheet";
import { eventStatusTone } from "@/features/events/status";
import { useAuth } from "@/context/AuthContext";
import { formatDateRange, formatINR } from "@/lib/format";
import { eventService } from "@/services/eventService";
import { PERMISSIONS, type SocietyEvent } from "@/types/domain";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — Society Management" },
      { name: "description", content: "Society events, contributions and collection progress for Green Valley Society." },
      { property: "og:title", content: "Events — Society Management" },
      { property: "og:description", content: "Track Diwali, Holi and annual function contributions in one place." },
    ],
  }),
  component: EventsPage,
});

const filters = [
  { value: "all", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "CLOSED", label: "Closed" },
];

function EventsPage() {
  const { can } = useAuth();
  const [events, setEvents] = useState<SocietyEvent[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setEvents(await eventService.listEvents());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => {
    if (!events) return [];
    const q = query.trim().toLowerCase();
    return events.filter((event) => {
      if (filter !== "all" && event.status !== filter) return false;
      if (!q) return true;
      return event.name.toLowerCase().includes(q) || event.type.toLowerCase().includes(q);
    });
  }, [events, query, filter]);

  const canCreate = can(PERMISSIONS.MANAGE_EVENTS);

  return (
    <ProtectedPage title="Events" subtitle="Society events and contributions">
      <div className="space-y-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search event name or type" />
        <FilterChips options={filters} value={filter} onChange={setFilter} />

        {canCreate && (
          <EventFormSheet
            onSubmit={async (values) => {
              const res = await eventService.createEvent(values);
              if (!res.ok) {
                toast.error(res.error ?? "Could not create event");
                return false;
              }
              toast.success(`${res.data?.name} created with contribution records`);
              await load();
              return true;
            }}
            trigger={
              <Button className="h-12 w-full rounded-xl">
                <Plus className="mr-2 h-4 w-4" /> Create event
              </Button>
            }
          />
        )}

        {events === null ? (
          <LoadingState rows={3} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No events found"
            description="Try a different search or filter."
          />
        ) : (
          <ul className="space-y-2">
            {rows.map((event) => (
              <li key={event.id}>
                <Link
                  to="/events/$id"
                  params={{ id: event.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{event.name}</span>
                      <StatusBadge label={event.status} tone={eventStatusTone(event.status)} />
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {event.type} • {formatDateRange(event.startDate, event.endDate)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Standard contribution {formatINR(event.standardContribution)}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedPage>
  );
}
