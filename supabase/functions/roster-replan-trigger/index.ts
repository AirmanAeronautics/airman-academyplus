import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriggerRequest {
  trigger_type: 'weather' | 'notam' | 'availability' | 'aircraft';
  trigger_details: any;
  affected_entity_id?: string;
  timeframe?: { start: string; end: string };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: 'User organization not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: TriggerRequest = await req.json();
    const { trigger_type, trigger_details, affected_entity_id, timeframe } = body;

    console.log(`[roster-replan-trigger] Processing ${trigger_type} trigger`);

    let affectedAssignments: any[] = [];

    // Find affected assignments based on trigger type
    switch (trigger_type) {
      case 'weather':
      case 'notam': {
        const airport_icao = trigger_details.airport_icao;
        const now = new Date().toISOString();
        const futureTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

        const { data } = await supabase
          .from('roster_assignment')
          .select('*')
          .eq('org_id', profile.org_id)
          .eq('airport_icao', airport_icao)
          .gte('start_at', now)
          .lte('start_at', futureTime)
          .in('status', ['pending_confirm', 'confirmed']);

        affectedAssignments = data || [];
        break;
      }

      case 'availability': {
        const user_id = affected_entity_id;
        const { start, end } = timeframe || {};

        if (!user_id || !start || !end) break;

        const { data } = await supabase
          .from('roster_assignment')
          .select('*')
          .eq('org_id', profile.org_id)
          .or(`instructor_id.eq.${user_id},student_id.eq.${user_id}`)
          .gte('start_at', start)
          .lte('end_at', end)
          .in('status', ['pending_confirm', 'confirmed']);

        affectedAssignments = data || [];
        break;
      }

      case 'aircraft': {
        const aircraft_id = affected_entity_id;
        const now = new Date().toISOString();

        const { data } = await supabase
          .from('roster_assignment')
          .select('*')
          .eq('org_id', profile.org_id)
          .eq('aircraft_id', aircraft_id)
          .gte('start_at', now)
          .in('status', ['pending_confirm', 'confirmed']);

        affectedAssignments = data || [];
        break;
      }
    }

    console.log(`[roster-replan-trigger] Found ${affectedAssignments.length} affected assignments`);

    // Generate alternatives for each affected assignment
    let totalAlternatives = 0;

    for (const assignment of affectedAssignments) {
      const alternatives = await generateAlternatives(supabase, assignment, trigger_type, profile.org_id);
      
      // Store alternatives in database
      for (const alt of alternatives) {
        const { error: insertError } = await supabase
          .from('roster_alternative_solutions')
          .insert({
            original_assignment_id: assignment.id,
            org_id: profile.org_id,
            trigger_type,
            trigger_details,
            alternative_assignment: alt.assignment,
            score_breakdown: alt.score_breakdown,
            status: 'pending',
          });

        if (!insertError) totalAlternatives++;
      }

      // Mark original assignment as pending confirmation
      await supabase
        .from('roster_assignment')
        .update({ status: 'pending_confirm' })
        .eq('id', assignment.id);

      // Create notification for affected users
      const notificationUsers = [assignment.student_id, assignment.instructor_id].filter(Boolean);
      for (const notifUserId of notificationUsers) {
        await supabase.from('notifications').insert({
          user_id: notifUserId,
          org_id: profile.org_id,
          title: 'Flight Schedule Update Required',
          message: `Your scheduled flight may need rescheduling due to ${trigger_type}. Please review alternatives.`,
          type: 'warning',
        });
      }
    }

    // Log event
    await supabase.from('event_log').insert({
      org_id: profile.org_id,
      user_id: user.id,
      type: 'schedule_disruption_detected',
      category: 'roster',
      message: `${trigger_type} change affects ${affectedAssignments.length} assignments`,
      metadata: {
        trigger_type,
        affected_assignments: affectedAssignments.map(a => a.id),
        alternatives_generated: totalAlternatives,
        trigger_details,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      affected_assignments: affectedAssignments.length,
      alternatives_generated: totalAlternatives,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[roster-replan-trigger] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateAlternatives(
  supabase: any,
  originalAssignment: any,
  triggerType: string,
  orgId: string
) {
  const alternatives: any[] = [];
  const maxAlternatives = 3;

  // Strategy 1: Different time slots
  if (triggerType === 'weather' || triggerType === 'notam') {
    const timeSlots = generateAlternativeTimeSlots(originalAssignment.start_at, 3);
    
    for (const slot of timeSlots) {
      if (alternatives.length >= maxAlternatives) break;

      const candidate = {
        ...originalAssignment,
        start_at: slot.start,
        end_at: slot.end,
      };

      const alt = await evaluateCandidate(supabase, candidate, orgId);
      if (alt) alternatives.push(alt);
    }
  }

  // Strategy 2: Different instructor
  if (triggerType === 'availability') {
    const { data: instructors } = await supabase
      .from('profiles')
      .select('id')
      .eq('org_id', orgId)
      .eq('role', 'instructor')
      .neq('id', originalAssignment.instructor_id)
      .limit(5);

    for (const instructor of instructors || []) {
      if (alternatives.length >= maxAlternatives) break;

      const candidate = {
        ...originalAssignment,
        instructor_id: instructor.id,
      };

      const alt = await evaluateCandidate(supabase, candidate, orgId);
      if (alt) alternatives.push(alt);
    }
  }

  // Strategy 3: Different aircraft
  if (triggerType === 'aircraft') {
    const { data: aircraft } = await supabase
      .from('aircraft')
      .select('id')
      .eq('org_id', orgId)
      .eq('status', 'available')
      .neq('id', originalAssignment.aircraft_id)
      .limit(5);

    for (const ac of aircraft || []) {
      if (alternatives.length >= maxAlternatives) break;

      const candidate = {
        ...originalAssignment,
        aircraft_id: ac.id,
      };

      const alt = await evaluateCandidate(supabase, candidate, orgId);
      if (alt) alternatives.push(alt);
    }
  }

  return alternatives.sort((a, b) => b.score_breakdown.total_score - a.score_breakdown.total_score);
}

async function evaluateCandidate(supabase: any, candidate: any, orgId: string) {
  // Check feasibility
  const { data: feasibilityData } = await supabase.functions.invoke('roster-feasibility-check', {
    body: {
      student_id: candidate.student_id,
      instructor_id: candidate.instructor_id,
      aircraft_id: candidate.aircraft_id,
      lesson_id: candidate.lesson_id,
      airport_icao: candidate.airport_icao,
      start_at: candidate.start_at,
      end_at: candidate.end_at,
    },
  });

  if (!feasibilityData?.data?.feasible) return null;

  // Score the assignment
  const { data: scoreData } = await supabase.functions.invoke('roster-score-assignment', {
    body: {
      student_id: candidate.student_id,
      instructor_id: candidate.instructor_id,
      aircraft_id: candidate.aircraft_id,
      plan_id: candidate.plan_id,
      start_at: candidate.start_at,
      end_at: candidate.end_at,
      airport_icao: candidate.airport_icao,
    },
  });

  return {
    assignment: candidate,
    score_breakdown: scoreData?.data || { total_score: 0 },
  };
}

function generateAlternativeTimeSlots(originalStart: string, count: number) {
  const slots = [];
  const original = new Date(originalStart);
  
  // Generate slots at +2h, +4h, +24h intervals
  const intervals = [2, 4, 24];
  
  for (let i = 0; i < Math.min(count, intervals.length); i++) {
    const newStart = new Date(original.getTime() + intervals[i] * 60 * 60 * 1000);
    const newEnd = new Date(newStart.getTime() + 2 * 60 * 60 * 1000); // 2-hour duration
    
    slots.push({
      start: newStart.toISOString(),
      end: newEnd.toISOString(),
    });
  }
  
  return slots;
}
