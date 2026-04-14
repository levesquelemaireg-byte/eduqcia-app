-- Migration des données existantes profiles.full_name → first_name + last_name
-- Convention existante : "Prénom Nom" (espace simple)
-- Gestion du cas "Nom, Prénom" (virgule) si présent

-- Cas standard "Prénom Nom" (dernier espace sépare le nom de famille)
UPDATE profiles
SET
  first_name = CASE
    WHEN full_name LIKE '%,%'
      THEN trim(split_part(full_name, ',', 2))
    WHEN full_name LIKE '% %'
      THEN trim(left(full_name, length(full_name) - length(split_part(full_name, ' ', -1)) - 1))
    ELSE full_name
  END,
  last_name = CASE
    WHEN full_name LIKE '%,%'
      THEN trim(split_part(full_name, ',', 1))
    WHEN full_name LIKE '% %'
      THEN trim(split_part(full_name, ' ', -1))
    ELSE ''
  END
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- Migration school TEXT (JSON) → school_id (FK)
-- Le JSON stocké est : {"css":"Nom du CSS","ecole":"Nom école","niveau":"Secondaire N"}
-- On matche par nom d'école + nom de CSS. Le champ "niveau" du JSON est IGNORÉ

UPDATE profiles p
SET school_id = s.id
FROM schools s
JOIN css c ON c.id = s.css_id
WHERE p.school IS NOT NULL
  AND p.school LIKE '{%'
  AND p.school_id IS NULL
  AND s.nom_officiel = trim(both '"' FROM (p.school::jsonb->>'ecole'))
  AND c.nom_officiel = trim(both '"' FROM (p.school::jsonb->>'css'));

-- Log des profils non migrés (pour vérification manuelle)
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM profiles
  WHERE school IS NOT NULL
    AND school LIKE '{%'
    AND school_id IS NULL;
  IF v_count > 0 THEN
    RAISE NOTICE '% profil(s) avec school JSON non migré(s) vers school_id — vérification manuelle requise', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM profiles
  WHERE first_name IS NULL AND full_name IS NOT NULL;
  IF v_count > 0 THEN
    RAISE NOTICE '% profil(s) avec full_name non migré(s) vers first_name/last_name', v_count;
  END IF;
END;
$$;
