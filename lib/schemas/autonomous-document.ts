import { z } from "zod";

import { categorieTextuelleSchema } from "@/lib/documents/categorie-textuelle";
import { typeIconographiqueSchema } from "@/lib/documents/type-iconographique";
import { documentLegendPositionSchema, documentSourceTypeSchema } from "@/lib/schemas/document";
import { documentStructureSchema } from "@/lib/schemas/document-renderer";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import {
  DOCUMENT_MODULE_LEGEND_POSITION_ERROR,
  DOCUMENT_MODULE_LEGEND_WORDS_ERROR,
  ERROR_ANNEE_NORMALISEE_RANGE,
} from "@/lib/ui/ui-copy";
import { isAnneeNormaliseeInAllowedRange } from "@/lib/utils/annee-normalisee-bounds";

/** Compte les « mots » par suites de caractères non blancs (FR). */
export function countWordsFr(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Limite de mots pour la légende (documents iconographiques) — aligné `LimitCounterPill`. */
export const DOCUMENT_LEGEND_MAX_WORDS = 50;
/** Dernier palier neutre avant la rampe d'avertissement (compteur > cette valeur). */
export const DOCUMENT_LEGEND_WORD_WARNING_AFTER = 45;

const aspectsSchema = z.object({
  economique: z.boolean(),
  politique: z.boolean(),
  social: z.boolean(),
  culturel: z.boolean(),
  territorial: z.boolean(),
});

const connaissanceMillerSelectionSchema = z.object({
  rowId: z.string().min(1),
  realite_sociale: z.string(),
  section: z.string(),
  sous_section: z.string().nullable(),
  enonce: z.string(),
});

/** Coercion explicite (évite `z.coerce` + `unknown` côté `@hookform/resolvers` / RHF). */
function preprocessIntId(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Élément de document (un par structure simple, 2-3 pour perspectives/deux_temps)
// ---------------------------------------------------------------------------

export const documentElementFormSchema = z.object({
  /** Identifiant local stable (UUID client). */
  id: z.string().min(1),
  type: z.enum(["textuel", "iconographique"]),
  contenu: z.string().optional(),
  image_url: z.string().optional(),
  image_intrinsic_width: z.number().int().positive().optional(),
  image_intrinsic_height: z.number().int().positive().optional(),
  source_citation: z.string(),
  source_type: documentSourceTypeSchema,
  image_legende: z.string().optional(),
  image_legende_position: documentLegendPositionSchema.nullable().optional(),
  type_iconographique: z
    .union([typeIconographiqueSchema, z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === undefined || v === null ? null : v)),
  categorie_textuelle: z
    .union([categorieTextuelleSchema, z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === undefined || v === null ? null : v)),
  /** Auteur — obligatoire pour structure perspectives. */
  auteur: z.string().optional(),
  /** Repère temporel par élément — obligatoire pour structure deux_temps. */
  repere_temporel: z.string().optional(),
  /** Sous-titre — optionnel, structure deux_temps. */
  sous_titre: z.string().optional(),
});

export type DocumentElementFormValues = z.infer<typeof documentElementFormSchema>;

// ---------------------------------------------------------------------------
// Document complet
// ---------------------------------------------------------------------------

export const autonomousDocumentFormSchema = z
  .object({
    structure: documentStructureSchema,
    nb_perspectives: z.union([z.literal(2), z.literal(3)]).optional(),
    titre: z.string().trim().min(1, "Requis"),
    elements: z.array(documentElementFormSchema).min(1),
    /** Repère temporel global (niveau document). */
    repere_temporel: z.string().optional(),
    annee_normalisee: z.number().int().nullable().optional(),
    niveau_id: z.preprocess(
      preprocessIntId,
      z.number().int().positive({ message: "Sélectionnez un niveau." }),
    ),
    discipline_id: z.preprocess(
      preprocessIntId,
      z.number().int().positive({ message: "Sélectionnez une discipline." }),
    ),
    connaissances_miller: z.array(connaissanceMillerSelectionSchema),
    aspects: aspectsSchema,
    legal_accepted: z.boolean().refine((v) => v === true, {
      message: "Vous devez confirmer le cadre légal pour continuer.",
    }),
  })
  .superRefine((data, ctx) => {
    // Aspects requis
    const anyAspect = Object.values(data.aspects).some(Boolean);
    if (!anyAspect) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["aspects"],
        message: "Sélectionnez au moins un aspect de société.",
      });
    }

    // Cardinalité éléments
    if (data.structure === "simple" && data.elements.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["elements"],
        message: "Un document simple doit contenir exactement 1 élément.",
      });
    }
    if (data.structure === "perspectives") {
      if (data.elements.length < 2 || data.elements.length > 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["elements"],
          message: "Un document à perspectives doit contenir 2 ou 3 éléments.",
        });
      }
    }
    if (data.structure === "deux_temps" && data.elements.length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["elements"],
        message: "Un document à deux temps doit contenir exactement 2 éléments.",
      });
    }

    // Validation par élément
    for (let i = 0; i < data.elements.length; i++) {
      const el = data.elements[i];

      // Contenu requis selon type
      if (el.type === "textuel") {
        if (!el.contenu?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["elements", i, "contenu"],
            message: "Le contenu textuel est requis.",
          });
        }
        if (el.categorie_textuelle == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["elements", i, "categorie_textuelle"],
            message: "Sélectionnez une catégorie textuelle.",
          });
        }
      } else {
        const url = el.image_url?.trim() ?? "";
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["elements", i, "image_url"],
            message: "Téléversez une image ou fournissez une adresse HTTPS valide.",
          });
        }
      }

      // Source requise
      if (!htmlHasMeaningfulText(el.source_citation)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["elements", i, "source_citation"],
          message: "Source requise.",
        });
      }

      // Légende iconographique
      const legend = el.image_legende?.trim() ?? "";
      if (legend.length > 0) {
        if (countWordsFr(legend) > DOCUMENT_LEGEND_MAX_WORDS) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["elements", i, "image_legende"],
            message: DOCUMENT_MODULE_LEGEND_WORDS_ERROR,
          });
        }
        if (!el.image_legende_position) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["elements", i, "image_legende_position"],
            message: DOCUMENT_MODULE_LEGEND_POSITION_ERROR,
          });
        }
      }

      // Auteur obligatoire pour perspectives
      if (data.structure === "perspectives" && !el.auteur?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["elements", i, "auteur"],
          message: "Chaque perspective doit avoir un auteur.",
        });
      }

      // Repère temporel obligatoire par élément pour deux_temps
      if (data.structure === "deux_temps" && !el.repere_temporel?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["elements", i, "repere_temporel"],
          message: "Chaque temps doit avoir un repère temporel.",
        });
      }
    }

    // Année normalisée
    if (data.annee_normalisee != null && !isAnneeNormaliseeInAllowedRange(data.annee_normalisee)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["annee_normalisee"],
        message: ERROR_ANNEE_NORMALISEE_RANGE,
      });
    }
  });

export type AutonomousDocumentFormValues = z.infer<typeof autonomousDocumentFormSchema>;

/** Édition `/documents/[id]/edit` — même champs + identifiant document. */
export const autonomousDocumentUpdateFormSchema = autonomousDocumentFormSchema.and(
  z.object({
    document_id: z.string().uuid(),
  }),
);

export type AutonomousDocumentUpdateFormValues = z.infer<typeof autonomousDocumentUpdateFormSchema>;
