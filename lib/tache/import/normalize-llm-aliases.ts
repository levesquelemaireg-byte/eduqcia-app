/**
 * Normalisation déterministe des alias fréquents générés par des LLM (anglais, casse)
 * avant validation métier / RPC — voir `docs/ARCHITECTURE.md` (`lib/tache/import/`).
 */

export type ImportedDocumentType = "textuel" | "iconographique";

/** Alias connus → valeur canonique française (enum documents.type côté app). */
const DOCUMENT_TYPE_ALIASES: Readonly<Record<string, ImportedDocumentType>> = {
  textuel: "textuel",
  textual: "textuel",
  iconographique: "iconographique",
  iconographic: "iconographique",
  iconographical: "iconographique",
};

export type NormalizeImportedDocumentTypeResult =
  | { ok: true; value: ImportedDocumentType; wasAliased: boolean }
  | { ok: false; raw: string };

/**
 * Mappe une chaîne reçue (ex. depuis JSON NotebookLM) vers `textuel` | `iconographique`.
 * Comparaison insensible à la casse pour les alias listés uniquement.
 */
export function normalizeImportedDocumentType(raw: string): NormalizeImportedDocumentTypeResult {
  const key = raw.trim().toLowerCase();
  const mapped = DOCUMENT_TYPE_ALIASES[key];
  if (mapped === undefined) {
    return { ok: false, raw };
  }
  const wasAliased = key !== "textuel" && key !== "iconographique";
  return { ok: true, value: mapped, wasAliased };
}

export type DocumentTypeCorrection = {
  index: number;
  from: string;
  to: ImportedDocumentType;
};

export type NormalizeDocumentsNewTypesError = {
  index: number;
  message: string;
};

export type NormalizeDocumentsNewTypesResult =
  | {
      ok: true;
      documents: Array<Record<string, unknown> & { type: ImportedDocumentType }>;
      corrections: DocumentTypeCorrection[];
    }
  | { ok: false; errors: NormalizeDocumentsNewTypesError[] };

/**
 * Copie superficielle de chaque document avec `type` normalisé.
 * Les entrées sans `type` string ou avec valeur inconnue produisent une erreur indexée.
 */
export function normalizeDocumentsNewTypesFromLlm(
  documents: ReadonlyArray<Record<string, unknown>>,
): NormalizeDocumentsNewTypesResult {
  const corrections: DocumentTypeCorrection[] = [];
  const errors: NormalizeDocumentsNewTypesError[] = [];
  const out: Array<Record<string, unknown> & { type: ImportedDocumentType }> = [];

  documents.forEach((doc, index) => {
    const rawType = doc.type;
    if (typeof rawType !== "string") {
      errors.push({ index, message: "documents_new[].type doit être une chaîne." });
      return;
    }
    const n = normalizeImportedDocumentType(rawType);
    if (!n.ok) {
      errors.push({
        index,
        message: `Type de document inconnu : « ${n.raw} ». Utiliser textuel ou iconographique (ou alias textual / iconographic).`,
      });
      return;
    }
    if (n.wasAliased) {
      corrections.push({ index, from: rawType.trim(), to: n.value });
    }
    out.push({ ...doc, type: n.value });
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, documents: out, corrections };
}
