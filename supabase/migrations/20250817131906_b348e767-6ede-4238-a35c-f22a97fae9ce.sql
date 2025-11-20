-- Create student-instructor relationships table
CREATE TABLE public.student_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  instructor_id UUID NOT NULL,
  course_type TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(student_id, instructor_id, course_type)
);

-- Enable RLS
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;

-- Create student progress tracking table
CREATE TABLE public.student_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  milestone_id TEXT NOT NULL,
  course_type TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completion_date TIMESTAMP WITH TIME ZONE,
  total_hours DECIMAL(5,1) NOT NULL DEFAULT 0,
  solo_hours DECIMAL(5,1) NOT NULL DEFAULT 0,
  dual_hours DECIMAL(5,1) NOT NULL DEFAULT 0,
  cross_country_hours DECIMAL(5,1) NOT NULL DEFAULT 0,
  night_hours DECIMAL(5,1) NOT NULL DEFAULT 0,
  instrument_hours DECIMAL(5,1) NOT NULL DEFAULT 0,
  overall_score INTEGER,
  readiness_level TEXT CHECK (readiness_level IN ('not_ready', 'approaching', 'ready', 'overdue')),
  weak_areas JSONB,
  strong_areas JSONB,
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(student_id, milestone_id, course_type)
);

-- Enable RLS
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Create flight debriefs table
CREATE TABLE public.flight_debriefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  student_id UUID NOT NULL,
  instructor_id UUID,
  flight_date TIMESTAMP WITH TIME ZONE NOT NULL,
  aircraft_id TEXT,
  flight_time DECIMAL(3,1) NOT NULL,
  overall_score INTEGER,
  maneuver_scores JSONB,
  ai_summary TEXT,
  improvement_areas JSONB,
  strengths JSONB,
  study_recommendations JSONB,
  next_steps TEXT,
  exceedances JSONB,
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flight_debriefs ENABLE ROW LEVEL SECURITY;

-- Create student badges table
CREATE TABLE public.student_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  date_earned TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(student_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_assignments
CREATE POLICY "Students can view their own assignments" 
ON public.student_assignments 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Instructors can view their assignments" 
ON public.student_assignments 
FOR SELECT 
USING (instructor_id = auth.uid());

CREATE POLICY "Admins can manage all assignments" 
ON public.student_assignments 
FOR ALL 
USING (is_org_admin(get_user_org_id()));

-- RLS Policies for student_progress
CREATE POLICY "Students can view their own progress" 
ON public.student_progress 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Instructors can view assigned students progress" 
ON public.student_progress 
FOR SELECT 
USING (
  student_id IN (
    SELECT student_id FROM public.student_assignments 
    WHERE instructor_id = auth.uid() AND active = true
  )
);

CREATE POLICY "Instructors can update assigned students progress" 
ON public.student_progress 
FOR UPDATE 
USING (
  student_id IN (
    SELECT student_id FROM public.student_assignments 
    WHERE instructor_id = auth.uid() AND active = true
  )
);

CREATE POLICY "Admins can manage all progress" 
ON public.student_progress 
FOR ALL 
USING (is_org_admin(get_user_org_id()));

-- RLS Policies for flight_debriefs
CREATE POLICY "Students can view their own debriefs" 
ON public.flight_debriefs 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Instructors can view assigned students debriefs" 
ON public.flight_debriefs 
FOR SELECT 
USING (
  instructor_id = auth.uid() OR 
  student_id IN (
    SELECT student_id FROM public.student_assignments 
    WHERE instructor_id = auth.uid() AND active = true
  )
);

CREATE POLICY "Instructors can create debriefs" 
ON public.flight_debriefs 
FOR INSERT 
WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Admins can manage all debriefs" 
ON public.flight_debriefs 
FOR ALL 
USING (is_org_admin(get_user_org_id()));

-- RLS Policies for student_badges
CREATE POLICY "Students can view their own badges" 
ON public.student_badges 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Instructors can view assigned students badges" 
ON public.student_badges 
FOR SELECT 
USING (
  student_id IN (
    SELECT student_id FROM public.student_assignments 
    WHERE instructor_id = auth.uid() AND active = true
  )
);

CREATE POLICY "Admins can manage all badges" 
ON public.student_badges 
FOR ALL 
USING (is_org_admin(get_user_org_id()));

-- Add updated_at triggers
CREATE TRIGGER update_student_assignments_updated_at
BEFORE UPDATE ON public.student_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_progress_updated_at
BEFORE UPDATE ON public.student_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flight_debriefs_updated_at
BEFORE UPDATE ON public.flight_debriefs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();