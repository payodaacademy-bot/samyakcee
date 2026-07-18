-- ============================================================
-- Questions and Exams tables + activation_codes table
-- ============================================================

-- questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- exams table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  description TEXT,
  duration_minutes INT DEFAULT 60,
  total_marks INT DEFAULT 100,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- activation_codes table
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'student',
  duration_days INT NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  used_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON public.questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_published ON public.questions(is_published);
CREATE INDEX IF NOT EXISTS idx_exams_subject_id ON public.exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_exams_is_published ON public.exams(is_published);
CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON public.activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_activation_codes_used_by ON public.activation_codes(used_by);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: questions
DROP POLICY IF EXISTS "public_read_published_questions" ON public.questions;
CREATE POLICY "public_read_published_questions"
ON public.questions FOR SELECT TO public
USING (is_published = true);

DROP POLICY IF EXISTS "admin_manage_questions" ON public.questions;
CREATE POLICY "admin_manage_questions"
ON public.questions FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- RLS Policies: exams
DROP POLICY IF EXISTS "public_read_published_exams" ON public.exams;
CREATE POLICY "public_read_published_exams"
ON public.exams FOR SELECT TO public
USING (is_published = true);

DROP POLICY IF EXISTS "admin_manage_exams" ON public.exams;
CREATE POLICY "admin_manage_exams"
ON public.exams FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- RLS Policies: activation_codes
DROP POLICY IF EXISTS "admin_manage_activation_codes" ON public.activation_codes;
CREATE POLICY "admin_manage_activation_codes"
ON public.activation_codes FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
