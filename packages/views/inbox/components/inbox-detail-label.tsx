"use client";

import { STATUS_CONFIG, PRIORITY_CONFIG } from "@multica/core/issues/config";
import { useActorName } from "@multica/core/workspace/hooks";
import { useAppI18n } from "@multica/core/i18n";
import { StatusIcon, PriorityIcon } from "../../issues/components";
import type { InboxItem, IssueStatus, IssuePriority } from "@multica/core/types";
import { getQuickCreateFailureDetail } from "./inbox-display";

export function useTypeLabels() {
  const { t } = useAppI18n();
  return {
    issue_assigned: t("inbox", "assigned"),
    unassigned: t("inbox", "unassigned"),
    assignee_changed: t("inbox", "assigneeChanged"),
    status_changed: t("inbox", "statusChanged"),
    priority_changed: t("inbox", "priorityChanged"),
    due_date_changed: t("inbox", "dueDateChanged"),
    new_comment: t("inbox", "newComment"),
    mentioned: t("inbox", "mentioned"),
    review_requested: t("inbox", "reviewRequested"),
    task_completed: t("inbox", "taskCompleted"),
    task_failed: t("inbox", "taskFailed"),
    agent_blocked: t("inbox", "agentBlocked"),
    agent_completed: t("inbox", "agentCompleted"),
    reaction_added: t("inbox", "reacted"),
    quick_create_done: t("inbox", "quickCreateDone"),
    quick_create_failed: t("inbox", "quickCreateFailed"),
  };
}

function shortDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function InboxDetailLabel({ item }: { item: InboxItem }) {
  const { t } = useAppI18n();
  const { getActorName } = useActorName();
  const typeLabels = useTypeLabels();
  const details = item.details ?? {};

  switch (item.type) {
    case "status_changed": {
      if (!details.to) return <span>{typeLabels[item.type]}</span>;
      const label = STATUS_CONFIG[details.to as IssueStatus]?.label ?? details.to;
      return (
        <span className="inline-flex items-center gap-1">
          {t("inbox", "setStatusTo")}
          <StatusIcon status={details.to as IssueStatus} className="h-3 w-3" />
          {label}
        </span>
      );
    }
    case "priority_changed": {
      if (!details.to) return <span>{typeLabels[item.type]}</span>;
      const label = PRIORITY_CONFIG[details.to as IssuePriority]?.label ?? details.to;
      return (
        <span className="inline-flex items-center gap-1">
          {t("inbox", "setPriorityTo")}
          <PriorityIcon priority={details.to as IssuePriority} className="h-3 w-3" />
          {label}
        </span>
      );
    }
    case "issue_assigned": {
      if (details.new_assignee_id) {
        return <span>{t("inbox", "assignedTo").replace("{name}", getActorName(details.new_assignee_type ?? "member", details.new_assignee_id))}</span>;
      }
      return <span>{typeLabels[item.type]}</span>;
    }
    case "unassigned":
      return <span>{t("inbox", "removedAssignee")}</span>;
    case "assignee_changed": {
      if (details.new_assignee_id) {
        return <span>{t("inbox", "assignedTo").replace("{name}", getActorName(details.new_assignee_type ?? "member", details.new_assignee_id))}</span>;
      }
      return <span>{typeLabels[item.type]}</span>;
    }
    case "due_date_changed": {
      if (details.to) return <span>{t("inbox", "setDueDateTo").replace("{date}", shortDate(details.to))}</span>;
      return <span>{t("inbox", "removedDueDate")}</span>;
    }
    case "new_comment": {
      if (item.body) return <span>{item.body}</span>;
      return <span>{typeLabels[item.type]}</span>;
    }
    case "reaction_added": {
      const emoji = details.emoji;
      if (emoji) return <span>{t("inbox", "reactedToComment").replace("{emoji}", emoji)}</span>;
      return <span>{typeLabels[item.type]}</span>;
    }
    case "quick_create_done": {
      const identifier = details.identifier;
      if (identifier) return <span>{t("inbox", "createdWithAgent").replace("{identifier}", identifier)}</span>;
      return <span>{typeLabels[item.type]}</span>;
    }
    case "quick_create_failed": {
      const detail = getQuickCreateFailureDetail(item);
      if (detail) return <span>{t("inbox", "failed").replace("{detail}", detail)}</span>;
      return <span>{typeLabels[item.type]}</span>;
    }
    default:
      return <span>{typeLabels[item.type] ?? item.type}</span>;
  }
}
