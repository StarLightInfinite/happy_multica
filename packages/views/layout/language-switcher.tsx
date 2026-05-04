"use client";

import { useAppI18n } from "@multica/core/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@multica/ui/components/ui/dropdown-menu";
import { Check, Globe } from "lucide-react";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  zh: "中文",
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useAppI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
        <Globe className="size-3.5" />
        <span className="sr-only">Switch language</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {(["zh", "en"] as const).map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLocale(l)}
            className="flex items-center justify-between"
          >
            {LOCALE_LABELS[l]}
            {locale === l && <Check className="size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
