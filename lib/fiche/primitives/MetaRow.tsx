"use client";

import type { ReactNode } from "react";

export type MetaRowItem = { icon: string; label: string };
export type MetaRowBadge = { label: string; variant: "published" | "draft" };

type Props = {
  items: MetaRowItem[];
  badge?: MetaRowBadge;
  /** Contenu supplémentaire après les items (ex. skeleton placeholder). */
  children?: ReactNode;
};

/**
 * Ligne de métadonnées icône + texte avec badge statut optionnel.
 * Utilisée dans les footers TAÉ et Document.
 */
export function MetaRow({ items, badge, children }: Props) {
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

function StatusBadge({ label, variant }: MetaRowBadge) {
  const isPublished = variant === "published";
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isPublished ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-success" : "bg-warning"}`} />
      {label}
    </span>
  );
}
