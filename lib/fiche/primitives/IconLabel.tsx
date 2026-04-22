"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const BASE_CLASS = "inline-flex items-center gap-[0.35em]";
const ICON_CLASS = "material-symbols-outlined shrink-0 text-[1em] leading-none";

type Props = {
  icon: string;
  label?: string;
  className?: string;
  ariaLabel?: string;
  /** Contenu alternatif à `label` pour les structures composées (breadcrumb, multi-segments). */
  children?: ReactNode;
};

/**
 * Paire icône + texte inline, sans pill ni fond. Primitive structurelle neutre —
 * la tonalité (taille, couleur, casing) se pilote via `className` sur le conteneur ;
 * l'icône hérite de `currentColor` et de la taille du texte ambiant.
 */
export function IconLabel({ icon, label, className, ariaLabel, children }: Props) {
  const hasChildren = children !== undefined;
  const text = label?.trim() ?? "";
  const iconOnly = !hasChildren && text.length === 0;

  return (
    <span
      className={cn(BASE_CLASS, className)}
      aria-label={iconOnly ? ariaLabel : undefined}
      role={iconOnly ? "img" : undefined}
    >
      <span className={ICON_CLASS} aria-hidden="true">
        {icon}
      </span>
      {hasChildren ? children : iconOnly ? null : <span>{text}</span>}
    </span>
  );
}
