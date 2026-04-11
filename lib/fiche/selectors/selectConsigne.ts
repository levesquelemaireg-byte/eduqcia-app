import { ready, skeleton, hidden, sanitize, resolveDocPlaceholders } from "@/lib/fiche/helpers";
import type { SectionState, ConsigneData, SelectorRefs } from "@/lib/fiche/types";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import { selectNRContent } from "@/lib/fiche/selectors/selectNRContent";
import { hasFicheContent } from "@/lib/tae/fiche-helpers";
import { buildAmorceDocumentaire } from "@/lib/tae/consigne-helpers";
import { prepareNonRedactionConsigneForTeacherDisplay } from "@/lib/tae/non-redaction/ligne-du-temps-payload";

/**
 * Consigne de la tâche — HTML résolu et sanitisé.
 * NR : utilise le contenu non-rédactionnel + strip des éléments feuille élève.
 * Rédactionnel : consigne brute du bloc 3.
 */
export function selectConsigne(
  state: TaeFormState,
  _refs: SelectorRefs,
): SectionState<ConsigneData> {
  if (!state.bloc2.oiId) return hidden();

  const nrContent = selectNRContent(state);
  const rawHtml = nrContent?.consigne ?? state.bloc3.consigne;

  if (!rawHtml || !hasFicheContent(rawHtml)) return skeleton();

  const nbDocs = state.bloc2.nbDocuments ?? 0;
  const amorce = nbDocs > 0 ? buildAmorceDocumentaire(nbDocs) : null;

  // Strip éléments feuille élève (réponse, ancre guidage) pour affichage enseignant
  const teacherHtml = prepareNonRedactionConsigneForTeacherDisplay(rawHtml);
  // Résolution placeholders : {{doc_A}} → 1 + data-doc-ref → lettre
  const resolved = resolveDocPlaceholders(teacherHtml, nbDocs);
  const html = sanitize(resolved);

  return ready({ html, amorce });
}
