import { z } from "zod";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const EVALUATION_TITRE_MAX = 500;

export const evaluationTitreSchema = z
  .string()
  .trim()
  .min(1, "titre_requis")
  .max(EVALUATION_TITRE_MAX, "titre_trop_long");

const uuidString = z.string().regex(UUID_RE, "uuid_invalide");

export const evaluationCompositionBodySchema = z.object({
  evaluationId: z
    .union([z.null(), z.literal(""), uuidString, z.undefined()])
    .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
  titre: evaluationTitreSchema,
  taeIds: z.array(uuidString),
});

export type EvaluationCompositionBody = z.infer<typeof evaluationCompositionBodySchema>;

export function parseEvaluationCompositionBody(
  raw: unknown,
  publish: boolean,
): { ok: true; data: EvaluationCompositionBody } | { ok: false; code: string } {
  const parsed = evaluationCompositionBodySchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, code: first?.message ?? "validation" };
  }
  if (publish && parsed.data.taeIds.length < 1) {
    return { ok: false, code: "publication_sans_tache" };
  }
  const seen = new Set<string>();
  for (const id of parsed.data.taeIds) {
    if (seen.has(id)) return { ok: false, code: "doublon" };
    seen.add(id);
  }
  return { ok: true, data: parsed.data };
}
