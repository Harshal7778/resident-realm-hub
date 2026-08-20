import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Centers the app inside a phone-sized column on larger screens. */
export function MobileShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen w-full bg-muted/40">
      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background shadow-sm md:my-0 md:min-h-screen",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
