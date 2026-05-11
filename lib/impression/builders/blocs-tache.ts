/**
 * Orchestrateur de builders — couche 1.
 *
 * Assemble les blocs d'une tâche selon le mode d'impression et le mode
 * de corrigé (`ModeCorrige`) :
 *   1. Dossier (1 bloc dossier-page par page de grille bicolonnée)
 *   2. Quadruplet (consigne + guidage + espace prod + outil eval), avec
 *      overlay corrigé simple intégré aux fragments NR ou positionné sur
 *      les lignes vierges (rédactionnel) — cf. spec §3.5.
 *   3. Annexe « Notes du correcteur » (uniquement si `corrige === "detaille"`).
 *
 * Phase 5 lot 3 : le bloc corrigé séparé (legacy) a été remplacé par l'overlay
 * (corrigé simple) et l'annexe optionnelle (corrigé détaillé). Zéro page
 * dédiée au corrigé empilable.
 *
 * Réutilisé par `tacheVersImprimable` (tâche seule — tous les blocs paginés
 * ensemble) et indirectement par `epreuveVersImprimable` via les builders
 * homologues du feuillet épreuve.
 */

import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { ModeImpression, Bloc } from "@/lib/epreuve/pagination/types";
import type { ModeCorrige } from "@/lib/impression/types";
import type { ContenuAnnexeCorrige } from "@/components/epreuve/impression/sections/annexe-corrige";
import { reglesVisibilite } from "./regles-visibilite";
import { construireBlocsDossierPages } from "./blocs-dossier-pages";
import { construireBlocQuadruplet } from "./blocs-quadruplet";

export type OptionsBlocsTache = {
  mode: ModeImpression;
  /** Mode du corrigé (spec §3.5). `null` = pas de corrigé. */
  corrige: ModeCorrige;
};

/**
 * Sous-ensemble de `DonneesTache` consommé par l'orchestrateur.
 */
type TacheImpression = Pick<
  DonneesTache,
  | "id"
  | "titre"
  | "consigne"
  | "guidage"
  | "documents"
  | "espaceProduction"
  | "outilEvaluation"
  | "corrige"
>;

/**
 * Construit les blocs annexe (titre + une entrée par tâche) — uniquement
 * appelé quand `corrige === "detaille"`. Chaque entrée est un bloc séparé
 * pour permettre la pagination naturelle (l'annexe peut s'étendre sur
 * plusieurs pages physiques).
 */
function construireBlocsAnnexeCorrige(taches: TacheImpression[], idPrefix: string): Bloc[] {
  const tachesAvecCorrige = taches
    .map((tache, index) => ({ tache, index }))
    .filter(({ tache }) => tache.corrige.trim().length > 0);
  if (tachesAvecCorrige.length === 0) return [];

  const blocs: Bloc[] = [];
  blocs.push({
    id: `${idPrefix}-annexe-titre`,
    kind: "annexe-corrige",
    content: { type: "titre" } satisfies ContenuAnnexeCorrige,
  });
  for (const { tache, index } of tachesAvecCorrige) {
    blocs.push({
      id: `${idPrefix}-annexe-${tache.id}`,
      kind: "annexe-corrige",
      tacheId: tache.id,
      content: {
        type: "question",
        tacheIndex: index,
        corrige: tache.corrige,
      } satisfies ContenuAnnexeCorrige,
    });
  }
  return blocs;
}

export function construireBlocsTache(tache: TacheImpression, options: OptionsBlocsTache): Bloc[] {
  const regles = reglesVisibilite(options.mode);
  const blocs: Bloc[] = [];

  // Dossier documentaire — pages de grille bicolonnée. Numéros 1..N locaux à la tâche.
  const docsNumerotes = tache.documents.map((document, i) => ({
    numeroGlobal: i + 1,
    document,
  }));
  blocs.push(
    ...construireBlocsDossierPages(
      docsNumerotes,
      { titresVisibles: regles.titresDocumentsVisibles },
      `tache-${tache.id}-dossier`,
    ),
  );

  // Quadruplet — overlay corrigé simple intégré quand corrige !== null.
  blocs.push(
    construireBlocQuadruplet(tache, {
      guidageVisible: regles.guidageVisible,
      corrige: options.corrige,
    }),
  );

  // Annexe « Notes du correcteur » — uniquement en mode détaillé.
  if (options.corrige === "detaille") {
    blocs.push(...construireBlocsAnnexeCorrige([tache], `tache-${tache.id}`));
  }

  return blocs;
}
