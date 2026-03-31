/**
 * Fait correspondre les libellés CD persistés (table `cd`) aux identifiants du JSON référentiel
 * (`public/data/hec-cd.json`, `hqc-cd.json`) — requis pour réhydrater Bloc 5 (Miller par `id`).
 */

import type { CdCompetenceNode, CdSelectionWithIds } from "@/lib/tae/cd-helpers";

export function resolveCdSelectionIdsFromTree(
  competences: CdCompetenceNode[],
  competenceText: string,
  composanteText: string,
  critereText: string,
): CdSelectionWithIds | null {
  const comp = competences.find((c) => c.titre === competenceText);
  if (!comp) return null;
  const compo = comp.composantes.find((co) => co.titre === composanteText);
  if (!compo) return null;
  const crit = compo.criteres.find((cr) => cr.texte === critereText);
  if (!crit) return null;
  return {
    competence: comp.titre,
    composante: compo.titre,
    critere: crit.texte,
    competenceId: comp.id,
    composanteId: compo.id,
    critereId: crit.id,
  };
}
