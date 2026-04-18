-- ─── RLS Policies — Balance ton gardien ─────────────────────────────
-- À coller dans Supabase SQL Editor

-- 1. USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des pseudos"
  ON users FOR SELECT USING (true);

CREATE POLICY "Modification uniquement par soi-même"
  ON users FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Insertion via signup uniquement"
  ON users FOR INSERT WITH CHECK (auth.uid()::text = id);

-- 2. BUILDINGS
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des immeubles"
  ON buildings FOR SELECT USING (true);

CREATE POLICY "Insertion authentifiée"
  ON buildings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Mise à jour authentifiée"
  ON buildings FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 3. REPORTS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des signalements publics"
  ON reports FOR SELECT USING (
    visibility = 'PUBLIC'
    OR (visibility = 'VOISINS' AND auth.uid()::text = user_id)
    OR (visibility = 'PRIVE' AND auth.uid()::text = user_id)
  );

CREATE POLICY "Création par utilisateur authentifié"
  ON reports FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Modification par l'auteur uniquement"
  ON reports FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Suppression par l'auteur uniquement"
  ON reports FOR DELETE USING (auth.uid()::text = "userId");

-- 4. MEDIA
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des médias"
  ON media FOR SELECT USING (true);

CREATE POLICY "Insertion authentifiée"
  ON media FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 5. VALIDATIONS
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des validations"
  ON validations FOR SELECT USING (true);

CREATE POLICY "Création par utilisateur authentifié"
  ON validations FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Modification par l'auteur"
  ON validations FOR UPDATE USING (auth.uid()::text = "userId");

-- 6. ACTIONS
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture par l'auteur uniquement"
  ON actions FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Création par utilisateur authentifié"
  ON actions FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Modification par l'auteur"
  ON actions FOR UPDATE USING (auth.uid()::text = "userId");

-- 7. BUILDING_USERS
ALTER TABLE building_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique"
  ON building_users FOR SELECT USING (true);

CREATE POLICY "Insertion par soi-même"
  ON building_users FOR INSERT WITH CHECK (auth.uid()::text = "userId");
