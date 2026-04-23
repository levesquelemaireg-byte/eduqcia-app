"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { FicheMode } from "@/lib/fiche/types";

const BASE_CLASS =
  "inline-flex min-w-0 max-w-full min-h-8 items-center gap-1 rounded-lg border-0 bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep";

type Props = {
  icon: string;
  label?: string;
  className?: string;
  ariaLabel?: string;
  /** Classes ajoutées au glyphe (ex : `-scale-x-100` pour un miroir horizontal). */
  iconClassName?: string;
  /** Contenu alternatif à `label` — utilisé quand la chip a une structure interne (ex : breadcrumb). */
  children?: ReactNode;
  /** Troncature dure en caractères (avec `…`). Sinon la troncature est gérée par CSS (ellipsis). */
  maxChars?: number;
  /** Retourne `null` si la chip n'a ni `label` ni `children`. Utile dans les contextes où une chip icône-seule ne se justifie pas. */
  hideWhenEmpty?: boolean;
};

/** Chip de métadonnée (niveau, discipline, OI, aspects, etc.). Primitive visuelle orthogonale — aucune dépendance à FicheMode. */
export function MetaChip({
  icon,
  label,
  className,
  ariaLabel,
  iconClassName,
  children,
  maxChars,
  hideWhenEmpty,
}: Props) {
  const hasChildren = children !== undefined;
  const text = label?.trim() ?? "";
  const iconOnly = !hasChildren && text.length === 0;

  if (iconOnly && hideWhenEmpty) return null;

  return (
    <span
      className={cn(BASE_CLASS, className)}
      aria-label={iconOnly ? ariaLabel : undefined}
      role={iconOnly ? "img" : undefined}
    >
      <span
        className={cn("material-symbols-outlined shrink-0 text-[0.9em] text-accent", iconClassName)}
        aria-hidden="true"
      >
        {icon}
      </span>
      {hasChildren ? (
        children
      ) : iconOnly ? null : (
        <span className="min-w-0 truncate">
          {maxChars != null ? truncate(text, maxChars) : text}
        </span>
      )}
    </span>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

/**
 * Pont opt-in pour les appelants qui rendent une chip dans le pipeline Fiche (mode `thumbnail` vs reste).
 * La primitive `MetaChip` elle-même reste orthogonale ; ce helper encapsule la seule règle métier
 * propre au mode `thumbnail` : troncature dure à 24 caractères + masquage si icône-seule.
 */
export function chipPropsForFicheMode(mode: FicheMode): {
  maxChars?: number;
  hideWhenEmpty?: boolean;
} {
  return mode === "thumbnail" ? { maxChars: 24, hideWhenEmpty: true } : {};
}
