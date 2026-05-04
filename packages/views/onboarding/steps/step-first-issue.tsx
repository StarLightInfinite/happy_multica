"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@multica/ui/components/ui/button";
import { useAppI18n } from "@multica/core/i18n";
import {
  completeOnboarding,
  type OnboardingCompletionPath,
} from "@multica/core/onboarding";

export function StepFirstIssue({
  onFinished,
  completionPath,
}: {
  onFinished: () => void;
  completionPath: OnboardingCompletionPath;
}) {
  const { t } = useAppI18n();
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const started = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;
  const completionPathRef = useRef(completionPath);
  completionPathRef.current = completionPath;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        await completeOnboarding(completionPathRef.current);
        onFinishedRef.current();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("onboarding", "failedFinishOnboarding"),
        );
      }
    })();
  }, []);

  const retry = async () => {
    if (retrying) return;
    setRetrying(true);
    setError(null);
    try {
      await completeOnboarding(completionPathRef.current);
      onFinishedRef.current();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("onboarding", "retryFailed"));
      toast.error(err instanceof Error ? err.message : t("onboarding", "retryFailed"));
    } finally {
      setRetrying(false);
    }
  };

  if (error) {
    return (
      <div className="animate-onboarding-enter flex w-full flex-col items-center gap-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("onboarding", "somethingWentWrong")}
          </h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={retry} disabled={retrying}>
          {retrying && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("onboarding", "retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-onboarding-enter flex w-full flex-col items-center gap-6 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("onboarding", "finishingUp")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("onboarding", "almostThere")}
        </p>
      </div>
    </div>
  );
}
