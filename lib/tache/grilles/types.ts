/**
 * Types métier pour les grilles d'évaluation ministérielles.
 *
 * Source de vérité : `public/data/grilles-evaluation.json` (référentiel immuable, 22 outils).
 * Consommé par : registre des grilles (`components/tache/grilles/grille-registry.tsx`),
 * contrat impression (`lib/tache/contrats/donnees.ts`), fiche détaillée, calculs de score.
 */

export type GrilleEntry = {
  id: string;
  operation: string;
  comportement_enonce: string;
  outil_image?: string;
  bareme: {
    max_points: number;
    /** Légende sous le tableau (ex. astérisque OI6_SO3). */
    note?: string;
    echelle: { points: number; label: string; description: string }[];
  };
};
