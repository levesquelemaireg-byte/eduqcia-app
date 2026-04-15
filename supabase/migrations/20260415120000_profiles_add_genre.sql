-- Migration : ajouter la colonne genre à profiles
-- Le genre conditionne l'accord du label rôle (Enseignant/Enseignante, etc.)
-- Nullable — renseigné après coup via le Side Sheet profil.

ALTER TABLE profiles
  ADD COLUMN genre text CHECK (genre IN ('homme', 'femme'));

-- Seed genre pour les 4 alpha-testeurs existants
UPDATE profiles SET genre = 'femme' WHERE first_name = 'Anouck';
UPDATE profiles SET genre = 'femme' WHERE first_name = 'Geneviève';
UPDATE profiles SET genre = 'homme' WHERE first_name = 'Gabriel';
UPDATE profiles SET genre = 'homme' WHERE first_name = 'Frédéric';
