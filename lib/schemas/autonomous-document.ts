import { z } from "zod";

import { documentLegendPositionSchema, documentSourceTypeSchema } from "@/lib/schemas/document";
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

const aspectsSchema = z.object({
  economique: z.boolean(),
  politique: z.boolean(),
  social: z.boolean(),
  culturel: z.boolean(),
  territorial: z.boolean(),
});

/**
 * Création autonome `/documents/new` — aligné `docs/DECISIONS.md` § Module et `documents` (Supabase).
 */
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

/**
 * Sélections Miller (même modèle que le wizard TAÉ étape 6) — résolues en `connaissances_ids` côté serveur.
 */
export const autonomousDocumentFormSchema = z
  .object({
    titre: z.string().trim().min(1, "Requis"),
    doc_type: z.enum(["textuel", "iconographique"]),
    contenu: z.string().optional(),
    image_url: z.string().optional(),
    /** Dimensions pixel après téléversement (même action que Bloc 4 TAÉ) — non persistées en base. */
    image_intrinsic_width: z.number().int().positive().optional(),
    image_intrinsic_height: z.number().int().positive().optional(),
    source_citation: z.string().refine((s) => htmlHasMeaningfulText(s), { message: "Requis" }),
    source_type: documentSourceTypeSchema,
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
    image_legende: z.string().optional(),
    image_legende_position: documentLegendPositionSchema.nullable().optional(),
    repere_temporel: z.string().optional(),
    annee_normalisee: z.number().int().nullable().optional(),
    legal_accepted: z.boolean().refine((v) => v === true, {
      message: "Vous devez confirmer le cadre légal pour continuer.",
    }),
  })
  .superRefine((data, ctx) => {
    const anyAspect = Object.values(data.aspects).some(Boolean);
    if (!anyAspect) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["aspects"],
        message: "Sélectionnez au moins un aspect de société.",
      });
    }
    if (data.doc_type === "textuel") {
      if (!data.contenu?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contenu"],
          message: "Le contenu textuel est requis.",
        });
      }
    } else {
      const url = data.image_url?.trim() ?? "";
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["image_url"],
          message: "Téléversez une image ou fournissez une adresse HTTPS valide.",
        });
      }
      const legend = data.image_legende?.trim() ?? "";
      if (legend.length > 0) {
        if (countWordsFr(legend) > 50) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["image_legende"],
            message: DOCUMENT_MODULE_LEGEND_WORDS_ERROR,
          });
        }
        if (!data.image_legende_position) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["image_legende_position"],
            message: DOCUMENT_MODULE_LEGEND_POSITION_ERROR,
          });
        }
      }
    }
    if (data.annee_normalisee != null && !isAnneeNormaliseeInAllowedRange(data.annee_normalisee)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["annee_normalisee"],
        message: ERROR_ANNEE_NORMALISEE_RANGE,
      });
    }
  });

export type AutonomousDocumentFormValues = z.infer<typeof autonomousDocumentFormSchema>;
