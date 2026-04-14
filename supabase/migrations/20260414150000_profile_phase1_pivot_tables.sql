-- ============================================================
-- Phase 1 Profil UX : tables pivot, years_experience, indexes, RLS
-- ============================================================

-- 1. Colonne years_experience sur profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS years_experience SMALLINT NULL;

-- 2. Tables pivot profil ↔ disciplines / niveaux
CREATE TABLE IF NOT EXISTS profile_disciplines (
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  discipline_code TEXT NOT NULL REFERENCES disciplines(code) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, discipline_code)
);

CREATE TABLE IF NOT EXISTS profile_niveaux (
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  niveau_code TEXT NOT NULL REFERENCES niveaux(code) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, niveau_code)
);

-- 3. Indexes pour les queries de contributions (profil + collaborateurs)
CREATE INDEX IF NOT EXISTS idx_tae_auteur_published
  ON tae (auteur_id, is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_auteur_published
  ON documents (auteur_id, is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evaluations_auteur_published
  ON evaluations (auteur_id, is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_disciplines_profile
  ON profile_disciplines (profile_id);

CREATE INDEX IF NOT EXISTS idx_profile_niveaux_profile
  ON profile_niveaux (profile_id);

-- 4. RLS sur les tables pivot
ALTER TABLE profile_disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_niveaux     ENABLE ROW LEVEL SECURITY;

-- Lecture : tout utilisateur actif peut lire toutes les disciplines/niveaux de profil
CREATE POLICY "profile_disciplines_select_all"
  ON profile_disciplines FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profile_niveaux_select_all"
  ON profile_niveaux FOR SELECT TO authenticated
  USING (true);

-- Écriture : uniquement son propre profil
CREATE POLICY "profile_disciplines_modify_own"
  ON profile_disciplines FOR ALL TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "profile_niveaux_modify_own"
  ON profile_niveaux FOR ALL TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- 5. RPC de suppression de compte (Loi 25) — anonymisation atomique
CREATE OR REPLACE FUNCTION delete_account_anonymize(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Vérifier que c'est bien le user authentifié
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Supprimer les brouillons non publiés
  DELETE FROM tae WHERE auteur_id = p_user_id AND is_published = false;
  DELETE FROM documents WHERE auteur_id = p_user_id AND is_published = false;
  DELETE FROM evaluations WHERE auteur_id = p_user_id AND is_published = false;

  -- Vider les tables pivot profil
  DELETE FROM profile_disciplines WHERE profile_id = p_user_id;
  DELETE FROM profile_niveaux WHERE profile_id = p_user_id;

  -- Anonymiser le profil
  UPDATE profiles SET
    first_name = '[Compte',
    last_name = 'supprimé]',
    email = 'deleted-' || p_user_id || '@anonymized.local',
    school_id = NULL,
    years_experience = NULL,
    status = 'suspended',
    activation_token = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;
