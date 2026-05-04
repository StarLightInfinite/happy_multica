"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@multica/ui/components/ui/button";
import { Input } from "@multica/ui/components/ui/input";
import { Label } from "@multica/ui/components/ui/label";
import { Textarea } from "@multica/ui/components/ui/textarea";
import { useAppI18n } from "@multica/core/i18n";
import { joinCloudWaitlist } from "@multica/core/onboarding";
import { cn } from "@multica/ui/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REASON_MAX = 500;

export function CloudWaitlistExpand({
  submitted,
  onSubmitted,
}: {
  submitted: boolean;
  onSubmitted: () => void;
}) {
  const { t } = useAppI18n();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    !submitted &&
    !submitting &&
    EMAIL_PATTERN.test(email.trim()) &&
    reason.trim().length <= REASON_MAX;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await joinCloudWaitlist(email.trim(), reason.trim());
      toast.success(t("onboarding", "youAreOnTheList"));
      onSubmitted();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("onboarding", "failedJoinWaitlist"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-5">
      <p className="text-[13.5px] leading-[1.55] text-foreground/85">
        {t("onboarding", "cloudRuntimesNotLive")}{" "}
        {t("onboarding", "leaveEmail")}{" "}
        <span className="text-foreground/70">
          {t("onboarding", "headsUpAgentsCantExecute")}
        </span>
      </p>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="waitlist-email"
          className="text-xs font-medium text-muted-foreground"
        >
          {t("onboarding", "email")}
        </Label>
        <Input
          id="waitlist-email"
          type="email"
          autoComplete="email"
          value={email}
          disabled={submitted}
          placeholder={t("onboarding", "enterEmail")}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="waitlist-reason"
          className="text-xs font-medium text-muted-foreground"
        >
          {t("onboarding", "whyCloud")}
          <span className="ml-2 font-normal text-muted-foreground/70">
            {t("onboarding", "optional")}
          </span>
        </Label>
        <Textarea
          id="waitlist-reason"
          value={reason}
          disabled={submitted}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("onboarding", "whyCloudPlaceholder")}
          rows={3}
          maxLength={REASON_MAX}
        />
      </div>

      <div className="flex items-center justify-end">
        <Button size="lg" disabled={submitted || !canSubmit} onClick={submit}>
          <Loader2 className={cn("h-4 w-4 animate-spin", !submitting && "opacity-0")} />
          {submitted ? (
            <>
              <Check className="h-4 w-4" />
              {t("onboarding", "youAreOnTheList")}
            </>
          ) : (
            <>
              {t("onboarding", "joinWaitlist")}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
