"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  Loader2,
  Server,
  ShieldAlert,
  Terminal,
  Wrench,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceId } from "@multica/core/hooks";
import { runtimeKeys } from "@multica/core/runtimes/queries";
import { useWSEvent } from "@multica/core/realtime";
import { paths, useWorkspaceSlug } from "@multica/core/paths";
import { useAppI18n } from "@multica/core/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@multica/ui/components/ui/dialog";
import { Button } from "@multica/ui/components/ui/button";
import { useNavigation } from "../../navigation";

type Step = "instructions" | "waiting" | "success";

export function ConnectRemoteDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("instructions");
  const [copied, setCopied] = useState<string | null>(null);
  const wsId = useWorkspaceId();
  const slug = useWorkspaceSlug();
  const qc = useQueryClient();
  const navigation = useNavigation();
  const newRuntimeIdRef = useRef<string | null>(null);

  // Listen for a new runtime registration while the dialog is open
  const handleDaemonRegister = useCallback(
    (payload: unknown) => {
      if (step === "waiting" || step === "instructions") {
        qc.invalidateQueries({ queryKey: runtimeKeys.all(wsId) });
        const p = payload as Record<string, unknown> | null;
        if (p?.runtime_id && typeof p.runtime_id === "string") {
          newRuntimeIdRef.current = p.runtime_id;
        }
        setStep("success");
      }
    },
    [step, qc, wsId],
  );
  useWSEvent("daemon:register", handleDaemonRegister);

  const copyToClipboard = useCallback(
    (text: string, key: string) => {
      navigator.clipboard.writeText(text);
      setCopied(key);
    },
    [],
  );

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleGoToAgents = () => {
    onClose();
    if (slug) {
      navigation.push(paths.workspace(slug).agents());
    }
  };

  const handleGoToRuntime = () => {
    onClose();
    if (slug && newRuntimeIdRef.current) {
      navigation.push(
        paths.workspace(slug).runtimeDetail(newRuntimeIdRef.current),
      );
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-xl">
        {step === "instructions" && (
          <InstructionsStep
            copied={copied}
            onCopy={copyToClipboard}
            onNext={() => setStep("waiting")}
            onClose={onClose}
          />
        )}
        {step === "waiting" && (
          <WaitingStep onBack={() => setStep("instructions")} />
        )}
        {step === "success" && (
          <SuccessStep
            onGoToAgents={handleGoToAgents}
            onGoToRuntime={
              newRuntimeIdRef.current ? handleGoToRuntime : undefined
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Installation instructions
// ---------------------------------------------------------------------------

const INSTALL_CMD = "curl -fsSL https://raw.githubusercontent.com/multica-ai/multica/main/scripts/install.sh | bash";

const CONFIGURE_CMD = `multica config set server_url https://api.multica.ai
multica config set app_url https://multica.ai`;

const LOGIN_CMD = "multica login --token <YOUR_TOKEN>";

const START_CMD = `multica daemon start --device-name "my-ec2-instance"
multica daemon status`;

function CodeBlock({
  code,
  copyKey,
  copied,
  onCopy,
}: {
  code: string;
  copyKey: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const isCopied = copied === copyKey;
  return (
    <div className="relative rounded-md border bg-muted/50">
      <pre className="overflow-x-auto p-2.5 pr-10 font-mono text-xs leading-relaxed text-foreground">
        {code}
      </pre>
      <button
        type="button"
        onClick={() => onCopy(code, copyKey)}
        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded border bg-background text-muted-foreground transition-colors hover:text-foreground"
      >
        {isCopied ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}

function InstructionsStep({
  copied,
  onCopy,
  onNext,
  onClose,
}: {
  copied: string | null;
  onCopy: (text: string, key: string) => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const { t } = useAppI18n();

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("runtimes", "connectRemoteTitle")}</DialogTitle>
        <DialogDescription>
          {t("runtimes", "connectRemoteDesc")}
        </DialogDescription>
      </DialogHeader>

      <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4">
        <div className="space-y-3">
          {/* Step 1: Install */}
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              1. {t("runtimes", "installCli")}
            </div>
            <CodeBlock
              code={INSTALL_CMD}
              copyKey="install"
              copied={copied}
              onCopy={onCopy}
            />
          </div>

          {/* Step 2: Configure */}
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Server className="h-3.5 w-3.5" />
              2. {t("runtimes", "configure")}
            </div>
            <CodeBlock
              code={CONFIGURE_CMD}
              copyKey="config"
              copied={copied}
              onCopy={onCopy}
            />
          </div>

          {/* Step 3: Login */}
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              3. {t("runtimes", "loginWithToken")}
            </div>
            <CodeBlock
              code={LOGIN_CMD}
              copyKey="login"
              copied={copied}
              onCopy={onCopy}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("runtimes", "settingsTokensHint")}
            </p>
          </div>

          {/* Step 4: Start daemon */}
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              4. {t("runtimes", "startDaemon")}
            </div>
            <CodeBlock
              code={START_CMD}
              copyKey="start"
              copied={copied}
              onCopy={onCopy}
            />
          </div>

          {/* Security tips */}
          <div className="rounded-md border border-warning/30 bg-warning/5 p-2.5">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <div className="text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">{t("runtimes", "securityTip")}: </span>
                {t("runtimes", "securityTipBody")}
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <details className="group pb-1">
            <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              <Wrench className="h-3.5 w-3.5" />
              {t("runtimes", "troubleshooting")}
              <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
            </summary>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-8 text-[11px] text-muted-foreground">
              <li>
                Check status:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                  multica daemon status
                </code>
              </li>
              <li>
                View logs:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                  multica daemon logs -f
                </code>
              </li>
              <li>
                Verify provider:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                  claude --version
                </code>
              </li>
              <li>
                Desktop auto-scans only your local machine. Remote machines must
                run{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                  multica daemon
                </code>{" "}
                separately.
              </li>
            </ul>
          </details>
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          {t("runtimes", "cancel")}
        </Button>
        <Button onClick={onNext}>
          {t("runtimes", "startedDaemon")}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </DialogFooter>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Waiting for registration
// ---------------------------------------------------------------------------

function WaitingStep({ onBack }: { onBack: () => void }) {
  const { t } = useAppI18n();

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("runtimes", "waitingTitle")}</DialogTitle>
        <DialogDescription>
          {t("runtimes", "waitingDesc")}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center gap-3 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Run{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            multica daemon status
          </code>{" "}
          on the remote machine to verify it&apos;s running.
        </p>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onBack}>
          {t("runtimes", "back")}
        </Button>
      </DialogFooter>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Success
// ---------------------------------------------------------------------------

function SuccessStep({
  onGoToAgents,
  onGoToRuntime,
}: {
  onGoToAgents: () => void;
  onGoToRuntime?: () => void;
}) {
  const { t } = useAppI18n();

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("runtimes", "connectedTitle")}</DialogTitle>
        <DialogDescription>
          {t("runtimes", "connectedDesc")}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center gap-3 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <Check className="h-6 w-6 text-success" />
        </div>
      </div>

      <DialogFooter>
        {onGoToRuntime && (
          <Button variant="ghost" onClick={onGoToRuntime}>
            {t("runtimes", "viewRuntime")}
          </Button>
        )}
        <Button onClick={onGoToAgents}>
          {t("runtimes", "createAgent")}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </DialogFooter>
    </>
  );
}
