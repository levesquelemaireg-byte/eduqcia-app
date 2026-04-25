/**
 * Copy UI — publication, toasts erreurs.
 * Source de vérité : `docs/UI-COPY.md`.
 */

/** Page « Créer une TAÉ » — Toasts — erreur publication */
export const TOAST_PUBLICATION_FAILED = "Impossible de publier la tâche. Réessayez.";

/** Publication — données rejetées après envoi (sanitize / prérequis serveur) */
export const TOAST_PUBLICATION_VALIDATION =
  "La publication a été refusée : données incomplètes ou non reconnues. Vérifiez chaque étape puis réessayez.";

/** Publication — document iconographique sans URL HTTPS publique (`blob:` ou fichier local) */
export const TOAST_PUBLICATION_DOCUMENT_IMAGE =
  "Pour publier, chaque document iconographique doit avoir une adresse HTTPS (téléversement terminé ou URL saisie).";

/** Publication — niveau / discipline introuvable en base */
export const TOAST_PUBLICATION_LOOKUP_NIVEAU =
  "Niveau scolaire introuvable dans la base. Vérifiez la table « niveaux » (codes sec1…sec4) sur Supabase.";

export const TOAST_PUBLICATION_LOOKUP_DISCIPLINE =
  "Discipline introuvable dans la base. Vérifiez la table « disciplines » (codes HEC, GEO, HQC).";

/**
 * Tables `cd` / `connaissances` souvent vides si le schéma SQL seul a été appliqué.
 * Les images Storage peuvent exister sans que la transaction « publier » réussisse.
 */
export const TOAST_PUBLICATION_LOOKUP_CD =
  "Compétence disciplinaire introuvable en base. Importez les référentiels : npm run seed:ref (base vide) ou npm run seed:ref:fill (tâches déjà en base), avec la service role dans .env.local.";

export const TOAST_PUBLICATION_LOOKUP_CONNAISSANCE =
  "Connaissances relatives introuvables en base. Importez les référentiels : npm run seed:ref ou npm run seed:ref:fill (voir .env.local).";

/** RPC — violation de clé étrangère ou référence absente */
export const TOAST_PUBLICATION_RPC_FOREIGN_KEY =
  "La base a refusé la publication (référence manquante). Vérifiez opérations intellectuelles, comportements, liaisons documents et jeux de données.";

/** RPC — enum / type invalide (ex. aspects de société) */
export const TOAST_PUBLICATION_RPC_ENUM =
  "La base a refusé une valeur (souvent un aspect de société). Réessayez ou vérifiez les enums PostgreSQL.";

/** RPC `update_tache_transaction` absente sur Supabase — voir `docs/ARCHITECTURE.md` § RPC mise à jour TAÉ */
export const TOAST_PUBLICATION_RPC_FUNCTION_MISSING =
  "Mise à jour impossible : la fonction SQL update_tache_transaction est absente sur Supabase. Exécutez la migration supabase/migrations/20250325180000_update_tae_transaction.sql (SQL Editor ou supabase db push), puis réessayez.";

/** Bouton Publier — infobulle quand les docs sont « complets » mais bloqués (image locale) */
export const PUBLISH_BUTTON_TITLE_DOCUMENT_IMAGE = TOAST_PUBLICATION_DOCUMENT_IMAGE;
