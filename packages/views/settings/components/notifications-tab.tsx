"use client";

import { useQuery } from "@tanstack/react-query";
import { useWorkspaceId } from "@multica/core/hooks";
import { useAppI18n } from "@multica/core/i18n";
import { notificationPreferenceOptions } from "@multica/core/notification-preferences/queries";
import { useUpdateNotificationPreferences } from "@multica/core/notification-preferences/mutations";
import type { NotificationGroupKey, NotificationPreferences } from "@multica/core/types";
import { Card, CardContent } from "@multica/ui/components/ui/card";
import { Switch } from "@multica/ui/components/ui/switch";
import { toast } from "sonner";

function useNotificationGroups() {
  const { t } = useAppI18n();
  return [
    {
      key: "assignments" as NotificationGroupKey,
      label: t("settings", "assignments"),
      description: t("settings", "assignmentsDesc"),
    },
    {
      key: "status_changes" as NotificationGroupKey,
      label: t("settings", "statusChanges"),
      description: t("settings", "statusChangesDesc"),
    },
    {
      key: "comments" as NotificationGroupKey,
      label: t("settings", "commentsMentions"),
      description: t("settings", "commentsMentionsDesc"),
    },
    {
      key: "updates" as NotificationGroupKey,
      label: t("settings", "priorityDueDate"),
      description: t("settings", "priorityDueDateDesc"),
    },
    {
      key: "agent_activity" as NotificationGroupKey,
      label: t("settings", "agentActivity"),
      description: t("settings", "agentActivityDesc"),
    },
  ];
}

export function NotificationsTab() {
  const { t } = useAppI18n();
  const wsId = useWorkspaceId();
  const notificationGroups = useNotificationGroups();
  const { data } = useQuery(notificationPreferenceOptions(wsId));
  const mutation = useUpdateNotificationPreferences();

  const preferences = data?.preferences ?? {};

  const handleToggle = (key: NotificationGroupKey, enabled: boolean) => {
    const updated: NotificationPreferences = {
      ...preferences,
      [key]: enabled ? "all" : "muted",
    };
    // Remove keys set to "all" (default) to keep the object clean
    if (enabled) {
      delete updated[key];
    }
    mutation.mutate(updated, {
      onError: () => toast.error(t("settings", "failedToUpdateNotificationSettings")),
    });
  };

  return (
    <div className="space-y-4">
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">{t("settings", "inboxNotifications")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("settings", "inboxNotificationsDesc")}
          </p>
        </div>

        <Card>
          <CardContent className="divide-y">
            {notificationGroups.map((group) => {
              const enabled = preferences[group.key] !== "muted";
              return (
                <div
                  key={group.key}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5 pr-4">
                    <p className="text-sm font-medium">{group.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) =>
                      handleToggle(group.key, checked)
                    }
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
