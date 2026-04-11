"use client";

import type { ReactNode } from "react";

type Props = {
  icon: string;
  children: ReactNode;
};

/**
 * Label uppercase de section fiche (CONSIGNE, CORRIGÉ, DOCUMENTS, etc.).
 * Style aligné sur `FICHE_SECTION_TITLE_CLASS` — icône + texte accent.
 */
export function SectionLabel({ icon, children }: Props) {
  return (
    <h3 className="mb-[0.65rem] flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
      <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
        {icon}
      </span>
      {children}
    </h3>
  );
}
