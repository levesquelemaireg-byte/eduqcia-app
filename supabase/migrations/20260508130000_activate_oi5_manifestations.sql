-- Migration : activer OI5 « Mettre en relation des faits » et insérer les 2 comportements 5.1 / 5.2.
-- Liée à la livraison du parcours wizard `manifestations` (Lot 3).
--
-- Effets :
--   1. UI banque : OI5 redevient un filtre disponible (`bank-filter-ref-data.ts` lit `status = 'active'`).
--   2. Référentiel comportements : 5.1, 5.2 deviennent des FK valides pour `tache.comportement_id`.
--
-- Idempotente — utilise ON CONFLICT DO UPDATE pour les comportements et UPDATE simple pour `oi`.

UPDATE oi
SET status = 'active'
WHERE id = 'OI5';

INSERT INTO comportements (id, oi_id, enonce, nb_documents, outil_evaluation, status, ordre)
VALUES
  ('5.1', 'OI5', 'Associer des faits à des manifestations ou à des descriptions qui leur sont apparentées (deux faits).',
    2, 'OI5_SO1', 'active', 0),
  ('5.2', 'OI5', 'Associer des faits à des manifestations ou à des descriptions qui leur sont apparentées (quatre faits).',
    4, 'OI5_SO2', 'active', 1)
ON CONFLICT (id) DO UPDATE
SET oi_id = EXCLUDED.oi_id,
    enonce = EXCLUDED.enonce,
    nb_documents = EXCLUDED.nb_documents,
    outil_evaluation = EXCLUDED.outil_evaluation,
    status = EXCLUDED.status,
    ordre = EXCLUDED.ordre;
