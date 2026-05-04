"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { runtimeModelsOptions } from "@multica/core/runtimes";
import { Input } from "@multica/ui/components/ui/input";
import { useAppI18n } from "@multica/core/i18n";
import {
  PickerItem,
  PropertyPicker,
} from "../../../issues/components/pickers";
import { CHIP_CLASS } from "./chip";

export function ModelPicker({
  runtimeId,
  runtimeOnline,
  value,
  canEdit = true,
  onChange,
}: {
  runtimeId: string | null;
  runtimeOnline: boolean;
  value: string;
  canEdit?: boolean;
  onChange: (next: string) => Promise<void> | void;
}) {
  const { t } = useAppI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const modelsQuery = useQuery(
    runtimeModelsOptions(runtimeOnline ? runtimeId : null),
  );
  const supported = modelsQuery.data?.supported ?? true;
  const models = useMemo(
    () => modelsQuery.data?.models ?? [],
    [modelsQuery.data],
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return models;
    return models.filter(
      (m) =>
        m.id.toLowerCase().includes(s) || m.label.toLowerCase().includes(s),
    );
  }, [models, search]);

  const trimmedSearch = search.trim();
  const exactMatch = models.some(
    (m) => m.id === trimmedSearch || m.label === trimmedSearch,
  );
  const canCreate = trimmedSearch.length > 0 && !exactMatch;

  const select = async (id: string) => {
    setOpen(false);
    setSearch("");
    if (id !== value) await onChange(id);
  };

  if (!supported && !modelsQuery.isLoading) {
    return (
      <span className="truncate italic text-muted-foreground">
        {t("agents", "managedByRuntime")}
      </span>
    );
  }

  const triggerLabel = value || t("agents", "defaultModel");
  const triggerTitle = `Model · ${triggerLabel}`;

  if (!canEdit) {
    return (
      <span
        className="min-w-0 truncate px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
        title={triggerTitle}
      >
        {triggerLabel}
      </span>
    );
  }

  return (
    <PropertyPicker
      open={open}
      onOpenChange={setOpen}
      width="w-auto min-w-[16rem] max-w-md"
      align="start"
      tooltip={triggerTitle}
      triggerRender={
        <button
          type="button"
          className={CHIP_CLASS}
          aria-label={triggerTitle}
        />
      }
      trigger={
        <span className="min-w-0 truncate font-mono text-[11px]">
          {triggerLabel}
        </span>
      }
      header={
        <div className="p-1.5">
          <Input
            autoFocus
            placeholder={t("agents", "searchModel")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
      }
    >
      {modelsQuery.isLoading && (
        <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t("agents", "discoveringModels")}
        </div>
      )}

      {!modelsQuery.isLoading &&
        filtered.map((m) => (
          <PickerItem
            key={m.id}
            selected={m.id === value}
            onClick={() => void select(m.id)}
            tooltip={m.label !== m.id ? `${m.label} · ${m.id}` : m.id}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-medium">{m.label}</span>
                {m.default && (
                  <span className="shrink-0 rounded bg-primary/10 px-1 text-[10px] font-medium text-primary">
                    {t("agents", "defaultBadge")}
                  </span>
                )}
              </div>
              {m.label !== m.id && (
                <div className="truncate font-mono text-[10px] text-muted-foreground">
                  {m.id}
                </div>
              )}
            </div>
          </PickerItem>
        ))}

      {!modelsQuery.isLoading && filtered.length === 0 && !canCreate && (
        <p className="px-3 py-3 text-center text-xs text-muted-foreground">
          {t("agents", "noModelsAvailable")}
        </p>
      )}

      {canCreate && (
        <PickerItem
          selected={false}
          onClick={() => void select(trimmedSearch)}
          tooltip={t("agents", "useCustomModel").replace("{search}", trimmedSearch)}
        >
          <Plus className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate text-primary">
            {t("agents", "useCustomModel").replace("{search}", trimmedSearch)}
          </span>
        </PickerItem>
      )}

      {value && (
        <button
          type="button"
          onClick={() => void select("")}
          className="mt-1 flex w-full items-center border-t px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-accent/50"
          title={t("agents", "clearModelTitle")}
        >
          {t("agents", "clearModel")}
        </button>
      )}
    </PropertyPicker>
  );
}
