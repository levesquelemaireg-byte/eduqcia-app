import { z } from "zod";

import type { DocumentTypeIconoSlug } from "@/lib/ui/ui-copy";
import { DOCUMENT_TYPE_ICONO_SLUGS } from "@/lib/ui/ui-copy";

const slugTuple = [...DOCUMENT_TYPE_ICONO_SLUGS] as [string, ...string[]];

export const typeIconographiqueSchema = z.enum(slugTuple);

export type TypeIconographiqueValue = DocumentTypeIconoSlug;

export function parseTypeIconographique(raw: unknown): DocumentTypeIconoSlug | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (s.length === 0) return null;
  const r = typeIconographiqueSchema.safeParse(s);
  return r.success ? (r.data as DocumentTypeIconoSlug) : null;
}
