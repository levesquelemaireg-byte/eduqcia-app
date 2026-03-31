"use client";

import { TaeCardMenu } from "@/components/tae/fiche/TaeCardMenu";
import { SectionConsigne } from "@/components/tae/fiche/SectionConsigne";
import { SectionCorrige } from "@/components/tae/fiche/SectionCorrige";
import { SectionDocuments } from "@/components/tae/fiche/SectionDocuments";
import { SectionGuidage } from "@/components/tae/fiche/SectionGuidage";
import { SectionCD } from "@/components/tae/fiche/SectionCD";
import { SectionConnaissances } from "@/components/tae/fiche/SectionConnaissances";
import { FicheFooter } from "@/components/tae/fiche/FicheFooter";
import type { ConnaissanceSelectionWithIds } from "@/lib/tae/connaissances-helpers";
import type { TaeFicheData } from "@/lib/types/fiche";
import { formatFicheDate } from "@/lib/tae/fiche-helpers";
import {
  FICHE_BODY_SECTION_PB,
  FICHE_BODY_SECTION_PT,
  FICHE_BODY_SECTION_PX,
  FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET,
  FICHE_HAIRLINE_RULE,
} from "@/lib/ui/fiche-layout";
import { cn } from "@/lib/utils/cn";

type Props = {
  tae: TaeFicheData;
  mode: "lecture" | "sommaire";
  userId?: string;
  /** Wizard — colonne sommaire : données brouillon avec `rowId` + retrait sans repasser par le Miller. */
  connaissancesSommaire?: {
    items: ConnaissanceSelectionWithIds[];
    onRemoveRow: (rowId: string) => void;
  } | null;
};

const SECTION_SHELL = `${FICHE_BODY_SECTION_PX} ${FICHE_BODY_SECTION_PT} ${FICHE_BODY_SECTION_PB}`;

export function FicheTache({ tae, mode, userId, connaissancesSommaire = null }: Props) {
  const isAuteur = Boolean(userId && tae.auteur_id === userId);

  return (
    <>
      <article
        className={cn(
          "min-w-0 overflow-hidden rounded-br-[18px] rounded-tr-[18px] border border-border border-l-2 border-l-accent bg-panel",
          mode === "sommaire" ? "shadow-[var(--wizard-preview-card-shadow)]" : "shadow-sm",
        )}
        data-fiche-menu-shell
      >
        <div className={mode === "sommaire" ? "pt-4" : undefined}>
          <SectionConsigne
            tae={tae}
            headerMenu={
              mode === "lecture" ? (
                <TaeCardMenu
                  taeId={tae.id}
                  isAuteur={isAuteur}
                  menuContext="lecture"
                  printHref={`/questions/${tae.id}/print`}
                />
              ) : undefined
            }
          />
        </div>

        <div className={FICHE_HAIRLINE_RULE} aria-hidden="true" />

        <div className="relative grid min-w-0 grid-cols-1 min-[800px]:grid-cols-[minmax(0,6fr)_minmax(0,4fr)]">
          {/* Pas de pr/pl sur les colonnes : le `px-5` des `SECTION_SHELL` gère le texte ; sinon les hairlines s’arrêtent loin du filet vertical (double gouttière). */}
          <div className="min-w-0">
            <div className={SECTION_SHELL}>
              <SectionCorrige corrige={tae.corrige} />
            </div>
            <div className={FICHE_HAIRLINE_RULE} aria-hidden="true" />
            <div className={SECTION_SHELL}>
              <SectionDocuments documents={tae.documents} />
            </div>
          </div>

          <div className="relative min-w-0 max-[799px]:border-t max-[799px]:border-border min-[800px]:border-t-0">
            <span
              className={cn(
                "pointer-events-none absolute left-0 z-0 hidden min-[800px]:block w-px bg-border",
                FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET,
              )}
              aria-hidden="true"
            />
            <div className={SECTION_SHELL}>
              <SectionGuidage guidage={tae.guidage} />
            </div>
            <div className={FICHE_HAIRLINE_RULE} aria-hidden="true" />
            <div className={SECTION_SHELL}>
              <SectionCD cd={tae.cd} />
            </div>
            <div className={FICHE_HAIRLINE_RULE} aria-hidden="true" />
            <div className={SECTION_SHELL}>
              <SectionConnaissances
                connaissances={
                  mode === "sommaire" && connaissancesSommaire
                    ? connaissancesSommaire.items
                    : tae.connaissances
                }
                onRemoveRow={
                  mode === "sommaire" && connaissancesSommaire
                    ? connaissancesSommaire.onRemoveRow
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        {tae.version > 1 && tae.version_updated_at ? (
          <p className="px-5 pb-2 pt-1 text-xs text-muted">
            Version {tae.version} — mise à jour majeure le {formatFicheDate(tae.version_updated_at)}
          </p>
        ) : null}

        <FicheFooter tae={tae} mode={mode} />
      </article>
    </>
  );
}
