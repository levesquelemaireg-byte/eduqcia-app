import { hidden, ready, sanitize, skeleton } from "@/lib/fiche/helpers";
import type { SectionState, SelectorRefs } from "@/lib/fiche/types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import { hasFicheContent } from "@/lib/tache/fiche-helpers";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import { SECTION_B_DEMARCHE_ETAPES } from "@/lib/ui/ui-copy";

/**
 * Dispositif introductif de la Section B — Sommaire :
 *   préambule (HTML) + chapeau (HTML gras) + démarche invariable (liste HTML).
 */
export type DispositifIntroductifData = {
  preambuleHtml: string;
  chapeauHtml: string;
  demarcheHtml: string;
};

function buildChapeauHtml(
  objet: string,
  periode: string,
  aspectA: string | null,
  aspectB: string | null,
): string {
  const o = objet.trim() || "[objet d'étude]";
  const p = periode.trim() || "[période]";
  const a = aspectA ? aspectA.toLowerCase() : "[aspect à choisir]";
  const b = aspectB ? aspectB.toLowerCase() : "[aspect à choisir]";
  return `<p><strong>Décrivez ${o} ${p} sous ses aspects ${a} et ${b}.</strong></p>`;
}

function buildDemarcheHtml(): string {
  return `<ol>${SECTION_B_DEMARCHE_ETAPES.map((etape) => `<li>${etape}</li>`).join("")}</ol>`;
}

export function selectDispositifIntroductif(
  state: TacheFormState,
  _refs: SelectorRefs,
): SectionState<DispositifIntroductifData> {
  const schema = state.bloc3.schemaCd1;
  if (!schema) return hidden();

  const hasPreambule = hasFicheContent(schema.preambule);
  const hasChapeauObjet = schema.chapeauObjet.trim().length > 0;
  const hasChapeauPeriode = schema.chapeauPeriode.trim().length > 0;
  const hasAspects = state.bloc2.aspectA !== null && state.bloc2.aspectB !== null;

  if (!hasPreambule && !hasChapeauObjet && !hasChapeauPeriode && !hasAspects) {
    return skeleton();
  }

  const aspectA = state.bloc2.aspectA ? ASPECT_LABEL[state.bloc2.aspectA] : null;
  const aspectB = state.bloc2.aspectB ? ASPECT_LABEL[state.bloc2.aspectB] : null;

  return ready({
    preambuleHtml: hasPreambule ? sanitize(schema.preambule) : "",
    chapeauHtml: sanitize(
      buildChapeauHtml(schema.chapeauObjet, schema.chapeauPeriode, aspectA, aspectB),
    ),
    demarcheHtml: sanitize(buildDemarcheHtml()),
  });
}
