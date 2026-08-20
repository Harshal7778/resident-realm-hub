import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/domain";

interface ProtectedPageProps {
  title: string;
  subtitle?: string;
  roles?: Role[];
  showBack?: boolean;
  headerAction?: ReactNode;
  hideBottomNav?: boolean;
  children: ReactNode;
}

export function ProtectedPage({
  title,
  subtitle,
  roles,
  showBack,
  headerAction,
  hideBottomNav,
  children,
}: ProtectedPageProps) {
  const { user, isReady, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isReady && !isAuthenticated) navigate({ to: "/login", replace: true });
  }, [isReady, isAuthenticated, navigate]);

  if (!isReady || !user) {
    return (
      <MobileShell>
        <AppHeader title={title} subtitle={subtitle} />
        <main className="flex-1 p-4">
          <LoadingState />
        </main>
      </MobileShell>
    );
  }

  const allowed = !roles || roles.includes(user.role);

  return (
    <MobileShell>
      <AppHeader title={title} subtitle={subtitle} showBack={showBack} action={headerAction} />
      <main className="flex-1 px-4 py-4 pb-6">
        {allowed ? (
          children
        ) : (
          <EmptyState
            icon={ShieldAlert}
            title="You don't have access"
            description="This section is restricted to society committee roles."
            action={
              <Button className="mt-2 h-11" onClick={() => navigate({ to: "/dashboard" })}>
                Back to home
              </Button>
            }
          />
        )}
      </main>
      {!hideBottomNav && <BottomNavigation role={user.role} />}
    </MobileShell>
  );
}
