import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarCheck,
  ChevronRight,
  IndianRupee,
  Package,
  ReceiptText,
  Users,
  type LucideIcon,
} from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { useAuth } from "@/context/AuthContext";
import { isStaffRole } from "@/lib/permissions";
import { PERMISSIONS, ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/reports/")({
  head: () => ({
    meta: [
      { title: "Reports — Society Management" },
      { name: "description", content: "Financial, contribution, expense, inventory and attendance reports for Green Valley Society." },
      { property: "og:title", content: "Reports — Society Management" },
      { property: "og:description", content: "Society reports and statements built from live society data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsIndexPage,
});

interface ReportEntry {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const STAFF_REPORTS: ReportEntry[] = [
  {
    id: "financial",
    label: "Event financial report",
    description: "Expected, collected, extra, pending, expenses and balance per event.",
    icon: IndianRupee,
  },
  {
    id: "contributions",
    label: "Member contributions",
    description: "House-wise required, paid, extra and pending contributions.",
    icon: Users,
  },
  {
    id: "expenses",
    label: "Expense report",
    description: "Every expense by category, event and date with totals.",
    icon: ReceiptText,
  },
  {
    id: "inventory",
    label: "Inventory report",
    description: "Total, available, issued, damaged and missing stock per item.",
    icon: Package,
  },
  {
    id: "attendance",
    label: "Meeting attendance",
    description: "Present, absent and attendance percentage per meeting.",
    icon: CalendarCheck,
  },
];

const MEMBER_REPORTS: ReportEntry[] = [
  {
    id: "contributions",
    label: "My contributions",
    description: "Your required, paid, extra and pending contributions per event.",
    icon: Users,
  },
];

function ReportsIndexPage() {
  const { user, can } = useAuth();

  if (!user) {
    return (
      <ProtectedPage title="Reports" subtitle="Society reports and statements" showBack>
        <LoadingState rows={3} />
      </ProtectedPage>
    );
  }

  const staff = isStaffRole(user.role);
  const hasReportView = can(PERMISSIONS.REPORT_VIEW);
  const hasContributionView = can(PERMISSIONS.CONTRIBUTION_VIEW);
  const reports = hasReportView ? STAFF_REPORTS : hasContributionView ? MEMBER_REPORTS : [];

  return (
    <ProtectedPage title="Reports" subtitle="Society reports and statements" showBack>
      {reports.length === 0 ? (
        <EmptyState
          title="No reports available"
          description="Your role does not include report access. Please contact the society admin."
        />
      ) : (
        <ul className="space-y-2">
          {reports.map((report) => (
            <li key={report.id}>
              <Link
                to="/reports/$report"
                params={{ report: report.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <report.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{report.label}</span>
                  <span className="block text-xs text-muted-foreground">{report.description}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ProtectedPage>
  );
}
