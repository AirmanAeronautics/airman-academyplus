import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse query parameters
    const url = new URL(req.url)
    const planId = url.searchParams.get('plan_id')
    const status = url.searchParams.get('status')
    const studentId = url.searchParams.get('student_id')
    const instructorId = url.searchParams.get('instructor_id')
    const aircraftId = url.searchParams.get('aircraft_id')
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')

    // Build query
    let query = supabaseClient
      .from('roster_assignment')
      .select(`
        *,
        lesson:lesson_catalog(*),
        student:student_id(id, email),
        instructor:instructor_id(id, email),
        aircraft:aircraft(*)
      `)
      .order('start_at', { ascending: true })

    if (planId) query = query.eq('plan_id', planId)
    if (status) query = query.eq('status', status)
    if (studentId) query = query.eq('student_id', studentId)
    if (instructorId) query = query.eq('instructor_id', instructorId)
    if (aircraftId) query = query.eq('aircraft_id', aircraftId)
    if (startDate) query = query.gte('start_at', startDate)
    if (endDate) query = query.lte('end_at', endDate)

    const { data: assignments, error: assignmentsError } = await query

    if (assignmentsError) {
      throw assignmentsError
    }

    return new Response(
      JSON.stringify({ success: true, data: assignments }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching roster assignments:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
