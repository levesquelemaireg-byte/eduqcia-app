"use client";

import type { FooterData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { formatFicheDate } from "@/lib/tae/fiche-helpers";
import { getDisplayName } from "@/lib/utils/profile-display";
import { SkeletonFooterNbLignes } from "@/components/tae/fiche/FicheSkeletons";
import { MetaRow } from "@/lib/fiche/primitives/MetaRow";
import type { MetaRowItem } from "@/lib/fiche/primitives/MetaRow";

type Props = { data: FooterData; mode: FicheMode };

/** Pied de fiche — auteurs, date, nb lignes, statut publication, version. */
export function FicheFooter({ data, mode: _mode }: Props) {
  const auteurs = data.auteurs.map((a) => getDisplayName(a.first_name, a.last_name)).join(" · ");

  const items: MetaRowItem[] = [
    { icon: "person", label: auteurs || "—" },
    { icon: "calendar_today", label: formatFicheDate(data.createdAt) },
  ];

  if (data.showStudentAnswerLines && !data.hideNbLignesSkeleton) {
    items.push({ icon: "format_line_spacing", label: `${data.nbLignes} lignes` });
  }

  return (
    <footer className="border-t border-border text-xs text-muted">
      {data.version > 1 && data.versionUpdatedAt ? (
        <p className="px-5 pb-2 pt-3">
          Version {data.version} — mise à jour majeure le {formatFicheDate(data.versionUpdatedAt)}
        </p>
      ) : null}
      <div className="px-5 py-3">
        <MetaRow
          items={items}
          badge={{
            label: data.isPublished ? "Publiée" : "Brouillon",
            variant: data.isPublished ? "published" : "draft",
          }}
        >
          {data.showStudentAnswerLines && data.hideNbLignesSkeleton ? (
            <SkeletonFooterNbLignes />
          ) : null}
        </MetaRow>
      </div>
    </footer>
  );
}
