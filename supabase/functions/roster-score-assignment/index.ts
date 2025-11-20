import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScoreRequest {
  plan_id: string
  student_id: string
  instructor_id: string
  aircraft_id: string
  airport_icao: string
  start_at: string
  end_at: string
  lesson_id?: string
}

interface ScoreBreakdown {
  weather_fit: number
  instructor_balance: number
  travel_min: number
  aircraft_utilization: number
  student_continuity: number
  cancellation_risk: number
}

interface ScoreResult {
  total_score: number
  breakdown: ScoreBreakdown
  computed_at: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const request: ScoreRequest = await req.json()

    // Get objective weights from roster plan
    const { data: plan } = await supabaseClient
      .from('roster_plan')
      .select('objective_weights')
      .eq('id', request.plan_id)
      .single()

    const weights = plan?.objective_weights || {
      weather_fit: 0.30,
      instructor_balance: 0.20,
      travel_min: 0.15,
      aircraft_utilization: 0.15,
      student_continuity: 0.10,
      cancellation_risk: 0.10,
    }

    // Run all scoring functions in parallel
    const [
      weatherScore,
      instructorScore,
      travelScore,
      aircraftScore,
      continuityScore,
      riskScore,
    ] = await Promise.all([
      scoreWeatherFit(supabaseClient, request),
      scoreInstructorBalance(supabaseClient, request),
      scoreTravelMin(supabaseClient, request),
      scoreAircraftUtilization(supabaseClient, request),
      scoreStudentContinuity(supabaseClient, request),
      scoreCancellationRisk(supabaseClient, request),
    ])

    const breakdown: ScoreBreakdown = {
      weather_fit: weatherScore,
      instructor_balance: instructorScore,
      travel_min: travelScore,
      aircraft_utilization: aircraftScore,
      student_continuity: continuityScore,
      cancellation_risk: riskScore,
    }

    // Calculate weighted total score
    const totalScore =
      weatherScore * weights.weather_fit +
      instructorScore * weights.instructor_balance +
      travelScore * weights.travel_min +
      aircraftScore * weights.aircraft_utilization +
      continuityScore * weights.student_continuity +
      riskScore * weights.cancellation_risk

    const result: ScoreResult = {
      total_score: Math.round(totalScore * 100) / 100,
      breakdown,
      computed_at: new Date().toISOString(),
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error scoring assignment:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Scoring dimension functions

async function scoreWeatherFit(client: any, request: ScoreRequest): Promise<number> {
  // Query latest weather snapshot
  const { data: weather } = await client
    .from('environment_snapshot')
    .select('weather, captured_at')
    .order('captured_at', { ascending: false })
    .limit(1)
    .single()

  if (!weather?.weather) return 0.5 // Default if no weather data

  const weatherData = weather.weather as any
  const metar = weatherData.METAR?.[request.airport_icao]
  const taf = weatherData.TAF?.[request.airport_icao]

  if (!metar && !taf) return 0.5

  // Get lesson requirements
  const { data: lesson } = await client
    .from('lesson_catalog')
    .select('requirements')
    .eq('id', request.lesson_id)
    .single()

  const minima = lesson?.requirements?.weather_minima || {
    ceiling_ft: 3000,
    vis_km: 5,
    wind_max_kts: 20,
    xwind_max_kts: 10,
  }

  let score = 1.0

  // Check METAR conditions
  if (metar) {
    // Ceiling check
    if (metar.ceiling_ft && metar.ceiling_ft < minima.ceiling_ft) {
      score -= 0.3
    }

    // Visibility check
    if (metar.visibility_km && metar.visibility_km < minima.vis_km) {
      score -= 0.3
    }

    // Wind check
    if (metar.wind_speed_kts && metar.wind_speed_kts > minima.wind_max_kts) {
      score -= 0.2
    }

    // Crosswind check
    if (metar.crosswind_kts && metar.crosswind_kts > minima.xwind_max_kts) {
      score -= 0.2
    }
  }

  // TAF forecast stability bonus
  if (taf?.forecast_stable === true) {
    score += 0.1
  }

  // Convective activity penalty
  if (metar?.conditions?.includes('TS') || taf?.conditions?.includes('TS')) {
    score -= 0.4
  }

  return Math.max(0, Math.min(1, score))
}

async function scoreInstructorBalance(
  client: any,
  request: ScoreRequest
): Promise<number> {
  // Get instructor's weekly workload
  const startOfWeek = new Date(request.start_at)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  const { data: instructorAssignments } = await client
    .from('roster_assignment')
    .select('id')
    .eq('instructor_id', request.instructor_id)
    .gte('start_at', startOfWeek.toISOString())
    .lt('start_at', endOfWeek.toISOString())

  const instructorCount = instructorAssignments?.length || 0

  // Get average workload across all instructors
  const { data: allAssignments } = await client
    .from('roster_assignment')
    .select('instructor_id')
    .gte('start_at', startOfWeek.toISOString())
    .lt('start_at', endOfWeek.toISOString())

  if (!allAssignments || allAssignments.length === 0) return 1.0

  // Calculate average assignments per instructor
  const instructorCounts = new Map<string, number>()
  allAssignments.forEach((a: any) => {
    instructorCounts.set(a.instructor_id, (instructorCounts.get(a.instructor_id) || 0) + 1)
  })

  const avgCount = Array.from(instructorCounts.values()).reduce((a, b) => a + b, 0) / instructorCounts.size

  // Score: closer to average = better
  const deviation = Math.abs(instructorCount - avgCount) / (avgCount + 1)
  return Math.max(0, 1 - deviation * 0.5)
}

async function scoreTravelMin(client: any, request: ScoreRequest): Promise<number> {
  // Get instructor's base airport
  const { data: profile } = await client
    .from('profiles')
    .select('aviation_region')
    .eq('id', request.instructor_id)
    .single()

  // Simple distance estimation (in production, use actual coordinates)
  // For now, same ICAO = 1.0, different = calculate based on region
  const baseAirport = profile?.aviation_region || request.airport_icao

  if (baseAirport === request.airport_icao) {
    return 1.0 // Same airport, perfect score
  }

  // Simplified distance penalty (normalize 0-100km range)
  // In production, calculate actual great circle distance
  const estimatedDistanceKm = 50 // Placeholder
  const score = Math.max(0, 1 - estimatedDistanceKm / 100)

  return score
}

async function scoreAircraftUtilization(
  client: any,
  request: ScoreRequest
): Promise<number> {
  // Get aircraft maintenance schedule
  const { data: aircraft } = await client
    .from('aircraft')
    .select('total_hours, next_inspection, hours_since_maintenance')
    .eq('id', request.aircraft_id)
    .single()

  if (!aircraft) return 0.5

  // Prioritize aircraft close to maintenance window
  const hoursToMaintenance = aircraft.next_inspection
    ? (aircraft.total_hours || 0) - parseFloat(aircraft.hours_since_maintenance || 0)
    : 1000

  // Aircraft close to maintenance (50-100 hours out) get higher scores
  if (hoursToMaintenance < 50) {
    return 0.3 // Too close, needs maintenance soon
  } else if (hoursToMaintenance < 100) {
    return 0.9 // Sweet spot - use it before it goes down
  } else if (hoursToMaintenance < 200) {
    return 0.7 // Good utilization
  } else {
    return 0.5 // Low priority, far from maintenance
  }
}

async function scoreStudentContinuity(
  client: any,
  request: ScoreRequest
): Promise<number> {
  // Get student's recent assignments
  const { data: recentAssignments } = await client
    .from('roster_assignment')
    .select('instructor_id')
    .eq('student_id', request.student_id)
    .order('start_at', { ascending: false })
    .limit(5)

  if (!recentAssignments || recentAssignments.length === 0) {
    return 0.7 // New student, neutral score
  }

  // Calculate instructor consistency
  const instructorCounts = new Map<string, number>()
  recentAssignments.forEach((a: any) => {
    instructorCounts.set(a.instructor_id, (instructorCounts.get(a.instructor_id) || 0) + 1)
  })

  const primaryInstructor = Array.from(instructorCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0]

  if (primaryInstructor === request.instructor_id) {
    return 1.0 // Same as primary instructor, excellent continuity
  }

  // Penalize switching instructors
  const switchCount = recentAssignments.filter(
    (a: any) => a.instructor_id !== primaryInstructor
  ).length

  return Math.max(0.3, 1 - switchCount * 0.15)
}

async function scoreCancellationRisk(
  client: any,
  request: ScoreRequest
): Promise<number> {
  // Query environment snapshot for NOTAMs and traffic
  const { data: envData } = await client
    .from('environment_snapshot')
    .select('notams, traffic')
    .order('captured_at', { ascending: false })
    .limit(1)
    .single()

  let score = 1.0

  // Check NOTAM density
  if (envData?.notams) {
    const notams = envData.notams as any
    const airportNotams = notams[request.airport_icao] || []

    // High NOTAM count increases cancellation risk
    if (airportNotams.length > 5) {
      score -= 0.3
    } else if (airportNotams.length > 2) {
      score -= 0.15
    }

    // Critical NOTAMs (runway closures) severely penalize
    const criticalNotams = airportNotams.filter((n: any) =>
      n.toLowerCase().includes('runway') || n.toLowerCase().includes('closed')
    )
    if (criticalNotams.length > 0) {
      score -= 0.5
    }
  }

  // Check traffic density (placeholder logic)
  if (envData?.traffic) {
    const traffic = envData.traffic as any
    const trafficDensity = traffic[request.airport_icao]?.density || 'low'

    if (trafficDensity === 'high') {
      score -= 0.2
    } else if (trafficDensity === 'medium') {
      score -= 0.1
    }
  }

  // Historical weather volatility (placeholder - would need historical data)
  // For now, assume stable conditions
  const weatherVolatility = 0.1
  score -= weatherVolatility

  return Math.max(0, Math.min(1, score))
}
