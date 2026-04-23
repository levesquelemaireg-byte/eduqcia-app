import { hidden, ready, skeleton } from "@/lib/fiche/helpers";
import type { SectionState, SelectorRefs } from "@/lib/fiche/types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import {
  compterCasesCompletes,
  obtenirCase,
  type CaseSchemaCd1,
  type CleCase,
  TOUTES_LES_CASES,
} from "@/lib/tache/schema-cd1/types";

export type CaseSommaire = {
  cleCase: CleCase;
  titre: string;
  sousTitre: string | null;
  guidage: string;
  reponse: string;
};

export type SchemaSeptCasesData = {
  cases: Record<CleCase, CaseSommaire>;
  compteur: number;
};

function titreSimple(cle: CleCase): string {
  switch (cle) {
    case "objet":
      return "Objet de la description";
    case "blocA.pivot":
    case "blocB.pivot":
      return "Élément central";
    default:
      return "Élément de précision";
  }
}

function sousTitre(
  cle: CleCase,
  aspectA: TacheFormState["bloc2"]["aspectA"],
  aspectB: TacheFormState["bloc2"]["aspectB"],
): string | null {
  if (cle === "objet") return null;
  const aspect = cle.startsWith("blocA.") ? aspectA : aspectB;
  return aspect ? `Aspect ${ASPECT_LABEL[aspect].toLowerCase()}` : null;
}

export function selectSchemaSeptCases(
  state: TacheFormState,
  _refs: SelectorRefs,
): SectionState<SchemaSeptCasesData> {
  const schema = state.bloc3.schemaCd1;
  if (!schema) return hidden();

  const compteur = compterCasesCompletes(schema);
  if (compteur === 0) return skeleton();

  const cases = {} as Record<CleCase, CaseSommaire>;
  for (const cle of TOUTES_LES_CASES) {
    const donnees: CaseSchemaCd1 = obtenirCase(schema, cle);
    cases[cle] = {
      cleCase: cle,
      titre: titreSimple(cle),
      sousTitre: sousTitre(cle, state.bloc2.aspectA, state.bloc2.aspectB),
      guidage: donnees.guidage,
      reponse: donnees.reponse,
    };
  }

  return ready({ cases, compteur });
}
