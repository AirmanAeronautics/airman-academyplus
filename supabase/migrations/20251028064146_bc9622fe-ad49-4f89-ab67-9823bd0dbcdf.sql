-- Create report templates table
CREATE TABLE public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  regulatory_authority TEXT,
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  format TEXT DEFAULT 'csv',
  is_active BOOLEAN DEFAULT true,
  is_ai_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create report schedules table
CREATE TABLE public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.report_templates(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL,
  frequency TEXT NOT NULL,
  day_of_week INT,
  day_of_month INT,
  time_of_day TIME,
  recipients JSONB DEFAULT '[]'::jsonb,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create report history table
CREATE TABLE public.report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.report_templates(id) ON DELETE SET NULL,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  file_url TEXT,
  file_format TEXT,
  row_count INT,
  file_size_kb INT,
  filters_applied JSONB DEFAULT '{}'::jsonb,
  date_range_start DATE,
  date_range_end DATE,
  status TEXT DEFAULT 'completed',
  error_message TEXT
);

-- Create flight hours log table
CREATE TABLE public.flight_hours_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.roster_assignment(id) ON DELETE SET NULL,
  student_id UUID NOT NULL,
  instructor_id UUID NOT NULL,
  aircraft_id TEXT NOT NULL,
  flight_date DATE NOT NULL,
  flight_duration_hours DECIMAL(5,2) NOT NULL,
  flight_type TEXT,
  is_cross_country BOOLEAN DEFAULT false,
  is_night_flight BOOLEAN DEFAULT false,
  is_instrument BOOLEAN DEFAULT false,
  takeoffs INT DEFAULT 0,
  landings INT DEFAULT 0,
  remarks TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  logged_by UUID REFERENCES auth.users(id)
);

-- Add indexes
CREATE INDEX idx_report_history_org ON public.report_history(org_id, generated_at DESC);
CREATE INDEX idx_report_history_type ON public.report_history(report_type);
CREATE INDEX idx_flight_hours_student ON public.flight_hours_log(student_id, flight_date);
CREATE INDEX idx_flight_hours_instructor ON public.flight_hours_log(instructor_id, flight_date);
CREATE INDEX idx_flight_hours_aircraft ON public.flight_hours_log(aircraft_id, flight_date);
CREATE INDEX idx_flight_hours_date ON public.flight_hours_log(org_id, flight_date DESC);

-- Enable RLS
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_hours_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for report_templates
CREATE POLICY "Users can view templates in their org"
  ON public.report_templates FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage templates"
  ON public.report_templates FOR ALL
  USING (is_org_admin(org_id));

-- RLS Policies for report_schedules
CREATE POLICY "Users can view schedules in their org"
  ON public.report_schedules FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage schedules"
  ON public.report_schedules FOR ALL
  USING (is_org_admin(org_id));

-- RLS Policies for report_history
CREATE POLICY "Users can view report history in their org"
  ON public.report_history FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create reports"
  ON public.report_history FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Admins can manage report history"
  ON public.report_history FOR ALL
  USING (is_org_admin(org_id));

-- RLS Policies for flight_hours_log
CREATE POLICY "Users can view flight hours in their org"
  ON public.flight_hours_log FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Instructors can log flight hours"
  ON public.flight_hours_log FOR INSERT
  WITH CHECK (org_id = get_user_org_id() AND instructor_id = auth.uid());

CREATE POLICY "Admins can manage flight hours"
  ON public.flight_hours_log FOR ALL
  USING (is_org_admin(org_id));

-- Add trigger for updated_at
CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at
  BEFORE UPDATE ON public.report_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();