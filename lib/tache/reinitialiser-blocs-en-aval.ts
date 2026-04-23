import { initialCdFormSlice } from "@/lib/tache/cd-helpers";
import { SCHEMA_CD1_INITIAL } from "@/lib/tache/schema-cd1/types";
import {
  initialBloc3,
  initialBloc5,
  initialBloc7,
  type BlueprintSlice,
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
 *
 * Le paramètre optionnel `nextTypeTache` indique le parcours **résultant**
 * après l'action. Cas Section B : le bloc 3 contient `schemaCd1` dont la
 * structure accompagne le parcours tant qu'il reste actif — on remet à la
 * structure neuve plutôt qu'à `null`, sinon les actions `SET_SCHEMA_*`
 * deviennent no-op (elles refusent de patcher un schéma absent) et les
 * champs du chapeau sont figés. Si le paramètre est omis, on lit le
 * `typeTache` courant (utile pour les actions qui ne le modifient pas).
 */
export function reinitialiserBlocsEnAval(
  state: TacheFormState,
  nextTypeTache?: BlueprintSlice["typeTache"],
): Pick<TacheFormState, "bloc3" | "bloc4" | "bloc5" | "bloc6" | "bloc7"> {
  const typeTache = nextTypeTache ?? state.bloc2.typeTache;
  const bloc3 =
    typeTache === "section_b" ? { ...initialBloc3, schemaCd1: SCHEMA_CD1_INITIAL } : initialBloc3;
  return {
    bloc3,
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
