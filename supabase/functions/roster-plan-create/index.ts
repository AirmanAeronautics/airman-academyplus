import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePlanRequest {
  period_start: string // ISO date
  period_end: string // ISO date
  objective_weights?: {
    weather_fit?: number
    instructor_balance?: number
    travel_min?: number
    aircraft_utilization?: number
    student_continuity?: number
    cancellation_risk?: number
  }
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

    // Get user's org_id
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('User profile not found')
    }

    const body: CreatePlanRequest = await req.json()

    // Validate dates
    const startDate = new Date(body.period_start)
    const endDate = new Date(body.period_end)

    if (endDate < startDate) {
      throw new Error('period_end must be after period_start')
    }

    // Create roster plan
    const { data: plan, error: planError } = await supabaseClient
      .from('roster_plan')
      .insert({
        org_id: profile.org_id,
        period_start: body.period_start,
        period_end: body.period_end,
        objective_weights: body.objective_weights || {
          weather_fit: 0.3,
          instructor_balance: 0.2,
          travel_min: 0.15,
          aircraft_utilization: 0.15,
          student_continuity: 0.1,
          cancellation_risk: 0.1,
        },
        status: 'draft',
      })
      .select()
      .single()

    if (planError) {
      throw planError
    }

    // Log event
    await supabaseClient.from('event_log').insert({
      org_id: profile.org_id,
      user_id: user.id,
      type: 'roster_plan_created',
      category: 'roster',
      message: `Created roster plan for ${body.period_start} to ${body.period_end}`,
      metadata: { plan_id: plan.id },
    })

    return new Response(JSON.stringify({ success: true, data: plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    })
  } catch (error) {
    console.error('Error creating roster plan:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
