/** docs/WORKFLOWS.md §4.3 — cases du formulaire (pas « Scientifique et technologique »). */
export type AspectSocieteKey = "economique" | "politique" | "social" | "culturel" | "territorial";

export type RedactionSlice = {
  consigne: string;
  aspects: Record<AspectSocieteKey, boolean>;
  guidage: string;
  corrige: string;
};

export const initialAspects: Record<AspectSocieteKey, boolean> = {
  economique: false,
  politique: false,
  social: false,
  culturel: false,
  territorial: false,
};

export const initialRedactionSlice: RedactionSlice = {
  consigne: "",
  aspects: { ...initialAspects },
  guidage: "",
  corrige: "",
};

import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";

/** docs/WORKFLOWS.md §4.1 + docs/WORKFLOWS.md §10 — HTML TipTap pour consigne / corrigé. */
export function isRedactionStepComplete(r: RedactionSlice): boolean {
  if (!htmlHasMeaningfulText(r.consigne)) return false;
  if (!Object.values(r.aspects).some(Boolean)) return false;
  if (!htmlHasMeaningfulText(r.corrige)) return false;
  return true;
}
