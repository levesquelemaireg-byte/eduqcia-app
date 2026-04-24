import { MetaChip } from "@/lib/fiche/primitives/MetaChip";
import { ChipBar } from "@/lib/fiche/primitives/ChipBar";
import { MetaRowSimple, StatusBadge } from "@/lib/fiche/primitives/MetaRow";
import { RailLayout, SectionRail } from "@/components/partagees/vue-detaillee/rail-layout";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

type Props = {
  titre: string;
  taches: DonneesTache[];
  estPubliee: boolean;
  auteurNom: string;
  niveauLabel?: string;
  disciplineLabel?: string;
};

/**
 * Rail latéral pour la vue détaillée épreuve.
 * Compteurs, indexation, auteur, statut.
 */
export function EpreuveRail({
  titre: _titre,
  taches,
  estPubliee,
  auteurNom,
  niveauLabel,
  disciplineLabel,
}: Props) {
  const nbTaches = taches.length;
  const totalPoints = calculerTotalPoints(taches);
  const totalDocuments = taches.reduce((n, t) => n + t.documents.length, 0);

  return (
    <RailLayout>
      {/* Compteurs — nb tâches + total points */}
      <SectionRail titre="Compteurs" estPremiere>
        <div className="grid grid-cols-2 gap-2">
          <BlocCompteur valeur={nbTaches} libelle={`tâche${nbTaches !== 1 ? "s" : ""}`} />
          <BlocCompteur valeur={totalPoints} libelle="pts" />
        </div>
        {totalDocuments > 0 && (
          <p className="mt-2 text-[11px] text-steel">
            {totalDocuments} document{totalDocuments !== 1 ? "s" : ""} au total
          </p>
        )}
      </SectionRail>

      {/* Indexation — niveau, discipline */}
      {(niveauLabel || disciplineLabel) && (
        <SectionRail titre="Indexation">
          <ChipBar>
            {niveauLabel && <MetaChip icon={ICONES_METIER.niveau} label={niveauLabel} />}
            {disciplineLabel && (
              <MetaChip icon={ICONES_METIER.discipline} label={disciplineLabel} />
            )}
          </ChipBar>
        </SectionRail>
      )}

      {/* Auteur */}
      {auteurNom && (
        <SectionRail titre="Auteur">
          <MetaRowSimple icon={ICONES_METIER.auteur} label={auteurNom} noBorderTop />
        </SectionRail>
      )}

      {/* Statut */}
      <SectionRail titre="Statut">
        <StatusBadge
          label={estPubliee ? "Publiée" : "Brouillon"}
          variant={estPubliee ? "published" : "draft"}
        />
      </SectionRail>
    </RailLayout>
  );
}

/* ─── Sous-composants internes ──────────────────────────────── */

function BlocCompteur({ valeur, libelle }: { valeur: number; libelle: string }) {
  return (
    <div className="rounded-md bg-panel-alt p-2.5 text-center">
      <span className="text-xl font-medium text-deep">{valeur}</span>
      <span className="ml-1 text-[11px] text-steel">{libelle}</span>
    </div>
  );
}

/** Calcule le total max de points depuis les outils d'évaluation des tâches. */
function calculerTotalPoints(taches: DonneesTache[]): number {
  return taches.reduce((total, tache) => {
    const pointsTache = tache.outilEvaluation.criteres.reduce((somme, critere) => {
      const maxCritere = Math.max(0, ...critere.descripteurs.map((d) => d.points));
      return somme + maxCritere;
    }, 0);
    return total + pointsTache;
  }, 0);
}
