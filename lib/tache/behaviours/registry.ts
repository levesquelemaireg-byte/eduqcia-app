import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { Bloc5Props } from "@/lib/tache/tache-form-state-types";
import { avantApresConfig } from "@/lib/tache/behaviours/avant-apres";
import { ligneDuTempsConfig } from "@/lib/tache/behaviours/ligne-du-temps";
import { ordreChronologiqueConfig } from "@/lib/tache/behaviours/ordre-chronologique";
import { redactionnelConfig } from "@/lib/tache/behaviours/redactionnel";
import type { ComportementConfig, ComportementSlug } from "@/lib/tache/behaviours/types";

const registry: Record<ComportementSlug, ComportementConfig> = {
  redactionnel: redactionnelConfig,
  "ordre-chronologique": ordreChronologiqueConfig,
  "ligne-du-temps": ligneDuTempsConfig,
  "avant-apres": avantApresConfig,
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
  redactionnel: dynamic(() => import("@/components/tache/wizard/bloc5/Bloc5Redactionnel"), {
    ssr: false,
  }),
  "ordre-chronologique": dynamic(
    () => import("@/components/tache/wizard/bloc5/non-redactionnel/Bloc5OrdreChronologique"),
    { ssr: false },
  ),
  "ligne-du-temps": dynamic(
    () => import("@/components/tache/wizard/bloc5/non-redactionnel/Bloc5LigneDuTemps"),
    { ssr: false },
  ),
  "avant-apres": dynamic(
    () => import("@/components/tache/wizard/bloc5/non-redactionnel/Bloc5AvantApres"),
    { ssr: false },
  ),
};

export function getBloc5DynamicComponent(slug: ComportementSlug): ComponentType<Bloc5Props> {
  return BLOC5_DYNAMIC_BY_SLUG[slug];
}
