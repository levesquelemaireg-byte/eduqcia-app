-- Migration : activer les comportements 4.3 et 4.4 de l'OI4 (parcours causes-consequences).
-- Liée à la livraison du parcours wizard `causes-consequences` (Lot 3).
--
-- Effets :
--   1. UI banque : 4.3 et 4.4 deviennent des filtres disponibles (`bank-filter-ref-data.ts`
--      lit `status = 'active'`).
--   2. Référentiel comportements : 4.3 et 4.4 deviennent des FK valides actives pour
--      `tache.comportement_id`.
--
-- Note : OI4 elle-même est déjà `active` (4.1 et 4.2 rédactionnels actifs depuis longtemps).
-- Les lignes 4.3 et 4.4 existent déjà dans `comportements` (insérées au seed initial avec
-- `status = 'coming_soon'`) — pas d'INSERT, simple UPDATE.
--
-- Idempotente — l'UPDATE ne change rien si déjà appliqué.

UPDATE comportements
SET status = 'active'
WHERE id IN ('4.3', '4.4');
