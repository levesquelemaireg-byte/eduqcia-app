import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

/**
 * Slugs de comportement wizard — alignés sur `public/data/oi.json` (`variant_slug`) + `redactionnel`.
 */
export type ComportementSlug =
  | "redactionnel"
  | "ordre-chronologique"
  | "ligne-du-temps"
  | "avant-apres";

export interface ComportementConfig {
  slug: ComportementSlug;
  label: string;
  isRedactionnel: boolean;
  bloc3: {
    hasGuidage: boolean;
  };
  bloc4: {
    documentCount: number | null;
    requiresRepereTemporel: boolean;
  };
  completionCriteria: {
    bloc3: (state: TacheFormState) => boolean;
    bloc4: (state: TacheFormState) => boolean;
    bloc5: (state: TacheFormState) => boolean;
    bloc6: (state: TacheFormState) => boolean;
    bloc7: (state: TacheFormState) => boolean;
  };
}
