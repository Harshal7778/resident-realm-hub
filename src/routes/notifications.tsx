import { Link, createFileRoute } from "@tanstack/react-router";
import { BellRing, CheckCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { notificationService } from "@/services/notificationService";
import { type AppNotification } from "@/types/domain";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Green Valley Society" },
      { name: "description", content: "Notices, meeting reminders, payments and event updates in one inbox." },
      { property: "og:title", content: "Notifications — Green Valley Society" },
      { property: "og:description", content: "Your in-app society notification inbox with unread tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const TYPE_LABEL: Record<string, string> = {
  NEW_NOTICE: "New notice",
  MEETING_REMINDER: "Meeting reminder",
  CONTRIBUTION_REMINDER: "Contribution reminder",
  NEW_EVENT: "New event",
  PAYMENT_RECORDED: "Payment recorded",
  INVENTORY_APPROVED: "Inventory approved",
  INVENTORY_ISSUED: "Inventory issued",
  INVENTORY_RETURN_REMINDER: "Return reminder",
  INVENTORY_OVERDUE: "Inventory overdue",
};

function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[] | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setItems(await notificationService.listForUser(user.memberId));
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const unread = (items ?? []).filter((n) => !n.read).length;

  return (
    <ProtectedPage
      title="Notifications"
      subtitle={unread > 0 ? `${unread} unread` : "You're all caught up"}
      showBack
    >
      <div className="space-y-3">
        {unread > 0 && (
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl"
            onClick={async () => {
              if (!user) return;
              await notificationService.markAllAsRead(user.memberId);
              toast.success("All notifications marked as read");
              await load();
            }}
          >
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        )}

        {items === null ? (
          <LoadingState rows={4} />
        ) : items.length === 0 ? (
          <EmptyState icon={BellRing} title="No notifications yet" />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const body = (
                <>
                  <span className="flex items-center gap-2">
                    {!item.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    <span className="truncate text-sm font-semibold text-foreground">{item.title}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{item.message}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {TYPE_LABEL[item.type] ?? item.type} • {relativeTime(item.timestamp)}
                  </span>
                </>
              );
              const className = cn(
                "block w-full rounded-2xl border border-border p-4 text-left transition-colors hover:bg-accent",
                item.read ? "bg-card" : "bg-primary/5",
              );
              const onOpen = async () => {
                if (!item.read) await notificationService.markAsRead(item.id);
                await load();
              };
              return (
                <li key={item.id}>
                  {item.link ? (
                    <Link to={item.link} className={className} onClick={onOpen}>
                      {body}
                    </Link>
                  ) : (
                    <button type="button" className={className} onClick={onOpen}>
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ProtectedPage>
  );
}
