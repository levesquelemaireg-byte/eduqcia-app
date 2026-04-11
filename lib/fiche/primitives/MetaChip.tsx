"use client";

import { cn } from "@/lib/utils/cn";
import type { FicheMode } from "@/lib/fiche/types";

const BASE_CLASS =
  "inline-flex min-h-8 items-center gap-1 rounded-lg border-0 bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep";

type Props = {
  icon: string;
  label?: string;
  mode: FicheMode;
  className?: string;
  ariaLabel?: string;
};

/** Chip de métadonnée (niveau, discipline, OI, aspects, etc.). */
export function MetaChip({ icon, label, mode, className, ariaLabel }: Props) {
  const text = label?.trim() ?? "";
  const iconOnly = text.length === 0;

  if (mode === "thumbnail" && iconOnly) return null;

  return (
    <span
      className={cn(BASE_CLASS, className)}
      aria-label={iconOnly ? ariaLabel : undefined}
      role={iconOnly ? "img" : undefined}
    >
      <span className="material-symbols-outlined text-[0.9em] text-accent" aria-hidden="true">
        {icon}
      </span>
      {iconOnly ? null : mode === "thumbnail" ? truncate(text, 24) : text}
    </span>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}
