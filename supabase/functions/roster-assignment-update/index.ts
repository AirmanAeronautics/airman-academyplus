import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateAssignmentRequest {
  status?: 'scheduled' | 'pending_confirm' | 'cancelled' | 'completed'
  instructor_id?: string
  aircraft_id?: string
  start_at?: string
  end_at?: string
  airport_icao?: string
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

    // Extract assignment_id from URL
    const url = new URL(req.url)
    const assignmentId = url.pathname.split('/').pop()

    if (!assignmentId) {
      throw new Error('Assignment ID is required')
    }

    const body: UpdateAssignmentRequest = await req.json()

    // Get existing assignment
    const { data: existingAssignment, error: fetchError } = await supabaseClient
      .from('roster_assignment')
      .select('*')
      .eq('id', assignmentId)
      .single()

    if (fetchError || !existingAssignment) {
      throw new Error('Assignment not found')
    }

    // Update assignment
    const { data: assignment, error: updateError } = await supabaseClient
      .from('roster_assignment')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignmentId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Log event
    await supabaseClient.from('event_log').insert({
      org_id: profile.org_id,
      user_id: user.id,
      type: 'roster_assignment_updated',
      category: 'roster',
      message: `Updated assignment ${assignmentId}`,
      metadata: {
        assignment_id: assignmentId,
        changes: body,
      },
    })

    // If status changed to cancelled, could trigger notifications here
    if (body.status === 'cancelled' && existingAssignment.status !== 'cancelled') {
      console.log('Assignment cancelled, should notify student and instructor')
      // TODO: Trigger Maverick webhook
    }

    return new Response(JSON.stringify({ success: true, data: assignment }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error updating roster assignment:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
