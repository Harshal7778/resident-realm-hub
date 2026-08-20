import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: ReactNode;
}

export function AppHeader({ title, subtitle, showBack, action }: AppHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex min-h-14 items-center gap-2 border-b border-border bg-background px-2 py-2">
      {showBack && (
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.history.back()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <div className={showBack ? "min-w-0 flex-1" : "min-w-0 flex-1 px-2"}>
        <h1 className="truncate text-base font-semibold leading-tight text-foreground">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
