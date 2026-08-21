import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { FilterChips } from "@/components/common/FilterChips";
import { LoadingState } from "@/components/common/LoadingState";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { MemberFormSheet } from "@/features/members/MemberFormSheet";
import { ROLE_LABEL } from "@/lib/permissions";
import { memberService } from "@/services/memberService";
import { ROLES, type House, type Member, type Role } from "@/types/domain";

export const Route = createFileRoute("/members/")({
  head: () => ({
    meta: [
      { title: "Members — Society Management" },
      { name: "description", content: "Directory of Green Valley Society houses and members." },
      { property: "og:title", content: "Members — Society Management" },
      { property: "og:description", content: "Search, add and manage the 25 houses of Green Valley Society." },
    ],
  }),
  component: MembersPage,
});

const STAFF_ROLES: Role[] = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.TREASURER];

const filters = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "committee", label: "Committee" },
];

function MembersPage() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    const [m, h] = await Promise.all([memberService.listMembers(), memberService.listHouses()]);
    setMembers(m);
    setHouses(h);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
        if (filter === "committee" && member.role === ROLES.MEMBER) return false;
        if (!q) return true;
        return (
          member.name.toLowerCase().includes(q) ||
          houseNumber.toLowerCase().includes(q) ||
          member.mobileNumbers.some((n) => n.number.includes(q))
        );
      })
      .sort((a, b) => a.houseNumber.localeCompare(b.houseNumber));
  }, [members, houses, query, filter]);

  return (
    <ProtectedPage
      title="Members"
      subtitle={members ? `${members.length} houses` : "Loading…"}
      roles={STAFF_ROLES}
      showBack
    >
      <div className="space-y-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search name, house or mobile" />
        <FilterChips options={filters} value={filter} onChange={setFilter} />

        <MemberFormSheet
          title="Add member"
          submitLabel="Add member"
          withMobiles
          onSubmit={async (values) => {
            const res = await memberService.createMember(values);
            if (!res.ok) {
              toast.error(res.error ?? "Could not add member");
              return false;
            }
            toast.success(`${res.data?.name} added`);
            await load();
            return true;
          }}
          trigger={
            <Button className="h-12 w-full rounded-xl">
              <UserPlus className="mr-2 h-4 w-4" /> Add member
            </Button>
          }
        />

        {members === null ? (
          <LoadingState rows={4} />
        ) : rows.length === 0 ? (
          <EmptyState title="No members found" description="Try a different search or filter." />
        ) : (
          <ul className="space-y-2">
            {rows.map(({ member, houseNumber }) => (
              <li key={member.id}>
                <Link
                  to="/members/$id"
                  params={{ id: member.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {houseNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_LABEL[member.role]} • House {houseNumber}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {member.mobileNumbers.map((n) => `+91 ${n.number}`).join(" • ")}
                    </p>
                  </div>
                  <StatusBadge
                    label={member.isActive ? "Active" : "Inactive"}
                    tone={member.isActive ? "success" : "neutral"}
                  />
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
