import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { FilterChips } from "@/components/common/FilterChips";
import { LoadingState } from "@/components/common/LoadingState";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { memberService } from "@/services/memberService";
import { ROLES, type House, type Member, type Role } from "@/types/domain";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members — Society Management" },
      { name: "description", content: "Read-only directory of Green Valley Society houses and members." },
      { property: "og:title", content: "Members — Society Management" },
      { property: "og:description", content: "Browse the 25 houses of Green Valley Society." },
    ],
  }),
  component: MembersPage,
});

const STAFF_ROLES: Role[] = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER];

const filters = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function MembersPage() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    Promise.all([memberService.listMembers(), memberService.listHouses()]).then(([m, h]) => {
      if (!active) return;
      setMembers(m);
      setHouses(h);
    });
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (!members) return [];
    const q = query.trim().toLowerCase();
    return members
      .map((member) => ({
        member,
        houseNumber: houses.find((h) => h.id === member.houseId)?.houseNumber ?? "—",
      }))
      .filter(({ member, houseNumber }) => {
        if (filter === "active" && !member.isActive) return false;
        if (filter === "inactive" && member.isActive) return false;
        if (!q) return true;
        return (
          member.name.toLowerCase().includes(q) ||
          houseNumber.toLowerCase().includes(q) ||
          member.mobileNumbers.some((n) => n.number.includes(q))
        );
      });
  }, [members, houses, query, filter]);

  return (
    <ProtectedPage title="Members" subtitle="Read-only directory" roles={STAFF_ROLES} showBack>
      <div className="space-y-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search name, house or mobile" />
        <FilterChips options={filters} value={filter} onChange={setFilter} />

        {members === null ? (
          <LoadingState rows={4} />
        ) : rows.length === 0 ? (
          <EmptyState title="No members found" description="Try a different search or filter." />
        ) : (
          <ul className="space-y-2">
            {rows.map(({ member, houseNumber }) => (
              <li key={member.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">House {houseNumber}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {member.mobileNumbers.map((n) => `+91 ${n.number}`).join(" • ")}
                    </p>
                  </div>
                  <StatusBadge
                    label={member.isActive ? "Active" : "Inactive"}
                    tone={member.isActive ? "success" : "neutral"}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
          Member management actions arrive in the next module.
        </p>
      </div>
    </ProtectedPage>
  );
}
