import { useAppI18n } from "@multica/core/i18n";

export function RuntimeAsidePanel() {
  const { t } = useAppI18n();

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {t("onboarding", "whatsAgent")}
        </div>
        <p className="text-[14px] leading-[1.6] text-foreground/80">
          A <strong className="font-medium text-foreground">runtime</strong>{" "}
          is a small background process that runs on your machine. It
          connects your workspace to AI coding tools like Claude Code or
          Codex, and executes the tasks your agents pick up.
        </p>
      </section>

      <section>
        <div className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {t("onboarding", "goodToKnow")}
        </div>
        <div className="flex flex-col gap-4">
          <AsideItem
            glyph="↻"
            title={t("onboarding", "swapAnytime")}
            body={t("onboarding", "swapAnytimeBody")}
          />
          <AsideItem
            glyph="∞"
            title={t("onboarding", "addMoreLater")}
            body={t("onboarding", "addMoreLaterBody")}
          />
        </div>
      </section>

      <a
        href="https://multica.ai/docs/daemon-runtimes"
        target="_blank"
        rel="noopener noreferrer"
        className="self-start text-[13px] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        {t("onboarding", "learnAboutRuntimes")}
      </a>
    </div>
  );
}

function AsideItem({
  glyph,
  title,
  body,
}: {
  glyph: string;
  title: string;
  body: string;
}) {
  return (
    <div className="grid grid-cols-[22px_1fr] gap-3">
      <div
        aria-hidden
        className="flex h-[20px] w-[20px] items-center justify-center text-[14px] text-muted-foreground"
      >
        {glyph}
      </div>
      <div className="flex flex-col">
        <div className="text-[13.5px] font-medium text-foreground">{title}</div>
        <div className="mt-1 text-[12.5px] leading-[1.55] text-muted-foreground">
          {body}
        </div>
      </div>
    </div>
  );
}
