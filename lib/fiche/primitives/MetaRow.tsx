"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type MetaRowItem = { icon: string; label: string };
export type MetaRowBadge = { label: string; variant: "published" | "draft" };

type BaseProps = {
  items: MetaRowItem[];
  badge?: MetaRowBadge;
  /** Contenu supplémentaire après les items (ex. skeleton placeholder). */
  children?: ReactNode;
};

type ExpandableProps = {
  /** Icône de la ligne. */
  icon: string;
  /** Label affiché à côté de l'icône. */
  label: string;
  /** Contenu révélé au clic. */
  children: ReactNode;
  /** Masquer le border-top (ex. premier MetaRow d'un groupe). */
  noBorderTop?: boolean;
};

/**
 * Ligne de métadonnées icône + texte avec badge statut optionnel.
 * Utilisée dans les footers TAÉ et Document.
 */
export function MetaRow({ items, badge, children }: BaseProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </span>
        ))}
        {children}
      </div>

      {badge ? <StatusBadge label={badge.label} variant={badge.variant} /> : null}
    </div>
  );
}

/**
 * Ligne de métadonnées déroulante — icône + label + chevron à droite.
 * Click toggle le contenu déplié. Utilisée dans le rail de la vue détaillée.
 */
export function MetaRowExpandable({ icon, label, children, noBorderTop }: ExpandableProps) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <div className={cn("py-2.75", !noBorderTop && "border-t-[0.5px] border-border")}>
      <button
        type="button"
        className="flex w-full min-h-11 items-center gap-1.5 text-left text-xs text-deep"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="material-symbols-outlined text-[14px] text-accent" aria-hidden="true">
          {icon}
        </span>
        <span className="flex-1 truncate font-medium">{label}</span>
        <span
          className={cn(
            "material-symbols-outlined text-[16px] text-muted transition-transform duration-150",
            expanded && "rotate-180",
          )}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>
      {expanded ? (
        <div id={contentId} className="pt-2 pl-5.5">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Ligne de métadonnées simple pour le rail — icône + texte, pas de toggle.
 */
export function MetaRowSimple({
  icon,
  label,
  noBorderTop,
}: {
  icon: string;
  label: string;
  noBorderTop?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 py-2.75 text-xs text-deep",
        !noBorderTop && "border-t-[0.5px] border-border",
      )}
    >
      <span className="material-symbols-outlined text-[14px] text-accent" aria-hidden="true">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

export function StatusBadge({ label, variant }: MetaRowBadge) {
  const isPublished = variant === "published";
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold",
        isPublished ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", isPublished ? "bg-success" : "bg-warning")} />
      {label}
    </span>
  );
}
