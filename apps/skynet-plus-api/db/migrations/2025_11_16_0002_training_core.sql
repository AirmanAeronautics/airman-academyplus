-- ===========================
-- Training Programs
-- ===========================
CREATE TABLE IF NOT EXISTS training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  code TEXT NOT NULL,  -- e.g. "DGCA-PPL-2025"
  name TEXT NOT NULL,  -- e.g. "DGCA PPL Integrated"
  regulatory_framework_code TEXT NOT NULL,  -- e.g. "DGCA", "EASA"
  category TEXT NOT NULL CHECK (category IN ('GROUND', 'FLIGHT', 'INTEGRATED')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_training_programs_tenant_code
  ON training_programs (tenant_id, code);

CREATE INDEX IF NOT EXISTS idx_training_programs_tenant_regulatory
  ON training_programs (tenant_id, regulatory_framework_code);

-- ===========================
-- Training Lessons
-- ===========================
CREATE TABLE IF NOT EXISTS training_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  code TEXT NOT NULL,     -- e.g. "PPL-01"
  name TEXT NOT NULL,     -- e.g. "Principles of Flight"
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('GROUND', 'FLIGHT')),
  sequence_order INT NOT NULL,  -- ordering within program
  duration_minutes INT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- for weather minima, aircraft requirements, pre-req lessons, etc.
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_training_lessons_tenant_program_code
  ON training_lessons (tenant_id, program_id, code);

CREATE INDEX IF NOT EXISTS idx_training_lessons_tenant_program_sequence
  ON training_lessons (tenant_id, program_id, sequence_order);

-- ===========================
-- Student Profiles
-- ===========================
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  regulatory_id TEXT NULL,     -- e.g. DGCA file number
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','ON_HOLD','COMPLETED','WITHDRAWN')),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_student_profiles_tenant_user
  ON student_profiles (tenant_id, user_id);

CREATE INDEX IF NOT EXISTS idx_student_profiles_tenant_status
  ON student_profiles (tenant_id, status);

-- ===========================
-- Student Lesson Attempts
-- ===========================
CREATE TABLE IF NOT EXISTS student_lesson_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES training_lessons(id) ON DELETE CASCADE,
  instructor_user_id UUID NULL REFERENCES "user"(id) ON DELETE SET NULL,
  attempt_number INT NOT NULL DEFAULT 1,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('GROUND','FLIGHT','SIMULATOR')),
  status TEXT NOT NULL CHECK (status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','FAILED','CANCELLED')),
  grade TEXT NULL,  -- e.g. "SAT", "UNSAT", "A/B/C"
  remarks TEXT NULL,
  scheduled_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_lesson_attempts_tenant_student_program
  ON student_lesson_attempts (tenant_id, student_profile_id, program_id);

CREATE INDEX IF NOT EXISTS idx_student_lesson_attempts_tenant_lesson_status
  ON student_lesson_attempts (tenant_id, lesson_id, status);

-- ===========================
-- Triggers for updated_at
-- ===========================
DROP TRIGGER IF EXISTS trg_training_programs_updated_at ON training_programs;
CREATE TRIGGER trg_training_programs_updated_at
BEFORE UPDATE ON training_programs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_training_lessons_updated_at ON training_lessons;
CREATE TRIGGER trg_training_lessons_updated_at
BEFORE UPDATE ON training_lessons
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER trg_student_profiles_updated_at
BEFORE UPDATE ON student_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_student_lesson_attempts_updated_at ON student_lesson_attempts;
CREATE TRIGGER trg_student_lesson_attempts_updated_at
BEFORE UPDATE ON student_lesson_attempts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

