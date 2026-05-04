"use client";

import { useState } from "react";
import { ArrowRight, Download, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@multica/ui/components/ui/button";
import { MulticaIcon } from "@multica/ui/components/common/multica-icon";
import { captureDownloadIntent } from "@multica/core/analytics";
import { cn } from "@multica/ui/lib/utils";
import { useAppI18n } from "@multica/core/i18n";
import { DragStrip } from "@multica/views/platform";
import { STATUS_CONFIG } from "@multica/core/issues/config";
import type { IssueStatus } from "@multica/core/types";
import { StatusIcon } from "../../issues/components/status-icon";
import { ProviderLogo } from "../../runtimes/components/provider-logo";

export function StepWelcome({
  onNext,
  onSkip,
  isWeb = false,
}: {
  onNext: () => void | Promise<void>;
  onSkip?: () => void | Promise<void>;
  isWeb?: boolean;
}) {
  const { t } = useAppI18n();
  const [pending, setPending] = useState<"next" | "skip" | null>(null);

  const handleNext = async () => {
    if (pending) return;
    setPending("next");
    try {
      await onNext();
    } finally {
      setPending(null);
    }
  };

  const handleSkip = async () => {
    if (pending || !onSkip) return;
    setPending("skip");
    try {
      await onSkip();
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="animate-onboarding-enter flex h-full min-h-[640px] flex-col lg:flex-row">
      <div className="flex flex-col lg:flex-1">
        <DragStrip />
        <div className="flex flex-1 flex-col justify-center px-6 pb-12 sm:px-10 md:px-20 lg:px-20 xl:px-24">
          <div className="flex w-full max-w-[540px] flex-col gap-8">
            <div className="flex items-center gap-2.5">
              <MulticaIcon className="size-5 text-foreground" noSpin />
              <span className="font-serif text-xl font-medium tracking-tight">
                {t("onboarding", "welcomeToMultica")}
              </span>
            </div>

            <h1 className="text-balance font-serif text-5xl font-medium leading-[1.04] tracking-tight sm:text-6xl">
              {t("onboarding", "aiTeammatesOneWorkspace")}
            </h1>

            <div className="flex flex-col gap-4">
              <p className="text-lg leading-relaxed text-foreground/85">
                {t("onboarding", "assignThemWork")}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {isWeb ? (
                  <>
                    {t("onboarding", "desktopBundlesRuntime")}
                  </>
                ) : (
                  t("onboarding", "byEndRealAgent")
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isWeb ? (
                <>
                  <a
                    href="/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => captureDownloadIntent("welcome")}
                    className={buttonVariants({ size: "lg" })}
                  >
                    <Download className="h-4 w-4" />
                    {t("onboarding", "downloadDesktop")}
                  </a>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleNext}
                    disabled={pending !== null}
                  >
                    {pending === "next" && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {t("onboarding", "continue")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={pending !== null}
                >
                  {pending === "next" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t("onboarding", "startExploring")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {onSkip && (
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={pending !== null}
                >
                  {pending === "skip" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t("onboarding", "iveDoneThisBefore")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden border-l bg-muted/40 lg:flex lg:flex-1 lg:flex-col lg:overflow-hidden">
        <DragStrip />
        <div className="flex flex-1 flex-col items-center justify-center gap-7 px-8 py-8">
          <p className="max-w-[440px] text-balance text-center font-serif text-[15px] italic leading-snug text-muted-foreground">
            {t("onboarding", "everyIssueShared")}
          </p>
          <WelcomeIllustration />
        </div>
      </div>
    </div>
  );
}


function WelcomeIllustration() {
  return (
    <div className="flex w-full max-w-[460px] flex-col gap-3">
      <MockActivityCard
        actor={{ kind: "user", name: "You", initial: "N" }}
        issueId="MCA-42"
        content={
          <>
            <Mention>@Content Agent</Mention> can you draft a short launch
            post? Pull from <Mention>@Research Agent</Mention>&apos;s interview
            findings.
          </>
        }
      />
      <MockActivityCard
        className="-translate-x-5 -rotate-[1.2deg]"
        actor={{ kind: "agent", name: "Content Agent", provider: "codex" }}
        issueId="MCA-42"
        content={
          <>
            On it. Pulling Research&apos;s quotes, drafting around the
            &ldquo;time saved&rdquo; angle…
          </>
        }
        status="in_progress"
      />
      <MockActivityCard
        className="translate-x-8 rotate-[1.6deg]"
        actor={{ kind: "agent", name: "Research Agent", provider: "hermes" }}
        issueId="MCA-38"
        content="This week's user interviews summarized — 12 calls, 4 recurring themes, 3 pull-quotes."
        status="done"
        timestamp="15 min ago"
      />
      <MockActivityCard
        className="-translate-x-6 -rotate-[0.8deg]"
        actor={{ kind: "agent", name: "Review Agent", provider: "openclaw" }}
        issueId="MCA-42"
        content="Reviewed Monday's draft — left 4 notes on tone. Standing by for the new one."
        status="in_review"
      />
      <MockActivityCard
        className="translate-x-6 rotate-[1deg]"
        actor={{ kind: "agent", name: "Coding Agent", provider: "claude" }}
        issueId="MCA-35"
        content={
          <>
            Shipped the export feature <Mention>@you</Mention> flagged.
            Preview link in the PR.
          </>
        }
        status="done"
        timestamp="just now"
      />
    </div>
  );
}

type ProviderName =
  | "claude"
  | "codex"
  | "opencode"
  | "openclaw"
  | "hermes"
  | "kimi"
  | "kiro"
  | "pi"
  | "copilot"
  | "cursor";

type ActivityActor =
  | { kind: "user"; name: string; initial: string }
  | { kind: "agent"; name: string; provider: ProviderName };

function MockActivityCard({
  actor,
  issueId,
  content,
  status,
  timestamp,
  className,
}: {
  actor: ActivityActor;
  issueId: string;
  content: React.ReactNode;
  status?: Extract<IssueStatus, "in_progress" | "done" | "in_review">;
  timestamp?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card px-4 py-3.5 shadow-sm",
        "transition-all duration-200 ease-out will-change-transform",
        "hover:-translate-y-0.5 hover:rotate-0 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <MockAvatar actor={actor} />
          <span className="truncate text-sm font-medium text-foreground">
            {actor.name}
          </span>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
          {issueId}
        </span>
      </div>

      <p className="mt-2.5 text-sm leading-snug text-foreground/85">
        {content}
      </p>

      {status && <StatusFooter status={status} timestamp={timestamp} />}
    </div>
  );
}

function MockAvatar({ actor }: { actor: ActivityActor }) {
  if (actor.kind === "user") {
    return (
      <div
        aria-hidden
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background"
      >
        {actor.initial}
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-muted/40 text-foreground"
    >
      <ProviderLogo provider={actor.provider} className="h-3.5 w-3.5" />
    </div>
  );
}

function StatusFooter({
  status,
  timestamp,
}: {
  status: IssueStatus;
  timestamp?: string;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="mt-3 flex items-center gap-2 text-xs">
      <span
        className={cn("flex items-center gap-1.5 font-medium", cfg.iconColor)}
      >
        <StatusIcon
          status={status}
          className={cn(
            "h-3.5 w-3.5",
            status === "in_progress" && "animate-pulse",
          )}
        />
        {cfg.label}
      </span>
      {timestamp && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{timestamp}</span>
        </>
      )}
    </div>
  );
}

function Mention({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-brand">{children}</span>;
}
