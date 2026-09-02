import { createFileRoute } from "@tanstack/react-router";
import { Bell, Pencil, Plus, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { NoticeFormSheet } from "@/features/notices/NoticeFormSheet";
import { formatDate } from "@/lib/format";
import { noticeService, type NoticeInput } from "@/services/noticeService";
import {
  NOTICE_PRIORITIES,
  NOTICE_STATUSES,
  PERMISSIONS,
  type Notice,
} from "@/types/domain";

export const Route = createFileRoute("/notices")({
  head: () => ({
    meta: [
      { title: "Notices — Green Valley Society" },
      { name: "description", content: "Society notices and circulars with important announcements." },
      { property: "og:title", content: "Notices — Green Valley Society" },
      { property: "og:description", content: "Water supply, parking and maintenance announcements for residents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NoticesPage,
});

function toInput(notice: Notice): NoticeInput {
  return {
    title: notice.title,
    message: notice.message,
    priority: notice.priority,
    publishDate: notice.publishDate,
    expiryDate: notice.expiryDate,
  };
}

function NoticesPage() {
  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_NOTICES);
  const [notices, setNotices] = useState<Notice[] | null>(null);

  const load = useCallback(async () => {
    setNotices(await noticeService.listNotices(canManage ? {} : { publishedOnly: true }));
  }, [canManage]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ProtectedPage
      title="Notices"
      subtitle="Society notices and circulars"
      showBack
      headerAction={<NotificationBell />}
    >
      <div className="space-y-3">
        {canManage && (
          <NoticeFormSheet
            onSubmit={async (values, publish) => {
              const res = await noticeService.createNotice(values, publish);
              if (!res.ok) {
                toast.error(res.error ?? "Could not save notice");
                return false;
              }
              toast.success(publish ? "Notice published — members notified" : "Notice saved as draft");
              await load();
              return true;
            }}
            trigger={
              <Button className="h-12 w-full rounded-xl">
                <Plus className="mr-2 h-4 w-4" /> New notice
              </Button>
            }
          />
        )}

        {notices === null ? (
          <LoadingState rows={3} />
        ) : notices.length === 0 ? (
          <EmptyState icon={Bell} title="No notices" description="Published notices appear here." />
        ) : (
          <ul className="space-y-2">
            {notices.map((notice) => (
              <li key={notice.id} className="space-y-2 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start gap-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {notice.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Published {formatDate(notice.publishDate)} • Expires {formatDate(notice.expiryDate)}
                    </span>
                  </span>
                  <StatusBadge
                    label={notice.priority === NOTICE_PRIORITIES.IMPORTANT ? "IMPORTANT" : "NORMAL"}
                    tone={notice.priority === NOTICE_PRIORITIES.IMPORTANT ? "danger" : "neutral"}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{notice.message}</p>

                {canManage && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <StatusBadge
                      label={notice.status}
                      tone={notice.status === NOTICE_STATUSES.PUBLISHED ? "success" : "warning"}
                    />
                    <NoticeFormSheet
                      title="Edit notice"
                      initial={toInput(notice)}
                      showPublishToggle={false}
                      onSubmit={async (values) => {
                        const res = await noticeService.updateNotice(notice.id, values);
                        if (!res.ok) {
                          toast.error(res.error ?? "Could not update notice");
                          return false;
                        }
                        toast.success("Notice updated");
                        await load();
                        return true;
                      }}
                      trigger={
                        <Button variant="outline" size="sm" className="h-9 rounded-xl">
                          <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                        </Button>
                      }
                    />
                    {notice.status === NOTICE_STATUSES.DRAFT && (
                      <Button
                        size="sm"
                        className="h-9 rounded-xl"
                        onClick={async () => {
                          const res = await noticeService.publishNotice(notice.id);
                          if (!res.ok) {
                            toast.error(res.error ?? "Could not publish notice");
                            return;
                          }
                          toast.success("Notice published — members notified");
                          await load();
                        }}
                      >
                        <Send className="mr-1.5 h-3.5 w-3.5" /> Publish
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedPage>
  );
}
