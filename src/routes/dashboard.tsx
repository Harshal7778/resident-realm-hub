import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { LoadingState } from "@/components/common/LoadingState";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { useAuth } from "@/context/AuthContext";
import { AdminDashboard } from "@/features/dashboard/AdminDashboard";
import { MemberDashboard } from "@/features/dashboard/MemberDashboard";
import { isStaffRole } from "@/lib/permissions";
import { memberService } from "@/services/memberService";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Home — Society Management" },
      { name: "description", content: "Your society dashboard: events, contributions, meetings and notices." },
      { property: "og:title", content: "Home — Society Management" },
      { property: "og:description", content: "A quick overview of your Green Valley Society activity." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    memberService.listMembers().then((members) => {
      if (active) setMemberCount(members.length);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ProtectedPage title="Home" subtitle="Green Valley Society">
      {user &&
        (isStaffRole(user.role) ? (
          memberCount === null ? (
            <LoadingState rows={4} />
          ) : (
            <AdminDashboard user={user} memberCount={memberCount} />
          )
        ) : (
          <MemberDashboard user={user} />
        ))}
    </ProtectedPage>
  );
}
