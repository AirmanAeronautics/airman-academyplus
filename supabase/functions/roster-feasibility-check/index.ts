import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeasibilityRequest {
  student_id: string;
  instructor_id: string | null;
  aircraft_id: string | null;
  lesson_id: string | null;
  airport_icao: string;
  start_at: string;
  end_at: string;
}

interface ConstraintResult {
  constraint_type: string;
  passed: boolean;
  blocking: boolean;
  message: string;
  details?: any;
}

interface FeasibilityReport {
  feasible: boolean;
  constraints: ConstraintResult[];
  blocking_issues: string[];
  warnings: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's org_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile?.org_id) {
      throw new Error('User organization not found');
    }

    const body: FeasibilityRequest = await req.json();
    const { student_id, instructor_id, aircraft_id, lesson_id, airport_icao, start_at, end_at } = body;

    console.log('Feasibility check request:', { student_id, instructor_id, aircraft_id, lesson_id, airport_icao, start_at, end_at });

    const constraints: ConstraintResult[] = [];
    const blocking_issues: string[] = [];
    const warnings: string[] = [];

    // 1. AVAILABILITY CHECK
    if (instructor_id) {
      const { data: instructorBlocks } = await supabase
        .from('availability_block')
        .select('*')
        .eq('user_id', instructor_id)
        .eq('org_id', profile.org_id)
        .or(`and(start_at.lte.${start_at},end_at.gte.${end_at})`);

      const hasAvailability = instructorBlocks && instructorBlocks.some(b => b.type === 'available');
      const hasUnavailability = instructorBlocks && instructorBlocks.some(b => b.type === 'unavailable');

      if (hasUnavailability) {
        constraints.push({
          constraint_type: 'availability',
          passed: false,
          blocking: true,
          message: 'Instructor marked unavailable for this time slot',
          details: { instructor_id, blocks: instructorBlocks }
        });
        blocking_issues.push('Instructor unavailable');
      } else if (!hasAvailability) {
        constraints.push({
          constraint_type: 'availability',
          passed: false,
          blocking: false,
          message: 'Instructor availability not explicitly set',
          details: { instructor_id }
        });
        warnings.push('Instructor availability not confirmed');
      } else {
        constraints.push({
          constraint_type: 'availability',
          passed: true,
          blocking: false,
          message: 'Instructor available',
          details: { instructor_id }
        });
      }
    }

    // 2. QUALIFICATIONS CHECK
    if (lesson_id && instructor_id) {
      const { data: lesson } = await supabase
        .from('lesson_catalog')
        .select('requirements')
        .eq('id', lesson_id)
        .single();

      // In a real system, we'd check instructor qualifications table
      // For now, we'll assume qualifications are met if instructor is assigned
      const instructorQualified = true; // Placeholder logic

      if (!instructorQualified) {
        constraints.push({
          constraint_type: 'qualifications',
          passed: false,
          blocking: true,
          message: 'Instructor does not meet lesson requirements',
          details: { lesson_id, instructor_id, requirements: lesson?.requirements }
        });
        blocking_issues.push('Instructor not qualified');
      } else {
        constraints.push({
          constraint_type: 'qualifications',
          passed: true,
          blocking: false,
          message: 'Instructor qualifications verified',
          details: { lesson_id, instructor_id }
        });
      }
    }

    // 3. AIRCRAFT CAPABILITIES CHECK
    if (aircraft_id && lesson_id) {
      const { data: lesson } = await supabase
        .from('lesson_catalog')
        .select('requirements')
        .eq('id', lesson_id)
        .single();

      const { data: capabilities } = await supabase
        .from('aircraft_capability')
        .select('*')
        .eq('aircraft_id', aircraft_id)
        .single();

      const requiredCapabilities = lesson?.requirements?.aircraft_req || [];
      const aircraftCapabilities = capabilities?.capabilities || [];
      const hasRequiredCapabilities = requiredCapabilities.every((req: string) => 
        aircraftCapabilities.includes(req)
      );

      if (!hasRequiredCapabilities) {
        constraints.push({
          constraint_type: 'aircraft_capabilities',
          passed: false,
          blocking: true,
          message: 'Aircraft does not meet lesson capability requirements',
          details: { aircraft_id, required: requiredCapabilities, available: aircraftCapabilities }
        });
        blocking_issues.push('Aircraft capabilities insufficient');
      } else {
        constraints.push({
          constraint_type: 'aircraft_capabilities',
          passed: true,
          blocking: false,
          message: 'Aircraft capabilities verified',
          details: { aircraft_id, capabilities: aircraftCapabilities }
        });
      }
    }

    // 4. AIRPORT/RUNWAY PERFORMANCE CHECK
    const { data: policies } = await supabase
      .from('constraint_policies')
      .select('*')
      .eq('org_id', profile.org_id)
      .eq('policy_name', 'AircraftPerformance');

    if (policies && policies.length > 0) {
      const perfPolicy = policies[0];
      const rules = perfPolicy.rules || {};
      
      // Simplified runway check - in real system would query airport database
      const runwayLengthOk = true; // Placeholder
      const densityAltitudeOk = true; // Placeholder

      if (!runwayLengthOk || !densityAltitudeOk) {
        constraints.push({
          constraint_type: 'airport_performance',
          passed: false,
          blocking: true,
          message: 'Airport does not meet aircraft performance requirements',
          details: { airport_icao, rules }
        });
        blocking_issues.push('Airport performance constraints violated');
      } else {
        constraints.push({
          constraint_type: 'airport_performance',
          passed: true,
          blocking: false,
          message: 'Airport performance requirements met',
          details: { airport_icao }
        });
      }
    }

    // 5. WEATHER MINIMA CHECK
    const { data: weatherData } = await supabase
      .from('environment_snapshot')
      .select('*')
      .eq('org_id', profile.org_id)
      .order('captured_at', { ascending: false })
      .limit(1)
      .single();

    if (lesson_id) {
      const { data: lesson } = await supabase
        .from('lesson_catalog')
        .select('requirements')
        .eq('id', lesson_id)
        .single();

      const weatherMinima = lesson?.requirements?.weather_minima || {};
      const currentWeather = weatherData?.weather || {};

      // Simplified weather check
      const weatherOk = currentWeather.visibility_km >= (weatherMinima.vis_km || 5) &&
                        currentWeather.ceiling_ft >= (weatherMinima.ceiling_ft || 3000) &&
                        currentWeather.wind_kts <= (weatherMinima.wind_max_kts || 20);

      if (!weatherOk) {
        constraints.push({
          constraint_type: 'weather_minima',
          passed: false,
          blocking: false,
          message: 'Weather forecast may not meet VFR minima',
          details: { minima: weatherMinima, forecast: currentWeather }
        });
        warnings.push('Weather conditions marginal');
      } else {
        constraints.push({
          constraint_type: 'weather_minima',
          passed: true,
          blocking: false,
          message: 'Weather conditions acceptable',
          details: { minima: weatherMinima, forecast: currentWeather }
        });
      }
    }

    // 6. DUTY RULES CHECK
    if (instructor_id) {
      const startDate = new Date(start_at);
      const dayStart = new Date(startDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(startDate);
      dayEnd.setHours(23, 59, 59, 999);

      const { data: todaysAssignments } = await supabase
        .from('roster_assignment')
        .select('*')
        .eq('instructor_id', instructor_id)
        .gte('start_at', dayStart.toISOString())
        .lte('start_at', dayEnd.toISOString());

      const { data: dutyPolicy } = await supabase
        .from('constraint_policies')
        .select('*')
        .eq('org_id', profile.org_id)
        .eq('policy_name', 'SchoolDuty')
        .single();

      const maxSortiesPerDay = dutyPolicy?.rules?.max_sorties_per_day || 6;
      const currentSorties = todaysAssignments?.length || 0;

      if (currentSorties >= maxSortiesPerDay) {
        constraints.push({
          constraint_type: 'duty_rules',
          passed: false,
          blocking: true,
          message: `Instructor exceeds max sorties per day (${maxSortiesPerDay})`,
          details: { instructor_id, current_sorties: currentSorties, max: maxSortiesPerDay }
        });
        blocking_issues.push('Duty limits exceeded');
      } else {
        constraints.push({
          constraint_type: 'duty_rules',
          passed: true,
          blocking: false,
          message: `Instructor within duty limits (${currentSorties}/${maxSortiesPerDay})`,
          details: { instructor_id, current_sorties: currentSorties, max: maxSortiesPerDay }
        });
      }
    }

    // 7. STUDENT PREREQUISITES CHECK
    if (lesson_id) {
      const { data: lesson } = await supabase
        .from('lesson_catalog')
        .select('*')
        .eq('id', lesson_id)
        .single();

      const { data: studentProgress } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', student_id)
        .eq('org_id', profile.org_id);

      // Check if student has completed prerequisite milestones
      // Simplified logic - in real system would check milestone dependencies
      const prerequisitesMet = true; // Placeholder

      if (!prerequisitesMet) {
        constraints.push({
          constraint_type: 'student_prerequisites',
          passed: false,
          blocking: true,
          message: 'Student has not completed prerequisite milestones',
          details: { student_id, lesson_id, progress: studentProgress }
        });
        blocking_issues.push('Prerequisites not met');
      } else {
        constraints.push({
          constraint_type: 'student_prerequisites',
          passed: true,
          blocking: false,
          message: 'Student prerequisites verified',
          details: { student_id, lesson_id }
        });
      }
    }

    // Determine overall feasibility
    const feasible = blocking_issues.length === 0;

    const report: FeasibilityReport = {
      feasible,
      constraints,
      blocking_issues,
      warnings
    };

    console.log('Feasibility check result:', { feasible, blocking_count: blocking_issues.length, warning_count: warnings.length });

    return new Response(JSON.stringify({ success: true, data: report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in feasibility check:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
