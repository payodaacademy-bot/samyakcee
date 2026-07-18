-- ============================================================
-- Admin Uploads Module: subjects, chapters, notes, videos,
-- study_materials, live_classes + storage buckets
-- ============================================================

-- 1. CORE TABLES

-- user_profiles (foundation table)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  college TEXT,
  cee_year INT,
  subscription_plan TEXT DEFAULT 'free',
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  battle_rating INT DEFAULT 1000,
  total_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'BookOpen',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- chapters
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- notes (PDFs + text notes)
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  pdf_url TEXT,
  pdf_path TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- video_lectures
CREATE TABLE IF NOT EXISTS public.video_lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_path TEXT,
  thumbnail_url TEXT,
  duration_sec INT DEFAULT 0,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- study_materials
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL DEFAULT '',
  file_path TEXT NOT NULL DEFAULT '',
  file_type TEXT DEFAULT '',
  file_size BIGINT DEFAULT 0,
  material_type TEXT DEFAULT 'general',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- live_classes
CREATE TABLE IF NOT EXISTS public.live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration_min INT DEFAULT 60,
  meeting_url TEXT,
  recording_url TEXT,
  recording_path TEXT,
  resources_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'scheduled',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_subjects_slug ON public.subjects(slug);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON public.notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_chapter_id ON public.notes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_video_lectures_subject_id ON public.video_lectures(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_subject_id ON public.study_materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_scheduled_at ON public.live_classes(scheduled_at);

-- 3. FUNCTIONS

-- Admin check (avoids recursion by checking is_admin column directly)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid() LIMIT 1),
    false
  )
$$;

-- Handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 4. ENABLE RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_read_all_profiles" ON public.user_profiles;
CREATE POLICY "users_read_all_profiles"
ON public.user_profiles FOR SELECT TO authenticated
USING (true);

-- subjects: public read, admin write
DROP POLICY IF EXISTS "public_read_subjects" ON public.subjects;
CREATE POLICY "public_read_subjects"
ON public.subjects FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "admin_manage_subjects" ON public.subjects;
CREATE POLICY "admin_manage_subjects"
ON public.subjects FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- chapters: public read, admin write
DROP POLICY IF EXISTS "public_read_chapters" ON public.chapters;
CREATE POLICY "public_read_chapters"
ON public.chapters FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "admin_manage_chapters" ON public.chapters;
CREATE POLICY "admin_manage_chapters"
ON public.chapters FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- notes: active ones public read, admin full access
DROP POLICY IF EXISTS "public_read_active_notes" ON public.notes;
CREATE POLICY "public_read_active_notes"
ON public.notes FOR SELECT TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_notes" ON public.notes;
CREATE POLICY "admin_manage_notes"
ON public.notes FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- video_lectures
DROP POLICY IF EXISTS "public_read_active_videos" ON public.video_lectures;
CREATE POLICY "public_read_active_videos"
ON public.video_lectures FOR SELECT TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_videos" ON public.video_lectures;
CREATE POLICY "admin_manage_videos"
ON public.video_lectures FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- study_materials
DROP POLICY IF EXISTS "public_read_active_materials" ON public.study_materials;
CREATE POLICY "public_read_active_materials"
ON public.study_materials FOR SELECT TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_materials" ON public.study_materials;
CREATE POLICY "admin_manage_materials"
ON public.study_materials FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- live_classes
DROP POLICY IF EXISTS "public_read_live_classes" ON public.live_classes;
CREATE POLICY "public_read_live_classes"
ON public.live_classes FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "admin_manage_live_classes" ON public.live_classes;
CREATE POLICY "admin_manage_live_classes"
ON public.live_classes FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- 6. TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_notes_updated_at ON public.notes;
CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_videos_updated_at ON public.video_lectures;
CREATE TRIGGER set_videos_updated_at
  BEFORE UPDATE ON public.video_lectures
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_materials_updated_at ON public.study_materials;
CREATE TRIGGER set_materials_updated_at
  BEFORE UPDATE ON public.study_materials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_live_classes_updated_at ON public.live_classes;
CREATE TRIGGER set_live_classes_updated_at
  BEFORE UPDATE ON public.live_classes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('notes-pdfs', 'notes-pdfs', true, 52428800,
   ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('lecture-videos', 'lecture-videos', true, 524288000,
   ARRAY['video/mp4','video/webm','video/quicktime','video/x-msvideo']),
  ('diagrams-images', 'diagrams-images', true, 10485760,
   ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('study-materials', 'study-materials', true, 104857600,
   ARRAY['application/pdf','application/zip','application/x-zip-compressed','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('live-resources', 'live-resources', true, 52428800,
   ARRAY['application/pdf','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for each bucket
DO $$
DECLARE
  bucket_names TEXT[] := ARRAY['notes-pdfs','lecture-videos','diagrams-images','study-materials','live-resources'];
  b TEXT;
BEGIN
  FOREACH b IN ARRAY bucket_names LOOP
    EXECUTE format('DROP POLICY IF EXISTS "public_read_%s" ON storage.objects', replace(b, '-', '_'));
    EXECUTE format('CREATE POLICY "public_read_%s" ON storage.objects FOR SELECT TO public USING (bucket_id = %L)', replace(b, '-', '_'), b);

    EXECUTE format('DROP POLICY IF EXISTS "admin_upload_%s" ON storage.objects', replace(b, '-', '_'));
    EXECUTE format('CREATE POLICY "admin_upload_%s" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %L AND public.is_admin_user())', replace(b, '-', '_'), b);

    EXECUTE format('DROP POLICY IF EXISTS "admin_delete_%s" ON storage.objects', replace(b, '-', '_'));
    EXECUTE format('CREATE POLICY "admin_delete_%s" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = %L AND public.is_admin_user())', replace(b, '-', '_'), b);
  END LOOP;
END $$;

-- 8. SEED DATA
DO $$
DECLARE
  bio_id UUID := gen_random_uuid();
  chem_id UUID := gen_random_uuid();
  phys_id UUID := gen_random_uuid();
  ma_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO public.subjects (id, name, display_name, slug, color, sort_order)
  VALUES
    (bio_id,  'biology',        'Biology',        'biology',        '#22c55e', 1),
    (chem_id, 'chemistry',      'Chemistry',      'chemistry',      '#f59e0b', 2),
    (phys_id, 'physics',        'Physics',        'physics',        '#3b82f6', 3),
    (ma_id,   'mental_agility', 'Mental Agility', 'mental-agility', '#8b5cf6', 4)
  ON CONFLICT (slug) DO NOTHING;

  -- Sample chapters for Biology
  INSERT INTO public.chapters (subject_id, title, sort_order)
  SELECT bio_id, ch, idx FROM (
    VALUES
      ('Cell Biology', 1),
      ('Genetics & Heredity', 2),
      ('Human Physiology', 3),
      ('Ecology', 4),
      ('Evolution', 5)
  ) AS t(ch, idx)
  WHERE EXISTS (SELECT 1 FROM public.subjects WHERE id = bio_id)
  ON CONFLICT DO NOTHING;

  -- Sample chapters for Chemistry
  INSERT INTO public.chapters (subject_id, title, sort_order)
  SELECT chem_id, ch, idx FROM (
    VALUES
      ('Atomic Structure', 1),
      ('Chemical Bonding', 2),
      ('Organic Chemistry', 3),
      ('Electrochemistry', 4)
  ) AS t(ch, idx)
  WHERE EXISTS (SELECT 1 FROM public.subjects WHERE id = chem_id)
  ON CONFLICT DO NOTHING;

  -- Sample chapters for Physics
  INSERT INTO public.chapters (subject_id, title, sort_order)
  SELECT phys_id, ch, idx FROM (
    VALUES
      ('Mechanics', 1),
      ('Thermodynamics', 2),
      ('Optics', 3),
      ('Electromagnetism', 4)
  ) AS t(ch, idx)
  WHERE EXISTS (SELECT 1 FROM public.subjects WHERE id = phys_id)
  ON CONFLICT DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;
