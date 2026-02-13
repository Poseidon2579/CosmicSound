-- 1. Fix RLS Policies for Genres Table to allow AI to write
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

-- Remove old policies to avoid conflicts
DROP POLICY IF EXISTS "full_access_genres" ON genres;
DROP POLICY IF EXISTS "Enable read access for all users" ON genres;
DROP POLICY IF EXISTS "Enable insert access for all users" ON genres;
DROP POLICY IF EXISTS "full_access_genres_fixed" ON genres;
DROP POLICY IF EXISTS "full_access_genres_fixed_v2" ON genres;
DROP POLICY IF EXISTS "full_access_genres_fixed_final" ON genres;

-- Create a fully permissive policy for the AI script (and everyone else for now)
CREATE POLICY "full_access_genres_fixed_ultra_final"
ON genres
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. Bulk Seed Genres (Standard English Names + Slugs)
-- CORRECTED: Handle conflict on 'slug' to avoid duplicate key errors
INSERT INTO genres (name, slug) VALUES
  ('Pop', 'pop'),
  ('Rock', 'rock'),
  ('Hip-Hop', 'hip-hop'),
  ('R&B', 'r-b'),
  ('Country', 'country'),
  ('Jazz', 'jazz'),
  ('Electronic', 'electronic'),
  ('Classical', 'classical'),
  ('Reggae', 'reggae'),
  ('Blues', 'blues'),
  ('Metal', 'metal'),
  ('Latin', 'latin'),
  ('Folk', 'folk'),
  ('Soul', 'soul'),
  ('Punk', 'punk'),
  ('Funk', 'funk'),
  ('Disco', 'disco'),
  ('Techno', 'techno'),
  ('House', 'house'),
  ('Indie', 'indie'),
  ('Alternative', 'alternative'),
  ('K-Pop', 'k-pop'),
  ('J-Pop', 'j-pop'),
  ('Reggaeton', 'reggaeton'),
  ('Urban', 'urban'),
  ('Trap', 'trap'),
  ('Grunge', 'grunge'),
  ('Salsa', 'salsa'),
  ('Bachata', 'bachata'),
  ('Merengue', 'merengue'),
  ('Cumbia', 'cumbia'),
  ('Vallenato', 'vallenato'),
  ('Banda', 'banda'),
  ('Ranchera', 'ranchera'),
  ('Mariachi', 'mariachi'),
  ('Corrido', 'corrido'),
  ('Bolero', 'bolero'),
  ('Tango', 'tango'),
  ('Flamenco', 'flamenco'),
  ('Bossa Nova', 'bossa-nova'),
  ('Samba', 'samba'),
  ('MPB', 'mpb'),
  ('Afrobeat', 'afrobeat'),
  ('Dancehall', 'dancehall'),
  ('Ska', 'ska'),
  ('Gospel', 'gospel'),
  ('Christian', 'christian'),
  ('Instrumental', 'instrumental'),
  ('Soundtrack', 'soundtrack'),
  ('World', 'world')
ON CONFLICT (slug) DO NOTHING;

-- 3. Also fix song_genres just in case
ALTER TABLE song_genres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "full_access_song_genres" ON song_genres;
DROP POLICY IF EXISTS "full_access_song_genres_fixed" ON song_genres;
DROP POLICY IF EXISTS "full_access_song_genres_fixed_v2" ON song_genres;
DROP POLICY IF EXISTS "full_access_song_genres_fixed_final" ON song_genres;

CREATE POLICY "full_access_song_genres_fixed_ultra_final"
ON song_genres
FOR ALL
USING (true)
WITH CHECK (true);
