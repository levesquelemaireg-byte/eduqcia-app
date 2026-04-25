-- Migration : activer OI2 « Situer dans l'espace » et insérer les 3 comportements 2.1 / 2.2 / 2.3.
-- Liée à la livraison du parcours wizard `carte-historique` (Lot 3).
--
-- Effets :
--   1. UI banque : OI2 redevient un filtre disponible (`bank-filter-ref-data.ts` lit `status = 'active'`).
--   2. Référentiel comportements : 2.1, 2.2, 2.3 deviennent des FK valides pour `tache.comportement_id`.
--
-- Idempotente — utilise ON CONFLICT DO UPDATE pour les comportements et UPDATE simple pour `oi`.

UPDATE oi
SET status = 'active'
WHERE id = 'OI2';

INSERT INTO comportements (id, oi_id, enonce, nb_documents, outil_evaluation, status, ordre)
VALUES
  ('2.1', 'OI2', 'Identifier sur une carte un élément géographique ou un territoire',
    1, 'OI2_SO1', 'active', 0),
  ('2.2', 'OI2', 'Identifier sur une carte une association d''éléments géographiques',
    1, 'OI2_SO2', 'active', 1),
  ('2.3', 'OI2', 'Identifier sur une carte plusieurs éléments géographiques',
    1, 'OI2_SO3', 'active', 2)
ON CONFLICT (id) DO UPDATE
SET oi_id = EXCLUDED.oi_id,
    enonce = EXCLUDED.enonce,
    nb_documents = EXCLUDED.nb_documents,
    outil_evaluation = EXCLUDED.outil_evaluation,
    status = EXCLUDED.status,
    ordre = EXCLUDED.ordre;
