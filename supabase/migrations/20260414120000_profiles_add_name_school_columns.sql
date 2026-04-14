-- Ajout des colonnes normalisées sur profiles
-- Les anciennes colonnes (full_name, school) restent présentes pour la migration de données

ALTER TABLE profiles
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name  TEXT,
  ADD COLUMN school_id  UUID REFERENCES schools(id) ON DELETE SET NULL;

-- Index pour les recherches
CREATE INDEX idx_profiles_school_id  ON profiles (school_id);
CREATE INDEX idx_profiles_last_name  ON profiles (last_name);

-- Commentaires
COMMENT ON COLUMN profiles.first_name IS 'Prénom — remplace full_name (migration en cours)';
COMMENT ON COLUMN profiles.last_name  IS 'Nom de famille — remplace full_name (migration en cours)';
COMMENT ON COLUMN profiles.school_id  IS 'FK école secondaire — remplace school TEXT (migration en cours)';
