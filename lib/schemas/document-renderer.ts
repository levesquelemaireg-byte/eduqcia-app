/**
 * Schémas Zod — validation des documents multi-éléments (document-renderer).
 *
 * Réutilise les schémas existants :
 * - `categorieTextuelleSchema` (`lib/documents/categorie-textuelle.ts`)
 * - `typeIconographiqueSchema` (`lib/documents/type-iconographique.ts`)
 */

import { z } from "zod";
import { categorieTextuelleSchema } from "@/lib/documents/categorie-textuelle";
import { typeIconographiqueSchema } from "@/lib/documents/type-iconographique";

// ---------------------------------------------------------------------------
// Éléments
// ---------------------------------------------------------------------------

const sourceTypeSchema = z.enum(["primaire", "secondaire"]);

const legendePositionSchema = z.enum(["haut_gauche", "haut_droite", "bas_gauche", "bas_droite"]);

const baseElementSchema = z.object({
  id: z.string().min(1),
  auteur: z.string().optional(),
  repereTemporel: z.string().optional(),
  sousTitre: z.string().optional(),
  source: z.string().min(1, "Source requise"),
  sourceType: sourceTypeSchema,
});

const textuelElementSchema = baseElementSchema.extend({
  type: z.literal("textuel"),
  contenu: z.string().min(1, "Contenu requis"),
  categorieTextuelle: categorieTextuelleSchema,
});

const iconographiqueElementSchema = baseElementSchema.extend({
  type: z.literal("iconographique"),
  imageUrl: z.string().url("URL d'image requise"),
  legende: z.string().optional(),
  legendePosition: legendePositionSchema.optional(),
  categorieIconographique: typeIconographiqueSchema,
});

export const documentElementSchema = z.discriminatedUnion("type", [
  textuelElementSchema,
  iconographiqueElementSchema,
]);

// ---------------------------------------------------------------------------
// Structure
// ---------------------------------------------------------------------------

export const documentStructureSchema = z.enum(["simple", "perspectives", "deux_temps"]);

// ---------------------------------------------------------------------------
// Document complet
// ---------------------------------------------------------------------------

export const rendererDocumentSchema = z
  .object({
    id: z.string().min(1),
    titre: z.string().min(1, "Titre requis"),
    structure: documentStructureSchema,
    elements: z.array(documentElementSchema).min(1),
    repereTemporelDocument: z.string().optional(),
  })
  .superRefine((doc, ctx) => {
    // Règles de cardinalité par structure
    if (doc.structure === "simple" && doc.elements.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Un document simple doit contenir exactement 1 élément.",
        path: ["elements"],
      });
    }
    if (doc.structure === "perspectives") {
      if (doc.elements.length < 2 || doc.elements.length > 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Un document à perspectives doit contenir 2 ou 3 éléments.",
          path: ["elements"],
        });
      }
      // Auteur obligatoire par élément
      for (let i = 0; i < doc.elements.length; i++) {
        if (!doc.elements[i].auteur?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Chaque perspective doit avoir un auteur.",
            path: ["elements", i, "auteur"],
          });
        }
      }
    }
    if (doc.structure === "deux_temps") {
      if (doc.elements.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Un document à deux temps doit contenir exactement 2 éléments.",
          path: ["elements"],
        });
      }
      // Repère temporel obligatoire par élément
      for (let i = 0; i < doc.elements.length; i++) {
        if (!doc.elements[i].repereTemporel?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Chaque temps doit avoir un repère temporel.",
            path: ["elements", i, "repereTemporel"],
          });
        }
      }
    }

    // Légende iconographique : position obligatoire si légende présente
    for (let i = 0; i < doc.elements.length; i++) {
      const el = doc.elements[i];
      if (el.type === "iconographique" && el.legende?.trim() && !el.legendePosition) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La position de la légende est requise si une légende est saisie.",
          path: ["elements", i, "legendePosition"],
        });
      }
    }
  });

export type RendererDocumentInput = z.input<typeof rendererDocumentSchema>;
