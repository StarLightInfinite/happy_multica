import type { TaskFailureReason } from "@multica/core/types";

export const failureReasonKeys: Record<TaskFailureReason, string> = {
  agent_error: "executionError",
  timeout: "taskTimedOut",
  runtime_offline: "daemonOffline",
  runtime_recovery: "daemonRestarted",
  manual: "cancelledByUser",
};

export function getFailureReasonLabel(
  t: (section: "agents", key: string) => string,
  reason: TaskFailureReason,
): string {
  const key = failureReasonKeys[reason];
  return key ? t("agents", key) : reason;
}
