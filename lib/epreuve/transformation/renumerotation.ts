/**
 * Renumérotation globale des documents dans une épreuve — print-engine v2.1 §D3.
 *
 * Adapte la logique de `flattenDocumentsWithGlobalNumbers` (evaluation-print-doc-map.ts)
 * pour consommer `DonneesTache[]` au lieu de `TaeFicheData[]`.
 */

import type { DonneesTache, DocumentReference } from "@/lib/tache/contrats/donnees";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type DocumentNumerote = {
  /** Numéro global 1-based dans l'épreuve. */
  numeroGlobal: number;
  /** Référence au document source. */
  document: DocumentReference;
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
/*  Résolution des placeholders {{doc_A}}, {{doc_B}}, etc.                    */
/* -------------------------------------------------------------------------- */

/**
 * Réécrit les placeholders `{{doc_A}}` à `{{doc_D}}` et les `data-doc-ref`
 * dans une chaîne HTML en les remplaçant par le numéro global du document.
 *
 * La correspondance lettre → document se fait par position dans le tableau
 * `documents` de la tâche : A=0, B=1, C=2, D=3.
 */
export function resoudreReferencesDocuments(
  html: string,
  tacheDocuments: DocumentReference[],
  taches: Pick<DonneesTache, "documents">[],
): string {
  if (!html) return "";

  const lettreVersIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

  // Résoudre {{doc_A}} .. {{doc_D}}
  let resultat = html.replace(/\{\{doc_([A-Da-d])\}\}/g, (_, lettre: string) => {
    const idx = lettreVersIndex[lettre.toUpperCase()];
    if (idx === undefined) return lettre;
    const doc = tacheDocuments[idx];
    if (!doc) return lettre;
    const n = numeroGlobalParId(taches, doc.id);
    return n > 0 ? String(n) : lettre;
  });

  // Résoudre <span data-doc-ref="A">...</span>
  resultat = resultat.replace(
    /<span[^>]*\bdata-doc-ref=["']([A-Da-d])["'][^>]*>[\s\S]*?<\/span>/gi,
    (_full, lettre: string) => {
      const idx = lettreVersIndex[lettre.toUpperCase()];
      if (idx === undefined) return lettre;
      const doc = tacheDocuments[idx];
      if (!doc) return lettre;
      const n = numeroGlobalParId(taches, doc.id);
      return n > 0 ? String(n) : lettre;
    },
  );

  return resultat;
}
