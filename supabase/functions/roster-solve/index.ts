import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SolveRequest {
  plan_id: string;
  student_ids: string[];
  instructor_ids: string[];
  aircraft_ids: string[];
  time_slots: { start: string; end: string }[];
  max_iterations?: number;
}

interface Assignment {
  student_id: string;
  instructor_id: string;
  aircraft_id: string;
  start_at: string;
  end_at: string;
  airport_icao: string;
  lesson_id: string | null;
  score?: number;
  score_breakdown?: any;
  feasibility_proof?: any;
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

    const body: SolveRequest = await req.json();
    const { plan_id, student_ids, instructor_ids, aircraft_ids, time_slots, max_iterations = 100 } = body;

    const startTime = Date.now();
    console.log(`[roster-solve] Starting optimization for plan ${plan_id}`);

    // Get plan details
    const { data: plan } = await supabase
      .from('roster_plan')
      .select('objective_weights')
      .eq('id', plan_id)
      .single();

    // Phase 1: Greedy Initial Solution
    const assignments: Assignment[] = [];
    const unassigned_students: string[] = [];

    for (const student_id of student_ids) {
      let bestAssignment: Assignment | null = null;
      let bestScore = -Infinity;

      for (const slot of time_slots) {
        for (const instructor_id of instructor_ids) {
          for (const aircraft_id of aircraft_ids) {
            const candidate: Assignment = {
              student_id,
              instructor_id,
              aircraft_id,
              start_at: slot.start,
              end_at: slot.end,
              airport_icao: 'KJFK', // TODO: Get from lesson requirements
              lesson_id: null,
            };

            // Check feasibility
            const { data: feasibilityData } = await supabase.functions.invoke('roster-feasibility-check', {
              body: candidate,
            });

            if (feasibilityData?.data?.feasible) {
              // Score the assignment
              const { data: scoreData } = await supabase.functions.invoke('roster-score-assignment', {
                body: {
                  ...candidate,
                  plan_id,
                },
              });

              const score = scoreData?.data?.total_score || 0;
              if (score > bestScore) {
                bestScore = score;
                bestAssignment = {
                  ...candidate,
                  score,
                  score_breakdown: scoreData?.data?.breakdown,
                  feasibility_proof: feasibilityData?.data,
                };
              }
            }
          }
        }
      }

      if (bestAssignment) {
        assignments.push(bestAssignment);
      } else {
        unassigned_students.push(student_id);
      }
    }

    console.log(`[roster-solve] Greedy phase complete: ${assignments.length} assignments, ${unassigned_students.length} unassigned`);

    // Phase 2: Local Search Optimization
    let currentScore = assignments.reduce((sum, a) => sum + (a.score || 0), 0);
    let bestSolution = [...assignments];
    let bestTotalScore = currentScore;
    let iterations = 0;

    while (iterations < max_iterations && Date.now() - startTime < 45000) {
      iterations++;

      // Random swap attempt
      if (assignments.length < 2) break;

      const idx1 = Math.floor(Math.random() * assignments.length);
      const idx2 = Math.floor(Math.random() * assignments.length);
      if (idx1 === idx2) continue;

      // Try swapping instructors
      const modified = [...assignments];
      const temp = modified[idx1].instructor_id;
      modified[idx1].instructor_id = modified[idx2].instructor_id;
      modified[idx2].instructor_id = temp;

      // Re-score both modified assignments
      const scorePromises = [idx1, idx2].map(async (idx) => {
        const { data: feasibilityData } = await supabase.functions.invoke('roster-feasibility-check', {
          body: modified[idx],
        });

        if (!feasibilityData?.data?.feasible) return null;

        const { data: scoreData } = await supabase.functions.invoke('roster-score-assignment', {
          body: { ...modified[idx], plan_id },
        });

        return {
          idx,
          score: scoreData?.data?.total_score || 0,
          score_breakdown: scoreData?.data?.breakdown,
          feasibility_proof: feasibilityData?.data,
        };
      });

      const results = await Promise.all(scorePromises);

      if (results.every(r => r !== null)) {
        // Calculate new total score
        let newTotalScore = currentScore;
        results.forEach((r: any) => {
          newTotalScore -= (assignments[r.idx].score || 0);
          newTotalScore += r.score;
        });

        // Accept if improvement
        if (newTotalScore > currentScore) {
          results.forEach((r: any) => {
            modified[r.idx].score = r.score;
            modified[r.idx].score_breakdown = r.score_breakdown;
            modified[r.idx].feasibility_proof = r.feasibility_proof;
          });
          assignments.splice(0, assignments.length, ...modified);
          currentScore = newTotalScore;

          if (currentScore > bestTotalScore) {
            bestTotalScore = currentScore;
            bestSolution = [...assignments];
          }
        }
      }
    }

    console.log(`[roster-solve] Optimization complete after ${iterations} iterations`);

    // Phase 3: Database Persistence
    const assignmentRecords = bestSolution.map(a => ({
      plan_id,
      org_id: profile.org_id,
      lesson_id: a.lesson_id,
      student_id: a.student_id,
      instructor_id: a.instructor_id,
      aircraft_id: a.aircraft_id,
      airport_icao: a.airport_icao,
      start_at: a.start_at,
      end_at: a.end_at,
      status: 'pending_confirm',
      total_score: a.score,
      score_breakdown: a.score_breakdown,
      feasibility_proof: a.feasibility_proof,
    }));

    const { error: insertError } = await supabase
      .from('roster_assignment')
      .insert(assignmentRecords);

    if (insertError) throw insertError;

    // Update plan status
    await supabase
      .from('roster_plan')
      .update({ status: 'active' })
      .eq('id', plan_id);

    // Log to event_log
    await supabase.from('event_log').insert({
      org_id: profile.org_id,
      user_id: user.id,
      type: 'roster_optimization_complete',
      category: 'roster',
      message: `Optimized schedule: ${bestSolution.length} assignments created`,
      metadata: {
        plan_id,
        assignments_created: bestSolution.length,
        unassigned_students: unassigned_students.length,
        average_score: bestTotalScore / bestSolution.length,
        iterations,
      },
    });

    const executionTime = Date.now() - startTime;

    return new Response(JSON.stringify({
      success: true,
      plan_id,
      assignments_created: bestSolution.length,
      average_score: bestTotalScore / bestSolution.length,
      total_iterations: iterations,
      execution_time_ms: executionTime,
      unassigned_students,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[roster-solve] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
