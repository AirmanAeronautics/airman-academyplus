-- =====================================================
-- Phase 1: AI-Driven Dynamic Roster System - Foundation
-- =====================================================

-- 1. LESSON CATALOG
-- Stores lesson definitions with weather, aircraft, and instructor requirements
CREATE TABLE public.lesson_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  program TEXT NOT NULL CHECK (program IN ('PPL', 'CPL', 'IR', 'ME', 'CFI', 'ATPL')),
  stage TEXT,
  duration_min INTEGER NOT NULL,
  requirements JSONB NOT NULL DEFAULT '{
    "weather_minima": {
      "ceiling_ft": 3000,
      "vis_km": 5,
      "wind_max_kts": 20,
      "xwind_max_kts": 10,
      "day_only": false
    },
    "aircraft_req": [],
    "instructor_req": [],
    "airspace_req": []
  }'::jsonb,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lesson_catalog_org ON public.lesson_catalog(org_id);
CREATE INDEX idx_lesson_catalog_program ON public.lesson_catalog(program);

-- 2. AIRCRAFT CAPABILITY
-- Tracks specific capabilities of each aircraft
CREATE TABLE public.aircraft_capability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES public.aircraft(id) ON DELETE CASCADE,
  capability TEXT NOT NULL CHECK (capability IN ('IFR', 'Night', 'Spins', 'Glass', 'Dual-controls', 'Complex', 'High-performance', 'Tailwheel')),
  value TEXT NOT NULL DEFAULT 'true',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aircraft_id, capability)
);

CREATE INDEX idx_aircraft_capability_aircraft ON public.aircraft_capability(aircraft_id);
CREATE INDEX idx_aircraft_capability_type ON public.aircraft_capability(capability);

-- 3. AVAILABILITY BLOCK
-- User availability with recurring pattern support (iCal RRULE)
CREATE TABLE public.availability_block (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('available', 'unavailable', 'tentative', 'standby')) DEFAULT 'available',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  location_icao TEXT,
  recurs_rrule TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_at > start_at)
);

CREATE INDEX idx_availability_block_user ON public.availability_block(user_id);
CREATE INDEX idx_availability_block_org ON public.availability_block(org_id);
CREATE INDEX idx_availability_block_time ON public.availability_block(start_at, end_at);

-- 4. AIRCRAFT AVAILABILITY
-- Aircraft maintenance windows and reservations
CREATE TABLE public.aircraft_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES public.aircraft(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('available', 'maintenance', 'reserved', 'grounded')) DEFAULT 'available',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_at > start_at)
);

CREATE INDEX idx_aircraft_availability_aircraft ON public.aircraft_availability(aircraft_id);
CREATE INDEX idx_aircraft_availability_time ON public.aircraft_availability(start_at, end_at);

-- 5. ENVIRONMENT SNAPSHOT
-- Real-time weather (METAR/TAF), NOTAMs, traffic data
CREATE TABLE public.environment_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  weather JSONB DEFAULT '{}'::jsonb,
  notams JSONB DEFAULT '{}'::jsonb,
  traffic JSONB DEFAULT '{}'::jsonb,
  source_system TEXT DEFAULT 'auto_ingest'
);

CREATE INDEX idx_environment_snapshot_org ON public.environment_snapshot(org_id);
CREATE INDEX idx_environment_snapshot_time ON public.environment_snapshot(captured_at DESC);

-- 6. CONSTRAINT POLICIES
-- Configurable rules (FDTL, School Duty, Lesson Minima)
CREATE TABLE public.constraint_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('FDTL', 'SchoolDuty', 'LessonMinima', 'AircraftPerformance')),
  policy_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, policy_type, version)
);

CREATE INDEX idx_constraint_policies_org ON public.constraint_policies(org_id);
CREATE INDEX idx_constraint_policies_active ON public.constraint_policies(org_id, policy_type, active);

-- 7. ROSTER PLAN
-- Planning periods with optimization objectives
CREATE TABLE public.roster_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
  objective_weights JSONB DEFAULT '{
    "weather_fit": 0.3,
    "instructor_balance": 0.2,
    "travel_min": 0.15,
    "aircraft_utilization": 0.15,
    "student_continuity": 0.1,
    "cancellation_risk": 0.1
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (period_end >= period_start)
);

CREATE INDEX idx_roster_plan_org ON public.roster_plan(org_id);
CREATE INDEX idx_roster_plan_period ON public.roster_plan(period_start, period_end);
CREATE INDEX idx_roster_plan_status ON public.roster_plan(org_id, status);

-- 8. ROSTER ASSIGNMENT
-- The actual scheduled flights with AI feasibility proof
CREATE TABLE public.roster_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.roster_plan(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lesson_catalog(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  aircraft_id UUID REFERENCES public.aircraft(id) ON DELETE SET NULL,
  airport_icao TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'pending_confirm', 'cancelled', 'completed')) DEFAULT 'scheduled',
  feasibility_proof JSONB DEFAULT '{}'::jsonb,
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  sync_state JSONB DEFAULT '{"student": false, "instructor": false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_at > start_at)
);

CREATE INDEX idx_roster_assignment_plan ON public.roster_assignment(plan_id);
CREATE INDEX idx_roster_assignment_org ON public.roster_assignment(org_id);
CREATE INDEX idx_roster_assignment_student ON public.roster_assignment(student_id);
CREATE INDEX idx_roster_assignment_instructor ON public.roster_assignment(instructor_id);
CREATE INDEX idx_roster_assignment_aircraft ON public.roster_assignment(aircraft_id);
CREATE INDEX idx_roster_assignment_time ON public.roster_assignment(start_at, end_at);
CREATE INDEX idx_roster_assignment_status ON public.roster_assignment(status);

-- 9. LINK EXISTING FLIGHT_SESSIONS TO ROSTER_ASSIGNMENT
ALTER TABLE public.flight_sessions ADD COLUMN IF NOT EXISTS roster_assignment_id UUID REFERENCES public.roster_assignment(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_flight_sessions_roster ON public.flight_sessions(roster_assignment_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- LESSON CATALOG
ALTER TABLE public.lesson_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lessons in their org"
ON public.lesson_catalog FOR SELECT
USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage lessons"
ON public.lesson_catalog FOR ALL
USING (is_org_admin(org_id));

-- AIRCRAFT CAPABILITY
ALTER TABLE public.aircraft_capability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view aircraft capabilities in their org"
ON public.aircraft_capability FOR SELECT
USING (aircraft_id IN (
  SELECT id FROM public.aircraft WHERE org_id = get_user_org_id()
));

CREATE POLICY "Admins can manage aircraft capabilities"
ON public.aircraft_capability FOR ALL
USING (aircraft_id IN (
  SELECT id FROM public.aircraft WHERE org_id = get_user_org_id() AND is_org_admin(get_user_org_id())
));

-- AVAILABILITY BLOCK
ALTER TABLE public.availability_block ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own availability"
ON public.availability_block FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all availability in org"
ON public.availability_block FOR SELECT
USING (is_org_admin(org_id));

-- AIRCRAFT AVAILABILITY
ALTER TABLE public.aircraft_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view aircraft availability in their org"
ON public.aircraft_availability FOR SELECT
USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage aircraft availability"
ON public.aircraft_availability FOR ALL
USING (is_org_admin(org_id));

-- ENVIRONMENT SNAPSHOT
ALTER TABLE public.environment_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view environment data in their org"
ON public.environment_snapshot FOR SELECT
USING (org_id = get_user_org_id());

CREATE POLICY "System can insert environment data"
ON public.environment_snapshot FOR INSERT
WITH CHECK (true);

-- CONSTRAINT POLICIES
ALTER TABLE public.constraint_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view policies in their org"
ON public.constraint_policies FOR SELECT
USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage policies"
ON public.constraint_policies FOR ALL
USING (is_org_admin(org_id));

-- ROSTER PLAN
ALTER TABLE public.roster_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roster plans in their org"
ON public.roster_plan FOR SELECT
USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage roster plans"
ON public.roster_plan FOR ALL
USING (is_org_admin(org_id));

-- ROSTER ASSIGNMENT
ALTER TABLE public.roster_assignment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own assignments"
ON public.roster_assignment FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Instructors can view their assignments"
ON public.roster_assignment FOR SELECT
USING (instructor_id = auth.uid());

CREATE POLICY "Admins can manage all assignments in org"
ON public.roster_assignment FOR ALL
USING (is_org_admin(org_id));

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamps
CREATE TRIGGER update_lesson_catalog_updated_at
  BEFORE UPDATE ON public.lesson_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_block_updated_at
  BEFORE UPDATE ON public.availability_block
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_constraint_policies_updated_at
  BEFORE UPDATE ON public.constraint_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roster_plan_updated_at
  BEFORE UPDATE ON public.roster_plan
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roster_assignment_updated_at
  BEFORE UPDATE ON public.roster_assignment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();