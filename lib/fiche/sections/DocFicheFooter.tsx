"use client";

import type { DocFooterData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { MetaRow } from "@/lib/fiche/primitives/MetaRow";
import type { MetaRowItem } from "@/lib/fiche/primitives/MetaRow";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

type Props = { data: DocFooterData; mode: FicheMode };

/** Pied de fiche document — auteur, date, usages, statut publication. */
export function DocFicheFooter({ data, mode: _mode }: Props) {
  const items: MetaRowItem[] = [
    { icon: ICONES_METIER.auteur, label: data.authorName || "—" },
    { icon: ICONES_METIER.dateCreation, label: data.created || "—" },
  ];

  if (data.usageCaption) {
    items.push({ icon: ICONES_METIER.utilisation, label: data.usageCaption });
  }

  return (
    <footer className="border-t border-border text-xs text-muted">
      <div className="px-5 py-3">
        <MetaRow
          items={items}
          badge={{
            label: data.isPublished ? "Publiée" : "Brouillon",
            variant: data.isPublished ? "published" : "draft",
          }}
        />
      </div>
    </footer>
  );
}
