import type { TaeFormState } from "@/lib/tae/tae-form-state-types";

/** Charge utile ordre chrono depuis `bloc5.nonRedaction` (pour `normalize*` / effets). */
export function nonRedactionOrdrePayload(state: TaeFormState): unknown {
  const nr = state.bloc5.nonRedaction;
  if (nr?.type !== "ordre-chronologique") return null;
  return nr.payload;
}

/** Charge utile ligne du temps depuis `bloc5.nonRedaction`. */
export function nonRedactionLignePayload(state: TaeFormState): unknown {
  const nr = state.bloc5.nonRedaction;
  if (nr?.type !== "ligne-du-temps") return null;
  return nr.payload;
}

export function nonRedactionAvantApresPayload(state: TaeFormState): unknown {
  const nr = state.bloc5.nonRedaction;
  if (nr?.type !== "avant-apres") return null;
  return nr.payload;
}
