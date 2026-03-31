import { avantApresConfig } from "@/lib/tae/behaviours/avant-apres";
import { ligneDuTempsConfig } from "@/lib/tae/behaviours/ligne-du-temps";
import { ordreChronologiqueConfig } from "@/lib/tae/behaviours/ordre-chronologique";
import { redactionnelConfig } from "@/lib/tae/behaviours/redactionnel";
import { testScalabilityConfig } from "@/lib/tae/behaviours/test-scalability";
import type { ComportementConfig, ComportementSlug } from "@/lib/tae/behaviours/types";

const registry: Record<ComportementSlug, ComportementConfig> = {
  redactionnel: redactionnelConfig,
  "ordre-chronologique": ordreChronologiqueConfig,
  "ligne-du-temps": ligneDuTempsConfig,
  "avant-apres": avantApresConfig,
  "test-scalability": testScalabilityConfig,
};

export function getComportementConfig(slug: ComportementSlug): ComportementConfig {
  const config = registry[slug];
  if (!config) throw new Error(`Comportement inconnu : ${slug}`);
  return config;
}

export function getAllComportements(): ComportementConfig[] {
  return Object.values(registry);
}
