/**
 * Renumérotation globale des documents dans une épreuve — print-engine v2.1 §D3.
 *
 * Renumérotation globale pour consommer `DonneesTache[]`.
 */

import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { RendererDocument } from "@/lib/types/document-renderer";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type DocumentNumerote = {
  /** Numéro global 1-based dans l'épreuve. */
  numeroGlobal: number;
  /** Référence au document source. */
  document: RendererDocument;
};

/* -------------------------------------------------------------------------- */
/*  Liste plate                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Produit la liste plate ordonnée de tous les documents de l'épreuve,
 * avec un numéro global 1-based.
 *
 * L'ordre suit celui des tâches puis celui des documents dans chaque tâche.
 */
export function aplatirDocumentsAvecNumeros(
  taches: Pick<DonneesTache, "documents">[],
): DocumentNumerote[] {
  const resultat: DocumentNumerote[] = [];
  let compteur = 0;
  for (const tache of taches) {
    for (const doc of tache.documents) {
      compteur++;
      resultat.push({ numeroGlobal: compteur, document: doc });
    }
  }
  return resultat;
}

/* -------------------------------------------------------------------------- */
/*  Numéro global pour un document donné                                      */
/* -------------------------------------------------------------------------- */

/**
 * Retourne le numéro global (1-based) d'un document identifié par son id
 * dans la liste plate des documents. Retourne 0 si non trouvé.
 */
export function numeroGlobalParId(
  taches: Pick<DonneesTache, "documents">[],
  documentId: string,
): number {
  let compteur = 0;
  for (const tache of taches) {
    for (const doc of tache.documents) {
      compteur++;
      if (doc.id === documentId) return compteur;
    }
  }
  return 0;
}

/* -------------------------------------------------------------------------- */
/*  Résolution des placeholders {{doc_N}} (nouveau) et {{doc_A}} (legacy)     */
/* -------------------------------------------------------------------------- */

/**
 * Réécrit les placeholders document et les `data-doc-ref` dans une chaîne HTML
 * en les remplaçant par le numéro global du document dans l'épreuve.
 *
 * Deux formats acceptés :
 *  - `{{doc_1}}` … `{{doc_N}}` (nouveau, 1-based) — correspondance directe à la position du document.
 *  - `{{doc_A}}` … `{{doc_Z}}` et `data-doc-ref="A"` (legacy) — correspondance lettre → position (A=0, B=1, …).
 */
export function resoudreReferencesDocuments(
  html: string,
  tacheDocuments: RendererDocument[],
  taches: Pick<DonneesTache, "documents">[],
): string {
  if (!html) return "";

  // Format numérique (nouveau) : {{doc_1}}, {{doc_2}}, …
  let resultat = html.replace(/\{\{doc_(\d+)\}\}/g, (_, num: string) => {
    const idx = parseInt(num, 10) - 1;
    if (!Number.isFinite(idx) || idx < 0) return num;
    const doc = tacheDocuments[idx];
    if (!doc) return num;
    const n = numeroGlobalParId(taches, doc.id);
    return n > 0 ? String(n) : num;
  });

  // Format alphabétique (legacy, rétrocompat) : {{doc_A}}, {{doc_b}}, …
  resultat = resultat.replace(/\{\{doc_([A-Za-z])\}\}/g, (_, lettre: string) => {
    const idx = lettre.toUpperCase().charCodeAt(0) - 65;
    if (idx < 0) return lettre;
    const doc = tacheDocuments[idx];
    if (!doc) return lettre;
    const n = numeroGlobalParId(taches, doc.id);
    return n > 0 ? String(n) : lettre;
  });

  // Spans data-doc-ref="A" (lettre conservée pour l'affichage dans l'éditeur)
  resultat = resultat.replace(
    /<span[^>]*\bdata-doc-ref=["']([A-Za-z])["'][^>]*>[\s\S]*?<\/span>/gi,
    (_full, lettre: string) => {
      const idx = lettre.toUpperCase().charCodeAt(0) - 65;
      if (idx < 0) return lettre;
      const doc = tacheDocuments[idx];
      if (!doc) return lettre;
      const n = numeroGlobalParId(taches, doc.id);
      return n > 0 ? String(n) : lettre;
    },
  );

  return resultat;
}
