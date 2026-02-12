-- ============================================
-- CosmicSound - Tablas en Español para Supabase
-- ============================================

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nombre_usuario TEXT NOT NULL,
  handle TEXT,
  email TEXT UNIQUE NOT NULL,
  contrasena TEXT NOT NULL,
  bio TEXT DEFAULT 'Explorador del vacío sonoro.',
  avatar TEXT,
  fecha_registro DATE DEFAULT CURRENT_DATE,
  visibilidad BOOLEAN DEFAULT true,
  historial BOOLEAN DEFAULT true,
  sincronizacion BOOLEAN DEFAULT true,
  preferencias JSONB DEFAULT '{}'::jsonb -- Vector-ready preferences
);

-- Configuración de Storage para Avatares
-- Nota: El bucket 'avatars' debe ser creado manualmente en el dashboard o por API
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatares públicos" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Usuarios suben sus avatares" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Usuarios borran sus avatares" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');

-- Tabla: canciones
CREATE TABLE IF NOT EXISTS canciones (
  id TEXT PRIMARY KEY,
  artista TEXT NOT NULL,
  titulo TEXT NOT NULL,
  album TEXT DEFAULT 'Desconocido',
  youtube_id TEXT,
  vistas BIGINT DEFAULT 0,
  me_gusta BIGINT DEFAULT 0,
  genero TEXT DEFAULT 'Musical'
);

-- Tabla: resenas (reseñas)
CREATE TABLE IF NOT EXISTS resenas (
  id SERIAL PRIMARY KEY,
  usuario TEXT NOT NULL,
  avatar TEXT,
  fecha TEXT,
  cancion_id TEXT REFERENCES canciones(id) ON DELETE CASCADE,
  comentario TEXT,
  calificacion REAL DEFAULT 0,
  verificado BOOLEAN DEFAULT false
);

-- Tabla: favoritos (likes)
CREATE TABLE IF NOT EXISTS favoritos (
  id SERIAL PRIMARY KEY,
  usuario_id TEXT NOT NULL,
  cancion_id TEXT NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, cancion_id)
);

-- Habilitar Row Level Security (RLS) - Política abierta para anon
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE canciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Lectura pública usuarios" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Insertar usuarios" ON usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar usuarios" ON usuarios FOR UPDATE USING (true);

CREATE POLICY "Lectura pública canciones" ON canciones FOR SELECT USING (true);
CREATE POLICY "Insertar canciones" ON canciones FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura pública resenas" ON resenas FOR SELECT USING (true);
CREATE POLICY "Insertar resenas" ON resenas FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura pública favoritos" ON favoritos FOR SELECT USING (true);
CREATE POLICY "Insertar favoritos" ON favoritos FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminar favoritos" ON favoritos FOR DELETE USING (true);
-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre_usuario, email, contrasena, avatar)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Anonymous'),
    new.email,
    'oauth_account', -- Contraseña de relleno para evitar el error
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function after a user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
