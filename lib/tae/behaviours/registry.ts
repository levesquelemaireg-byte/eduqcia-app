import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { Bloc5Props } from "@/lib/tae/tae-form-state-types";
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

/** `next/dynamic` au chargement du module uniquement — pas d’instanciation pendant le rendu. */
export const BLOC5_DYNAMIC_BY_SLUG: Record<ComportementSlug, ComponentType<Bloc5Props>> = {
  redactionnel: dynamic(() => import("@/components/tae/TaeForm/bloc5/Bloc5Redactionnel"), {
    ssr: false,
  }),
  "ordre-chronologique": dynamic(
    () => import("@/components/tae/TaeForm/bloc5/non-redactionnel/Bloc5OrdreChronologique"),
    { ssr: false },
  ),
  "ligne-du-temps": dynamic(
    () => import("@/components/tae/TaeForm/bloc5/non-redactionnel/Bloc5LigneDuTemps"),
    { ssr: false },
  ),
  "avant-apres": dynamic(
    () => import("@/components/tae/TaeForm/bloc5/non-redactionnel/Bloc5AvantApres"),
    { ssr: false },
  ),
  "test-scalability": dynamic(
    () => import("@/components/tae/TaeForm/bloc5/non-redactionnel/Bloc5TestScalability"),
    { ssr: false },
  ),
};

export function getBloc5DynamicComponent(slug: ComportementSlug): ComponentType<Bloc5Props> {
  return BLOC5_DYNAMIC_BY_SLUG[slug];
}
