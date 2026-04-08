"use client";

import type { ReactNode } from "react";
import { TaeCardMenu } from "@/components/tae/fiche/TaeCardMenu";
import { SectionConsigne } from "@/components/tae/fiche/SectionConsigne";
import { SectionCorrige } from "@/components/tae/fiche/SectionCorrige";
import { SectionDocuments } from "@/components/tae/fiche/SectionDocuments";
import { SectionGuidage } from "@/components/tae/fiche/SectionGuidage";
import { SectionCD } from "@/components/tae/fiche/SectionCD";
import { SectionConnaissances } from "@/components/tae/fiche/SectionConnaissances";
import { FicheFooter } from "@/components/tae/fiche/FicheFooter";
import { PlaygroundFragmentWrapper } from "@/components/playground/PlaygroundFragmentWrapper";
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
import type { PlaygroundViewMode } from "@/lib/fragment-playground/types";

const SECTION_SHELL = `${FICHE_BODY_SECTION_PX} ${FICHE_BODY_SECTION_PT} ${FICHE_BODY_SECTION_PB}`;

type Props = {
  tae: TaeFicheData;
  mode: "lecture" | "sommaire";
  viewMode: PlaygroundViewMode;
  isolatedFragmentId: string;
};

/**
 * Miroir structurel de `FicheTache` avec enveloppes `data-fragment` — fichier prod `FicheTache.tsx` inchangé.
 */
export function PlaygroundFicheRenderer({ tae, mode, viewMode, isolatedFragmentId }: Props) {
  const isAuteur = false;

  const articleClass = cn(
    "min-w-0 overflow-hidden rounded-br-[18px] rounded-tr-[18px] border border-border border-l-2 border-l-accent bg-panel",
    mode === "sommaire" ? "shadow-[var(--wizard-preview-card-shadow)]" : "shadow-sm",
  );

  const inner = (
    <>
      <div className={mode === "sommaire" ? "pt-4" : undefined}>
        <PlaygroundFragmentWrapper name="SectionConsigne">
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
        </PlaygroundFragmentWrapper>
      </div>

      <div className={FICHE_HAIRLINE_RULE} aria-hidden="true" />

      <div className="relative grid min-w-0 grid-cols-1 min-[800px]:grid-cols-[minmax(0,6fr)_minmax(0,4fr)]">
        <div className="min-w-0">
          <div className={SECTION_SHELL}>
            <PlaygroundFragmentWrapper name="SectionCorrige">
              <SectionCorrige corrige={tae.corrige} />
            </PlaygroundFragmentWrapper>
          </div>
          <div className={FICHE_HAIRLINE_RULE} aria-hidden="true" />
          <div className={SECTION_SHELL}>
            <PlaygroundFragmentWrapper name="SectionDocuments">
              <SectionDocuments documents={tae.documents} />
            </PlaygroundFragmentWrapper>
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
            <PlaygroundFragmentWrapper name="SectionGuidage">
              <SectionGuidage guidage={tae.guidage} />
            </PlaygroundFragmentWrapper>
          </div>
          <div className={FICHE_HAIRLINE_RULE} aria-hidden="true" />
          <div className={SECTION_SHELL}>
            <PlaygroundFragmentWrapper name="SectionCD">
              <SectionCD cd={tae.cd} />
            </PlaygroundFragmentWrapper>
          </div>
          <div className={FICHE_HAIRLINE_RULE} aria-hidden="true" />
          <div className={SECTION_SHELL}>
            <PlaygroundFragmentWrapper name="SectionConnaissances">
              <SectionConnaissances connaissances={tae.connaissances} />
            </PlaygroundFragmentWrapper>
          </div>
        </div>
      </div>

      {tae.version > 1 && tae.version_updated_at ? (
        <p className="px-5 pb-2 pt-1 text-xs text-muted">
          Version {tae.version} — mise à jour majeure le {formatFicheDate(tae.version_updated_at)}
        </p>
      ) : null}

      <PlaygroundFragmentWrapper name="FicheFooter">
        <FicheFooter tae={tae} mode={mode} />
      </PlaygroundFragmentWrapper>
    </>
  );

  if (viewMode === "full") {
    return (
      <article className={articleClass} data-fiche-menu-shell>
        {inner}
      </article>
    );
  }

  const blocks: Record<string, ReactNode> = {
    SectionConsigne: (
      <div className={mode === "sommaire" ? "pt-4" : undefined}>
        <PlaygroundFragmentWrapper name="SectionConsigne">
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
        </PlaygroundFragmentWrapper>
      </div>
    ),
    SectionCorrige: (
      <div className={SECTION_SHELL}>
        <PlaygroundFragmentWrapper name="SectionCorrige">
          <SectionCorrige corrige={tae.corrige} />
        </PlaygroundFragmentWrapper>
      </div>
    ),
    SectionDocuments: (
      <div className={SECTION_SHELL}>
        <PlaygroundFragmentWrapper name="SectionDocuments">
          <SectionDocuments documents={tae.documents} />
        </PlaygroundFragmentWrapper>
      </div>
    ),
    SectionGuidage: (
      <div className={SECTION_SHELL}>
        <PlaygroundFragmentWrapper name="SectionGuidage">
          <SectionGuidage guidage={tae.guidage} />
        </PlaygroundFragmentWrapper>
      </div>
    ),
    SectionCD: (
      <div className={SECTION_SHELL}>
        <PlaygroundFragmentWrapper name="SectionCD">
          <SectionCD cd={tae.cd} />
        </PlaygroundFragmentWrapper>
      </div>
    ),
    SectionConnaissances: (
      <div className={SECTION_SHELL}>
        <PlaygroundFragmentWrapper name="SectionConnaissances">
          <SectionConnaissances connaissances={tae.connaissances} />
        </PlaygroundFragmentWrapper>
      </div>
    ),
    FicheFooter: (
      <PlaygroundFragmentWrapper name="FicheFooter">
        <FicheFooter tae={tae} mode={mode} />
      </PlaygroundFragmentWrapper>
    ),
  };

  const selected = blocks[isolatedFragmentId];
  if (!selected) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Fragment inconnu : {isolatedFragmentId}</p>
    );
  }

  return (
    <article className={articleClass} data-fiche-menu-shell>
      {selected}
    </article>
  );
}
