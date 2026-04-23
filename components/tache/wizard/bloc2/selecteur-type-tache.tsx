"use client";

import { RadioCardGroup, type RadioCardOption } from "@/components/ui/RadioCardGroup";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { tousLesParcours } from "@/lib/tache/parcours/registre";
import type { ParcoursId } from "@/lib/tache/parcours/types";
import type { TypeTache } from "@/lib/tache/parcours/resolveur";

const TYPE_BY_PARCOURS_ID: Record<ParcoursId, TypeTache> = {
  "section-a": "section_a",
  "section-b-schema-cd1": "section_b",
  "section-c-interpretation-cd2": "section_c",
};

const PARCOURS_BY_TYPE: Record<TypeTache, ParcoursId> = {
  section_a: "section-a",
  section_b: "section-b-schema-cd1",
  section_c: "section-c-interpretation-cd2",
};

export function SelecteurTypeTache() {
  const { state, dispatch } = useTacheForm();
  const { typeTache, blueprintLocked } = state.bloc2;

  const parcours = tousLesParcours();

  const options: RadioCardOption[] = parcours.map((p) => ({
    value: p.id,
    label: p.label,
    description: p.description,
    disabled: !p.actif,
    badge: p.actif ? undefined : "Bientôt disponible",
  }));

  const valueParcoursId = PARCOURS_BY_TYPE[typeTache];

  return (
    <RadioCardGroup
      name="typeTache"
      label="Type de tâche"
      required
      columns={1}
      options={options}
      value={valueParcoursId}
      disabled={blueprintLocked}
      onChange={(v) => {
        const next = TYPE_BY_PARCOURS_ID[v as ParcoursId];
        if (!next) return;
        dispatch({ type: "SET_TYPE_TACHE", value: next });
      }}
    />
  );
}
