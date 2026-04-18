import { getWizardBlocConfig } from "@/lib/tae/wizard-bloc-config";
import {
  emptyMoments,
  emptyPerspectives,
  migrateMomentsToSlots,
  migratePerspectivesToSlots,
  migrateSlotsToMoments,
  migrateSlotsToPerpsectives,
} from "@/lib/tae/oi-perspectives/perspectives-helpers";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";

/**
 * Gère la migration groupé ↔ séparé pour perspectives (OI3) et moments (OI6).
 * Extrait du reducer principal pour maintenir la taille sous contrôle.
 */
export function handlePerspectivesModeWithMigration(
  state: TaeFormState,
  action: { value: "groupe" | "separe"; count: 2 | 3 },
): TaeFormState {
  const prev = state.bloc3.perspectivesMode;
  const next = action.value;
  if (prev === next) return state;

  const cfg = getWizardBlocConfig(state.bloc2.comportementId);
  const isMoments = cfg?.bloc4.type === "moments";
  const emptyBloc4 = {
    documents: {},
    perspectives: null,
    perspectivesTitre: "",
    moments: null,
    momentsTitre: "",
  };

  if (isMoments) {
    // OI6 — moments
    if (prev === "groupe" && next === "separe") {
      const migratedDocs = state.bloc4.moments ? migrateMomentsToSlots(state.bloc4.moments) : {};
      return {
        ...state,
        bloc3: { ...state.bloc3, perspectivesMode: next },
        bloc4: { ...emptyBloc4, documents: migratedDocs },
      };
    }
    if (prev === "separe" && next === "groupe") {
      const migratedMom = migrateSlotsToMoments(state.bloc4.documents, 2);
      return {
        ...state,
        bloc3: { ...state.bloc3, perspectivesMode: next },
        bloc4: { ...emptyBloc4, moments: migratedMom, momentsTitre: state.bloc4.momentsTitre },
      };
    }
    // Premier choix
    return {
      ...state,
      bloc3: { ...state.bloc3, perspectivesMode: next },
      bloc4:
        next === "groupe"
          ? { ...emptyBloc4, moments: emptyMoments(2), momentsTitre: state.bloc4.momentsTitre }
          : emptyBloc4,
    };
  }

  // OI3 — perspectives
  if (prev === "groupe" && next === "separe") {
    const migratedDocs = state.bloc4.perspectives
      ? migratePerspectivesToSlots(state.bloc4.perspectives)
      : {};
    return {
      ...state,
      bloc3: { ...state.bloc3, perspectivesMode: next },
      bloc4: { ...emptyBloc4, documents: migratedDocs },
    };
  }
  if (prev === "separe" && next === "groupe") {
    const migratedPersp = migrateSlotsToPerpsectives(state.bloc4.documents, action.count);
    return {
      ...state,
      bloc3: { ...state.bloc3, perspectivesMode: next },
      bloc4: {
        ...emptyBloc4,
        perspectives: migratedPersp,
        perspectivesTitre: state.bloc4.perspectivesTitre,
      },
    };
  }
  // Premier choix
  return {
    ...state,
    bloc3: { ...state.bloc3, perspectivesMode: next },
    bloc4:
      next === "groupe"
        ? {
            ...emptyBloc4,
            perspectives: emptyPerspectives(action.count),
            perspectivesTitre: state.bloc4.perspectivesTitre,
          }
        : emptyBloc4,
  };
}
