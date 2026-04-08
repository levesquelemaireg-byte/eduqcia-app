/**
 * Logique partagée entre la maquette « fiche sommaire » et « miniature banque » (DEV `/dev/summary-mockup`).
 */

import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";
import type { TaeNonRedactionVariantSlug } from "@/lib/tae/non-redaction/variant-slugs";
import type { AspectSociete, TaeFicheData } from "@/lib/types/fiche";
import { truncateText } from "@/lib/utils/stripHtml";

const ASPECT_LABEL_FR: Record<AspectSociete, string> = {
  economique: "Économique",
  politique: "Politique",
  social: "Social",
  culturel: "Culturel",
  territorial: "Territorial",
};

const VARIANT_SLUG_LABEL_FR: Record<TaeNonRedactionVariantSlug, string> = {
  "ordre-chronologique": "Ordre chronologique",
  "ligne-du-temps": "Ligne du temps",
  "avant-apres": "Avant / après",
  "carte-historique": "Carte historique",
  manifestations: "Manifestations",
  "causes-consequences": "Causes et conséquences",
};

export function aspectLabelsForBankMockup(aspects: string[]): string[] {
  return aspects.map((a) => ASPECT_LABEL_FR[a as AspectSociete] ?? a);
}

export function modeReponseLabelForBankMockup(tae: TaeFicheData): string {
  const slug = getVariantSlugForComportementId(tae.comportement.id);
  if (slug) {
    return VARIANT_SLUG_LABEL_FR[slug] ?? slug;
  }
  if (tae.showStudentAnswerLines === false) {
    return "Parcours non rédactionnel";
  }
  return `${tae.nb_lignes} ligne${tae.nb_lignes === 1 ? "" : "s"} pour la réponse`;
}

export function truncatePlainForBankMockup(s: string, max: number): string {
  return truncateText(s.trim(), max);
}
