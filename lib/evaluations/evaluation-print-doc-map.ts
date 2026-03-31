import type { TaeFicheData } from "@/lib/types/fiche";

/**
 * Numéro global d’un document (1-based) dans l’épreuve, selon l’ordre des TAÉ puis doc_A–D.
 */
export function globalDocumentNumberForLetter(
  fiches: TaeFicheData[],
  taeIndex: number,
  letter: string,
): number {
  const L = letter.toUpperCase();
  if (L !== "A" && L !== "B" && L !== "C" && L !== "D") return 0;
  let n = 0;
  for (let i = 0; i < fiches.length; i++) {
    for (const d of fiches[i].documents) {
      n++;
      if (i === taeIndex && d.letter === L) return n;
    }
  }
  return 0;
}

/**
 * Liste plate des documents avec numéro global (pour section dossier documentaire).
 */
export function flattenDocumentsWithGlobalNumbers(
  fiches: TaeFicheData[],
): { globalN: number; doc: TaeFicheData["documents"][number] }[] {
  const out: { globalN: number; doc: TaeFicheData["documents"][number] }[] = [];
  let n = 0;
  for (const f of fiches) {
    for (const d of f.documents) {
      n++;
      out.push({ globalN: n, doc: d });
    }
  }
  return out;
}

/**
 * Réécrit la consigne / guidage pour l’impression épreuve : `{{doc_*}}` et `data-doc-ref` → numéro global.
 */
export function rewriteTaeHtmlDocRefsForEvaluationPrint(
  html: string,
  taeIndex: number,
  fiches: TaeFicheData[],
): string {
  if (!html) return "";
  let s = html.replace(/\{\{doc_([A-D])\}\}/gi, (_, letter: string) => {
    const g = globalDocumentNumberForLetter(fiches, taeIndex, letter);
    return g > 0 ? String(g) : letter;
  });
  s = s.replace(
    /<span[^>]*\bdata-doc-ref=["']([A-D])["'][^>]*>[\s\S]*?<\/span>/gi,
    (_full, letter: string) => {
      const g = globalDocumentNumberForLetter(fiches, taeIndex, letter);
      return g > 0 ? String(g) : letter;
    },
  );
  return s;
}
