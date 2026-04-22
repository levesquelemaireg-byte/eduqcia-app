/** Structure de `public/data/oi.json` — docs/WORKFLOWS.md §3 */

export type OiStatus = "active" | "coming_soon";

export type ComportementAttenduJson = {
  id: string;
  enonce: string;
  nb_documents: number | null;
  /** Espace de production rédactionnel (0 = non rédactionnel) — `public/data/oi.json`. */
  nb_lignes?: number;
  outil_evaluation: string;
  status?: OiStatus;
  /** Slug dossier `components/tache/non-redaction/<slug>/` — voir `docs/wizard-oi-non-redactionnelle.md`. */
  variant_slug?: string;
  /** Discriminant stable pour typage / Zod du brouillon non rédactionnel (optionnel). */
  response_format?: string;
};

export type OiEntryJson = {
  id: string;
  titre: string;
  icone: string;
  status: OiStatus;
  comportements_attendus: ComportementAttenduJson[];
};
