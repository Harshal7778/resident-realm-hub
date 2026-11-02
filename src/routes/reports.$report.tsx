import { createFileRoute, useParams } from "@tanstack/react-router";

import { EmptyState } from "@/components/common/EmptyState";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { useAuth } from "@/context/AuthContext";
import { AttendanceReport } from "@/features/reports/AttendanceReport";
import { ContributionReport } from "@/features/reports/ContributionReport";
import { ExpenseReport } from "@/features/reports/ExpenseReport";
import { FinancialReport } from "@/features/reports/FinancialReport";
import { InventoryReport } from "@/features/reports/InventoryReport";
import { PERMISSIONS } from "@/types/domain";

export const Route = createFileRoute("/reports/$report")({
  head: () => ({
    meta: [
      { title: "Report — Society Management" },
      { name: "description", content: "Society report built from live society data." },
      { property: "og:title", content: "Report — Society Management" },
      { property: "og:description", content: "Society report built from live society data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportDetailPage,
});

const META: Record<string, { title: string; subtitle: string }> = {
  financial: { title: "Financial report", subtitle: "Event collections, expenses and balance" },
  contributions: { title: "Contributions report", subtitle: "House-wise contribution status" },
  expenses: { title: "Expense report", subtitle: "All recorded event expenses" },
  inventory: { title: "Inventory report", subtitle: "Stock position for every item" },
  attendance: { title: "Attendance report", subtitle: "Meeting attendance summaries" },
};

function ReportDetailPage() {
  const { report } = useParams({ from: "/reports/$report" });
  const { user, can } = useAuth();

  const meta = META[report];
  const fullAccess = can(PERMISSIONS.REPORT_VIEW);
  const allowed = !!meta && (fullAccess || (report === "contributions" && can(PERMISSIONS.CONTRIBUTION_VIEW)));

  return (
    <ProtectedPage title={allowed ? meta.title : "Report"} subtitle={allowed ? meta.subtitle : undefined} showBack>
      {!meta ? (
        <EmptyState title="Report not found" description="The report you opened does not exist." />
      ) : !allowed ? (
        <EmptyState
          title="You don't have access"
          description="Your role does not include report access. Please contact the society admin."
        />
      ) : report === "financial" ? (
        <FinancialReport />
      ) : report === "contributions" ? (
        <ContributionReport fullAccess={fullAccess} houseNumber={user?.houseNumber ?? ""} />
      ) : report === "expenses" ? (
        <ExpenseReport />
      ) : report === "inventory" ? (
        <InventoryReport />
      ) : (
        <AttendanceReport />
      )}
    </ProtectedPage>
  );
}
