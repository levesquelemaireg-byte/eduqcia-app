import { z } from "zod";

/** Aligné `documents.source_type` — registre `docs/DECISIONS.md` § Module. */
export const documentSourceTypeSchema = z.enum(["primaire", "secondaire"]);

/** Aligné `documents.image_legende_position`. */
export const documentLegendPositionSchema = z.enum([
  "haut_gauche",
  "haut_droite",
  "bas_gauche",
  "bas_droite",
]);
