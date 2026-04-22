"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { TacheFicheData } from "@/lib/types/fiche";
import type { FicheMode, CompetenceData, ConnaissancesData } from "@/lib/fiche/types";
import { ChipBar } from "@/lib/fiche/primitives/ChipBar";
import { IconBadge } from "@/lib/fiche/primitives/IconBadge";
import { MetaChip } from "@/lib/fiche/primitives/MetaChip";
import { MetaRowSimple, StatusBadge } from "@/lib/fiche/primitives/MetaRow";
import { SectionCD } from "@/lib/fiche/sections/SectionCD";
import { SectionConnaissances } from "@/lib/fiche/sections/SectionConnaissances";
import { RailLayout, SectionRail } from "@/components/partagees/vue-detaillee/rail-layout";
import { selectRailNiveau } from "@/lib/fiche/selectors/tache/rail/niveau";
import { selectRailDiscipline } from "@/lib/fiche/selectors/tache/rail/discipline";
import { selectRailAspects } from "@/lib/fiche/selectors/tache/rail/aspects";
import { selectRailCompetence } from "@/lib/fiche/selectors/tache/rail/competence";
import { selectRailConnaissances } from "@/lib/fiche/selectors/tache/rail/connaissances";
import { selectRailDocumentsCompte } from "@/lib/fiche/selectors/tache/rail/documents-compte";
import { selectRailAuteur } from "@/lib/fiche/selectors/tache/rail/auteur";
import { selectRailDates } from "@/lib/fiche/selectors/tache/rail/dates";
import { selectRailStatut } from "@/lib/fiche/selectors/tache/rail/statut";
import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";
import {
  FICHE_RAIL_DATE_CREATION,
  FICHE_RAIL_DATE_MAJ,
  FICHE_RAIL_STATUT_PUBLIEE,
  FICHE_RAIL_STATUT_BROUILLON,
} from "@/lib/ui/ui-copy";

type Props = {
  tache: TacheFicheData;
};

/**
 * Rail latéral pour la vue détaillée tâche.
 * Utilise RailLayout + SectionRail partagés — le conteneur responsive
 * est géré par VueDetailleeLayout (border-l sticky en sidebar, empilé en stacked).
 */
export function TacheRail({ tache }: Props) {
  const mode: FicheMode = "lecture";
  const niveau = useMemo(() => selectRailNiveau(tache), [tache]);
  const discipline = useMemo(() => selectRailDiscipline(tache), [tache]);
  const aspects = useMemo(() => selectRailAspects(tache), [tache]);
  const competence = useMemo(() => selectRailCompetence(tache), [tache]);
  const connaissances = useMemo(() => selectRailConnaissances(tache), [tache]);
  const docsCompte = useMemo(() => selectRailDocumentsCompte(tache), [tache]);
  const auteur = useMemo(() => selectRailAuteur(tache), [tache]);
  const dates = useMemo(() => selectRailDates(tache), [tache]);
  const statut = useMemo(() => selectRailStatut(tache), [tache]);

  const cdData: CompetenceData | null = competence ? { cd: competence.cd } : null;
  const connData: ConnaissancesData | null = connaissances
    ? { connaissances: connaissances.connaissances }
    : null;

  const oiGlyph = tache.oi?.icone ?? "";

  return (
    <RailLayout>
      {/* IconBadge OI — ancre visuelle non négociable */}
      <SectionRail titre="Opération intellectuelle" estPremiere>
        <div className="flex justify-center">
          <IconBadge glyph={oiGlyph} mode={mode} boxed accent animate size={64} glyphSize={52} />
        </div>
      </SectionRail>

      {/* Paramètres — niveau, discipline, aspects */}
      <SectionRail titre="Paramètres">
        <ChipBar>
          <MetaChip icon="school" label={niveau.label} />
          <MetaChip icon="menu_book" label={discipline.label} />
          {aspects &&
            aspects.labels.map((label) => <MetaChip key={label} icon="public" label={label} />)}
        </ChipBar>
      </SectionRail>

      {/* Outil d'évaluation */}
      {tache.outilEvaluation && (
        <SectionRail titre="Outil d'évaluation">
          <MetaRowSimple icon="table" label={tache.outilEvaluation} noBorderTop />
        </SectionRail>
      )}

      {/* Compétence disciplinaire — arbre toujours visible */}
      {competence && cdData && (
        <SectionRail titre="Compétence disciplinaire">
          <SectionCD data={cdData} mode={mode} />
        </SectionRail>
      )}

      {/* Connaissances — arbre toujours visible */}
      {connaissances && connData && (
        <SectionRail titre="Connaissances">
          <SectionConnaissances data={connData} mode={mode} />
        </SectionRail>
      )}

      {/* Nombre de documents */}
      {docsCompte && (
        <SectionRail titre="Documents">
          <MetaRowSimple icon="article" label={docsCompte.texte} noBorderTop />
        </SectionRail>
      )}

      {/* Auteur */}
      <SectionRail titre="Auteur">
        <div className="space-y-1">
          {auteur.id ? (
            <div className="flex items-center gap-1.5 text-xs text-deep">
              <span
                className="material-symbols-outlined text-[14px] text-accent"
                aria-hidden="true"
              >
                person
              </span>
              <Link
                href={`/profile/${auteur.id}`}
                className="font-medium text-accent hover:underline"
              >
                {auteur.nom}
              </Link>
            </div>
          ) : (
            <MetaRowSimple icon="person" label={auteur.nom} noBorderTop />
          )}
          <MetaRowSimple
            icon="calendar_today"
            label={`${FICHE_RAIL_DATE_CREATION} ${formatDateFrCaMedium(dates.creation)}`}
            noBorderTop
          />
          <MetaRowSimple
            icon="history"
            label={`${FICHE_RAIL_DATE_MAJ} ${formatDateFrCaMedium(dates.miseAJour)}`}
            noBorderTop
          />
        </div>
      </SectionRail>

      {/* Statut */}
      <SectionRail titre="Statut">
        <StatusBadge
          label={
            statut.statut === "publiee" ? FICHE_RAIL_STATUT_PUBLIEE : FICHE_RAIL_STATUT_BROUILLON
          }
          variant={statut.statut === "publiee" ? "published" : "draft"}
        />
      </SectionRail>
    </RailLayout>
  );
}
