import { CONTRIBUTION_STATUSES, EVENT_STATUSES, type ContributionStatus, type EventStatus } from "@/types/domain";

type Tone = "success" | "warning" | "danger" | "neutral" | "info";

export function eventStatusTone(status: EventStatus): Tone {
  if (status === EVENT_STATUSES.ACTIVE) return "success";
  if (status === EVENT_STATUSES.CLOSED) return "neutral";
  return "info";
}

export function contributionStatusTone(status: ContributionStatus): Tone {
  if (status === CONTRIBUTION_STATUSES.PAID) return "success";
  if (status === CONTRIBUTION_STATUSES.PARTIAL) return "warning";
  return "danger";
}
