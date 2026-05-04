"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@multica/core/api";
import { useAuthStore } from "@multica/core/auth";
import { useAppI18n } from "@multica/core/i18n";
import { useNavigation } from "@multica/views/navigation";
import { useCurrentWorkspace, paths } from "@multica/core/paths";
import type { QuestionnaireAnswers } from "@multica/core/onboarding";
import { pinKeys } from "@multica/core/pins";
import { projectKeys } from "@multica/core/projects";
import { issueKeys } from "@multica/core/issues/queries";
import {
  memberListOptions,
  workspaceKeys,
} from "@multica/core/workspace/queries";
import { Button } from "@multica/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@multica/ui/components/ui/dialog";
import { buildImportPayload } from "../utils/starter-content-templates";

export function StarterContentPrompt() {
  const { t } = useAppI18n();
  const workspace = useCurrentWorkspace();
  const user = useAuthStore((s) => s.user);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const { push } = useNavigation();
  const qc = useQueryClient();

  const [submitting, setSubmitting] = useState<"import" | "dismiss" | null>(
    null,
  );

  const { data: members = [] } = useQuery({
    ...memberListOptions(workspace?.id ?? ""),
    enabled: !!workspace?.id,
  });
  const isSoloMember =
    members.length === 1 && members[0]?.user_id === user?.id;

  const shouldShow =
    !!user &&
    !!workspace &&
    user.onboarded_at != null &&
    user.starter_content_state == null &&
    isSoloMember;

  if (!shouldShow || !workspace || !user) return null;

  const onImport = async () => {
    if (submitting) return;
    setSubmitting("import");
    try {
      const questionnaire = mergeQuestionnaire(user.onboarding_questionnaire);
      const payload = buildImportPayload({
        workspaceId: workspace.id,
        userName: user.name || user.email,
        questionnaire,
      });
      const result = await api.importStarterContent(payload);

      await Promise.all([
        qc.invalidateQueries({ queryKey: pinKeys.all(workspace.id, user.id) }),
        qc.invalidateQueries({ queryKey: projectKeys.all(workspace.id) }),
        qc.invalidateQueries({ queryKey: issueKeys.all(workspace.id) }),
        qc.invalidateQueries({ queryKey: workspaceKeys.agents(workspace.id) }),
      ]);

      await refreshMe();

      toast.success(t("onboarding", "starterTasksAdded"));

      if (result.welcome_issue_id) {
        push(
          paths.workspace(workspace.slug).issueDetail(result.welcome_issue_id),
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("onboarding", "importFailed"),
      );
      setSubmitting(null);
    }
  };

  const onDismiss = async () => {
    if (submitting) return;
    setSubmitting("dismiss");
    try {
      await api.dismissStarterContent({ workspace_id: workspace.id });
      await refreshMe();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("onboarding", "couldNotDismiss"),
      );
      setSubmitting(null);
    }
  };

  return (
    <Dialog
      open
      disablePointerDismissal
      onOpenChange={(_open, eventDetails) => {
        eventDetails.cancel();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-balance font-serif text-[22px] leading-[1.2] font-medium tracking-tight">
            {t("onboarding", "welcomeAddStarterTasks")}
          </DialogTitle>
          <DialogDescription className="pt-2 text-[14px] leading-[1.55]">
            A{" "}
            <span className="font-medium text-foreground">
              {t("onboarding", "gettingStarted")}
            </span>{" "}
            project with short tasks that walk through how agents, issues,
            and context work in Multica.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 gap-2 sm:justify-end">
          <Button
            variant="ghost"
            onClick={onDismiss}
            disabled={submitting !== null}
          >
            {submitting === "dismiss" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {t("onboarding", "startBlankWorkspace")}
          </Button>
          <Button onClick={onImport} disabled={submitting !== null}>
            {submitting === "import" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {t("onboarding", "addStarterTasks")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function mergeQuestionnaire(
  raw: Record<string, unknown>,
): QuestionnaireAnswers {
  const empty: QuestionnaireAnswers = {
    team_size: null,
    team_size_other: null,
    role: null,
    role_other: null,
    use_case: null,
    use_case_other: null,
  };
  return { ...empty, ...(raw as Partial<QuestionnaireAnswers>) };
}
