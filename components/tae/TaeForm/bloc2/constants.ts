import type { DisciplineCode, NiveauCode } from "@/lib/tae/blueprint-helpers";

/** docs/UI-COPY.md — Étape 2 — modale aide OI — titre exact. */
export const MODAL_TITRE_OPERATION_INTELLECTUELLE =
  "Qu\u2019est-ce qu\u2019une opération intellectuelle ?";

export const NIVEAUX: { value: NiveauCode; label: string }[] = [
  { value: "sec1", label: "Secondaire 1" },
  { value: "sec2", label: "Secondaire 2" },
  { value: "sec3", label: "Secondaire 3" },
  { value: "sec4", label: "Secondaire 4" },
];

/** Options `<select>` niveau — Sec 5 désactivé (non disponible). */
export const NIVEAU_SELECT_OPTIONS: {
  value: NiveauCode | "sec5";
  label: string;
  disabled?: boolean;
}[] = [...NIVEAUX, { value: "sec5", label: "Secondaire 5", disabled: true }];

export const DISCIPLINE_LABEL: Record<DisciplineCode, string> = {
  hec: "Histoire et éducation à la citoyenneté",
  geo: "Géographie et éducation à la citoyenneté",
  hqc: "Histoire du Québec et du Canada",
};
