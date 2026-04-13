"use client";

import { useMemo, useState } from "react";
import type { TaeFicheData } from "@/lib/types/fiche";
import type { FicheMode } from "@/lib/fiche/types";
import type { CompetenceData, ConnaissancesData } from "@/lib/fiche/types";
import { ChipBar } from "@/lib/fiche/primitives/ChipBar";
import { MetaChip } from "@/lib/fiche/primitives/MetaChip";
import { MetaRowExpandable, MetaRowSimple, StatusBadge } from "@/lib/fiche/primitives/MetaRow";
import { SectionCD } from "@/lib/fiche/sections/SectionCD";
import { SectionConnaissances } from "@/lib/fiche/sections/SectionConnaissances";
import { selectRailNiveau } from "@/lib/fiche/selectors/tache/rail/niveau";
import { selectRailDiscipline } from "@/lib/fiche/selectors/tache/rail/discipline";
import { selectRailAspects } from "@/lib/fiche/selectors/tache/rail/aspects";
import { selectRailChapitreConnaissances } from "@/lib/fiche/selectors/tache/rail/chapitre-connaissances";
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
  FICHE_RAIL_ACCORDEON_LABEL,
} from "@/lib/ui/ui-copy";

type Props = {
  tae: TaeFicheData;
};

/**
 * Rail contextuel de la vue détaillée tâche — responsive.
 *
 * - Desktop ≥1024px : panneau sticky 280px à droite.
 * - Tablet 768-1023px : pleine largeur, non sticky, compact.
 * - Mobile <768px : accordéon replié par défaut.
 */
export function TacheRail({ tae }: Props) {
  const niveau = useMemo(() => selectRailNiveau(tae), [tae]);
  const discipline = useMemo(() => selectRailDiscipline(tae), [tae]);
  const aspects = useMemo(() => selectRailAspects(tae), [tae]);
  const chapitre = useMemo(() => selectRailChapitreConnaissances(tae), [tae]);
  const competence = useMemo(() => selectRailCompetence(tae), [tae]);
  const connaissances = useMemo(() => selectRailConnaissances(tae), [tae]);
  const docsCompte = useMemo(() => selectRailDocumentsCompte(tae), [tae]);
  const auteur = useMemo(() => selectRailAuteur(tae), [tae]);
  const dates = useMemo(() => selectRailDates(tae), [tae]);
  const statut = useMemo(() => selectRailStatut(tae), [tae]);

  const mode: FicheMode = "lecture";

  /* Données pour les arbres CD et connaissances (boîtes noires) */
  const cdData: CompetenceData | null = competence ? { cd: competence.cd } : null;
  const connData: ConnaissancesData | null = connaissances
    ? { connaissances: connaissances.connaissances }
    : null;

  const statutLabel =
    statut.statut === "publiee" ? FICHE_RAIL_STATUT_PUBLIEE : FICHE_RAIL_STATUT_BROUILLON;
  const statutVariant = statut.statut === "publiee" ? "published" : "draft";

  /* ── Accordéon mobile ──────────────────────────────────────── */
  const [accordeonOuvert, setAccordeonOuvert] = useState(false);

  /* ── Contenu partagé (chips + metarows + statut) ───────────── */
  const contenuRail = (
    <>
      {/* 1. ChipBar — 4 pills max */}
      <ChipBar className="gap-1.5">
        <MetaChip icon="school" label={niveau.label} mode={mode} />
        <MetaChip icon="menu_book" label={discipline.label} mode={mode} />
        {aspects ? (
          <MetaChip icon="deployed_code" label={aspects.labels.join(" · ")} mode={mode} />
        ) : null}
        {chapitre ? <MetaChip icon="lightbulb" label={chapitre.racine} mode={mode} /> : null}
      </ChipBar>

      {/* Gap 18px entre ChipBar et MetaRows */}
      <div className="mt-[18px]">
        {/* 2. MetaRow déroulante — Compétence disciplinaire */}
        {competence && cdData ? (
          <MetaRowExpandable icon="license" label={competence.racine} noBorderTop>
            <SectionCD data={cdData} mode={mode} />
          </MetaRowExpandable>
        ) : null}

        {/* 3. MetaRow déroulante — Connaissances mobilisées */}
        {connaissances && connData ? (
          <MetaRowExpandable
            icon="lightbulb"
            label={connaissances.terminal}
            noBorderTop={!competence}
          >
            <SectionConnaissances data={connData} mode={mode} />
          </MetaRowExpandable>
        ) : null}

        {/* 4. MetaRow — Documents count */}
        {docsCompte ? (
          <MetaRowSimple
            icon="article"
            label={docsCompte.texte}
            noBorderTop={!competence && !connaissances}
          />
        ) : null}

        {/* 5. MetaRow — Auteur */}
        <MetaRowSimple icon="person" label={auteur.nom} />

        {/* 6. MetaRow — Date de création */}
        <MetaRowSimple
          icon="calendar_today"
          label={`${FICHE_RAIL_DATE_CREATION} ${formatDateFrCaMedium(dates.creation)}`}
        />

        {/* 7. MetaRow — Date de mise à jour */}
        <MetaRowSimple
          icon="history"
          label={`${FICHE_RAIL_DATE_MAJ} ${formatDateFrCaMedium(dates.miseAJour)}`}
        />
      </div>

      {/* 8. Footer — badge statut, séparé par divider */}
      <div className="mt-3 border-t-[0.5px] border-border pt-3">
        <StatusBadge label={statutLabel} variant={statutVariant} />
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile <768px : accordéon replié par défaut ────────── */}
      <aside
        role="complementary"
        className="rounded-xl border-[0.5px] border-border bg-panel md:hidden"
      >
        <div
          role="button"
          tabIndex={0}
          aria-expanded={accordeonOuvert}
          onClick={() => setAccordeonOuvert((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setAccordeonOuvert((v) => !v);
            }
          }}
          className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-xs font-semibold text-deep"
        >
          {FICHE_RAIL_ACCORDEON_LABEL}
          <span
            className="material-symbols-outlined text-[18px] text-muted transition-transform duration-200"
            style={accordeonOuvert ? { transform: "rotate(180deg)" } : undefined}
            aria-hidden="true"
          >
            expand_more
          </span>
        </div>
        {accordeonOuvert ? <div className="px-4 pb-4">{contenuRail}</div> : null}
      </aside>

      {/* ── Tablet 768-1023px : pleine largeur, non sticky ────── */}
      <aside
        role="complementary"
        className="hidden rounded-xl border-[0.5px] border-border bg-panel p-4 md:block lg:hidden"
      >
        {contenuRail}
      </aside>

      {/* ── Desktop ≥1024px : sticky 280px ────────────────────── */}
      <aside
        role="complementary"
        className="sticky top-[60px] hidden h-fit w-[280px] rounded-xl border-[0.5px] border-border bg-panel p-4 lg:block"
      >
        {contenuRail}
      </aside>
    </>
  );
}
