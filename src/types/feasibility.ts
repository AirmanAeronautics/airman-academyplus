// Feasibility Check Types
export interface FeasibilityRequest {
  student_id: string;
  instructor_id: string | null;
  aircraft_id: string | null;
  lesson_id: string | null;
  airport_icao: string;
  start_at: string;
  end_at: string;
}

export interface ConstraintResult {
  constraint_type: 
    | 'availability'
    | 'qualifications'
    | 'aircraft_capabilities'
    | 'airport_performance'
    | 'weather_minima'
    | 'duty_rules'
    | 'student_prerequisites';
  passed: boolean;
  blocking: boolean;
  message: string;
  details?: any;
}

export interface FeasibilityReport {
  feasible: boolean;
  constraints: ConstraintResult[];
  blocking_issues: string[];
  warnings: string[];
}
