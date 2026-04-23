import { ready } from "@/lib/fiche/helpers";
import type { SectionState, HeaderData, SelectorRefs } from "@/lib/fiche/types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import { NIVEAUX, DISCIPLINE_LABEL } from "@/components/tache/wizard/bloc2/constants";
import type { NiveauCode, DisciplineCode } from "@/lib/tache/blueprint-helpers";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import { resoudreParcours } from "@/lib/tache/parcours/resolveur";
import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";

/**
 * Header fiche : icône OI, pastilles métadonnées.
 * Toujours `ready` — le composant gère les placeholders visuels pour les champs vides.
 */
export function selectHeaderMeta(
  state: TacheFormState,
  refs: SelectorRefs,
): SectionState<HeaderData> {
  const parcours = resoudreParcours(state.bloc2.typeTache);
  const oiEntry = parcours.oiPertinente
    ? refs.oiList.find((o) => o.id === state.bloc2.oiId)
    : undefined;
  const comportement = oiEntry?.comportements_attendus.find(
    (c) => c.id === state.bloc2.comportementId,
  );

  const niveauLabel =
    NIVEAUX.find((n) => n.value === (state.bloc2.niveau as NiveauCode))?.label ?? "";
  const disc = state.bloc2.discipline;
  const disciplineLabel =
    disc && disc in DISCIPLINE_LABEL ? DISCIPLINE_LABEL[disc as DisciplineCode] : "";

  // Aspects imposés par le parcours (Section B) + aspects cochés manuellement (bloc 7).
  const aspectsSet = new Set<AspectSocieteKey>();
  for (const [k, v] of Object.entries(state.bloc7.aspects) as [AspectSocieteKey, boolean][]) {
    if (v) aspectsSet.add(k);
  }
  if (parcours.aspectsRequis) {
    if (state.bloc2.aspectA) aspectsSet.add(state.bloc2.aspectA);
    if (state.bloc2.aspectB) aspectsSet.add(state.bloc2.aspectB);
  }
  const aspectsSociete = [...aspectsSet].map((k) => ASPECT_LABEL[k]);

  return ready({
    oi: oiEntry ? { id: oiEntry.id, titre: oiEntry.titre, icone: oiEntry.icone } : null,
    parcours: parcours.oiPertinente
      ? null
      : { label: parcours.label, icone: parcours.icone, iconMirror: parcours.iconMirror },
    comportement: comportement ? { id: comportement.id, enonce: comportement.enonce } : null,
    niveau: niveauLabel,
    discipline: disciplineLabel,
    aspectsSociete,
  });
}
