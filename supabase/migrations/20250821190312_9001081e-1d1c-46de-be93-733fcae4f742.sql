-- AIRMAN Academy+ Schema Upgrade - Phase 2, 3, 4
-- Time-series telemetry, enhanced compliance, configurable billing

-- ====== ENHANCED AIRCRAFT & MAINTENANCE ======

-- Aircraft with enhanced tracking
CREATE TABLE IF NOT EXISTS public.aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  registration TEXT NOT NULL UNIQUE,
  aircraft_type TEXT NOT NULL, -- SEP, MEP, SIM, HELI
  make_model TEXT NOT NULL,
  year_manufactured INTEGER,
  total_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  hours_since_maintenance DECIMAL(8,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available', -- available, in_flight, maintenance, grounded, out_of_service
  location TEXT,
  fuel_capacity DECIMAL(6,2),
  current_fuel_level DECIMAL(6,2),
  insurance_expiry DATE,
  certificate_expiry DATE,
  last_inspection DATE,
  next_inspection DATE,
  maintenance_intervals JSONB, -- Different maintenance types and intervals
  avionics_config JSONB, -- Avionics equipment configuration
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maintenance events with enhanced tracking
CREATE TABLE IF NOT EXISTS public.maintenance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  aircraft_id UUID NOT NULL REFERENCES public.aircraft(id),
  event_type TEXT NOT NULL, -- scheduled, unscheduled, inspection, repair, modification
  maintenance_type TEXT NOT NULL, -- 50hr, 100hr, annual, progressive, ad, sb
  description TEXT NOT NULL,
  scheduled_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, deferred
  performed_by TEXT,
  cost DECIMAL(10,2),
  parts_used JSONB, -- Array of parts with costs
  hours_at_maintenance DECIMAL(8,2),
  next_due_hours DECIMAL(8,2),
  next_due_date DATE,
  certifying_signature TEXT,
  work_order_ref TEXT,
  regulatory_ref TEXT, -- AD number, SB number, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced defects tracking
CREATE TABLE IF NOT EXISTS public.aircraft_defects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  aircraft_id UUID NOT NULL REFERENCES public.aircraft(id),
  reported_by UUID REFERENCES public.profiles(id),
  description TEXT NOT NULL,
  severity TEXT NOT NULL, -- minor, major, grounding
  status TEXT NOT NULL DEFAULT 'open', -- open, deferred, rectified, cancelled
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date DATE,
  rectified_at TIMESTAMPTZ,
  rectified_by UUID REFERENCES public.profiles(id),
  maintenance_event_id UUID REFERENCES public.maintenance_events(id),
  mel_reference TEXT, -- Minimum Equipment List reference
  regulatory_action_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Flight sessions enhanced
CREATE TABLE IF NOT EXISTS public.flight_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  session_ref TEXT NOT NULL, -- External reference from XB70/Maverick
  student_id UUID REFERENCES public.profiles(id),
  instructor_id UUID REFERENCES public.profiles(id),
  aircraft_id UUID REFERENCES public.aircraft(id),
  flight_date DATE NOT NULL,
  scheduled_start TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  flight_time DECIMAL(4,2), -- Hobbs hours
  flight_type TEXT NOT NULL, -- training, solo, check_ride, cross_country, etc.
  lesson_plan TEXT,
  departure_airport TEXT,
  arrival_airport TEXT,
  route TEXT,
  flight_phases JSONB, -- Array of flight phases with timestamps
  weather_conditions JSONB, -- Weather at departure/arrival
  fuel_used DECIMAL(6,2),
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  telemetry_ingested BOOLEAN DEFAULT false,
  telemetry_ingested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Time-series telemetry data (optimized for PostgreSQL)
CREATE TABLE IF NOT EXISTS public.flight_telemetry (
  time TIMESTAMPTZ NOT NULL,
  flight_session_id UUID NOT NULL REFERENCES public.flight_sessions(id),
  org_id UUID NOT NULL,
  -- Position data
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  altitude_msl INTEGER, -- Mean Sea Level altitude in feet
  altitude_agl INTEGER, -- Above Ground Level altitude in feet
  -- Flight dynamics
  airspeed INTEGER, -- Indicated airspeed in knots
  groundspeed INTEGER, -- Ground speed in knots
  vertical_speed INTEGER, -- Vertical speed in feet per minute
  heading INTEGER, -- Magnetic heading in degrees
  track INTEGER, -- Ground track in degrees
  -- Engine data
  engine_rpm INTEGER,
  manifold_pressure DECIMAL(4,2),
  fuel_flow DECIMAL(5,2),
  oil_pressure DECIMAL(4,1),
  oil_temperature DECIMAL(5,1),
  cylinder_head_temp DECIMAL(5,1),
  exhaust_gas_temp DECIMAL(6,1),
  -- Flight controls
  elevator_position DECIMAL(5,2),
  aileron_position DECIMAL(5,2),
  rudder_position DECIMAL(5,2),
  throttle_position DECIMAL(5,2),
  -- Navigation
  nav1_frequency DECIMAL(6,2),
  nav2_frequency DECIMAL(6,2),
  com1_frequency DECIMAL(6,3),
  com2_frequency DECIMAL(6,3),
  transponder_code INTEGER,
  autopilot_engaged BOOLEAN,
  -- Weather
  outside_air_temp DECIMAL(4,1),
  wind_speed INTEGER,
  wind_direction INTEGER,
  visibility DECIMAL(4,1),
  -- G-forces and exceedances
  g_force_vertical DECIMAL(4,2),
  g_force_lateral DECIMAL(4,2),
  g_force_longitudinal DECIMAL(4,2),
  -- Flags for analysis
  exceedance_flags JSONB, -- Array of exceedance types detected
  flight_phase TEXT -- takeoff, climb, cruise, descent, approach, landing, etc.
);

-- Create optimized indexes for time-series queries
CREATE INDEX IF NOT EXISTS idx_flight_telemetry_time ON public.flight_telemetry (time DESC);
CREATE INDEX IF NOT EXISTS idx_flight_telemetry_session_time ON public.flight_telemetry (flight_session_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_flight_telemetry_org_time ON public.flight_telemetry (org_id, time DESC);

-- Enable Row Level Security
ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aircraft_defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_telemetry ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for aircraft
CREATE POLICY "Users can view aircraft in their organization" ON public.aircraft
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage aircraft in their organization" ON public.aircraft
  FOR ALL USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Create RLS policies for maintenance events
CREATE POLICY "Users can view maintenance in their organization" ON public.maintenance_events
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage maintenance in their organization" ON public.maintenance_events
  FOR ALL USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Create RLS policies for defects
CREATE POLICY "Users can view defects in their organization" ON public.aircraft_defects
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage defects in their organization" ON public.aircraft_defects
  FOR ALL USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Create RLS policies for flight sessions
CREATE POLICY "Users can view flight sessions in their organization" ON public.flight_sessions
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage flight sessions in their organization" ON public.flight_sessions
  FOR ALL USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Create RLS policies for telemetry
CREATE POLICY "Users can view telemetry in their organization" ON public.flight_telemetry
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert telemetry in their organization" ON public.flight_telemetry
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));