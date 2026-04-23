import { initialCdFormSlice } from "@/lib/tache/cd-helpers";
import {
  initialBloc3,
  initialBloc5,
  initialBloc7,
  type TacheFormState,
} from "@/lib/tache/tache-form-state-types";

/**
 * Réinitialise les blocs 3 à 7 à leur état initial.
 *
 * Appelé par TOUTES les actions qui modifient le blueprint fondamental :
 * SET_NIVEAU, SET_DISCIPLINE, SET_TYPE_TACHE, SET_OI, SET_COMPORTEMENT,
 * SET_ASPECT_A, SET_ASPECT_B.
 *
 * Source de vérité unique pour le reset des blocs en aval.
 */
export function reinitialiserBlocsEnAval(
  _state: TacheFormState,
): Pick<TacheFormState, "bloc3" | "bloc4" | "bloc5" | "bloc6" | "bloc7"> {
  return {
    bloc3: initialBloc3,
    bloc4: {
      documents: {},
      perspectives: null,
      perspectivesTitre: "",
      moments: null,
      momentsTitre: "",
    },
    bloc5: initialBloc5,
    bloc6: { cd: initialCdFormSlice },
    bloc7: { ...initialBloc7, connaissances: [] },
  };
}
