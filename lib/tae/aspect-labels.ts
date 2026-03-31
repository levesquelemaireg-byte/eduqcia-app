import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";

/** Libellés français des aspects de société (UI, publication, fiches). */
export const ASPECT_LABEL: Record<AspectSocieteKey, string> = {
  economique: "Économique",
  politique: "Politique",
  social: "Social",
  culturel: "Culturel",
  territorial: "Territorial",
};
