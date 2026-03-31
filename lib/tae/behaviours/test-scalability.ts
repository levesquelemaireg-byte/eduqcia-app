import type { ComportementConfig } from "@/lib/tae/behaviours/types";

/**
 * Entrée réservée au test Vitest « scalabilité » — aucun `comportement_id` réel ne pointe ici.
 */
export const testScalabilityConfig: ComportementConfig = {
  slug: "test-scalability",
  label: "Test scalabilité",
  isRedactionnel: false,
  bloc3: { hasGuidage: false },
  bloc4: { documentCount: null, requiresRepereTemporel: false },
  completionCriteria: {
    bloc3: () => true,
    bloc4: () => true,
    bloc5: () => false,
    bloc6: () => true,
    bloc7: () => true,
  },
};
