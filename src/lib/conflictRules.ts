// AIRMAN Academy+ Conflict Detection
// Business rules for schedule validation and automatic conflict detection

import type { ScheduleEvent, Aircraft, Instructor, ConflictCheck, ConflictRule } from "@/types";

export class ConflictDetector {
  static checkScheduleEvent(
    event: ScheduleEvent,
    aircraft: Aircraft[],
    instructors: Instructor[],
    existingEvents: ScheduleEvent[]
  ): ConflictCheck[] {
    const conflicts: ConflictCheck[] = [];
    
    // Find related entities
    const eventAircraft = aircraft.find(a => a.id === event.aircraft_id);
    const eventInstructor = instructors.find(i => i.id === event.instructor_id);
    
    // Rule 1: Aircraft grounded
    if (eventAircraft?.status === "grounded") {
      conflicts.push({
        rule: "aircraft_grounded",
        violated: true,
        message: `Aircraft ${eventAircraft.registration} is grounded`,
        severity: "error"
      });
    }
    
    // Rule 2: Aircraft in maintenance
    if (eventAircraft?.status === "maintenance") {
      conflicts.push({
        rule: "aircraft_grounded",
        violated: true,
        message: `Aircraft ${eventAircraft.registration} is in maintenance`,
        severity: "error"
      });
    }
    
    // Rule 3: Maintenance due soon
    if (eventAircraft && eventAircraft.hours_to_maintenance <= 5) {
      conflicts.push({
        rule: "maintenance_due",
        violated: true,
        message: `Aircraft ${eventAircraft.registration} needs maintenance in ${eventAircraft.hours_to_maintenance}h`,
        severity: "warning"
      });
    }
    
    // Rule 4: Instructor availability
    if (eventInstructor?.availability_status === "off_duty") {
      conflicts.push({
        rule: "instructor_duty_limit",
        violated: true,
        message: `${eventInstructor.name} is off duty`,
        severity: "error"
      });
    }
    
    // Rule 5: Daylight window (simple check - before 8am or after 6pm)
    const startTime = new Date(event.start_time);
    const hour = startTime.getHours();
    if (hour < 8 || hour >= 18) {
      conflicts.push({
        rule: "daylight_window",
        violated: true,
        message: "Flight scheduled outside normal daylight hours",
        severity: "warning"
      });
    }
    
    // Rule 6: VFR minima (mock weather check)
    const isWeatherRisk = Math.random() < 0.15; // 15% chance of weather issues
    if (isWeatherRisk) {
      conflicts.push({
        rule: "vfr_minima",
        violated: true,
        message: "Weather forecast may not meet VFR minima",
        severity: "warning"
      });
    }
    
    // Rule 7: Double booking check
    const overlapping = existingEvents.filter(e => 
      e.id !== event.id &&
      (e.aircraft_id === event.aircraft_id || e.instructor_id === event.instructor_id) &&
      this.timeOverlaps(e.start_time, e.end_time, event.start_time, event.end_time)
    );
    
    if (overlapping.length > 0) {
      conflicts.push({
        rule: "aircraft_grounded", // Reusing this rule type
        violated: true,
        message: "Resource double-booked",
        severity: "error"
      });
    }
    
    return conflicts;
  }
  
  static timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = new Date(start1).getTime();
    const e1 = new Date(end1).getTime();
    const s2 = new Date(start2).getTime();
    const e2 = new Date(end2).getTime();
    
    return s1 < e2 && s2 < e1;
  }
  
  static groundAircraft(
    aircraftId: string, 
    reason: string, 
    events: ScheduleEvent[]
  ): ScheduleEvent[] {
    // Mark affected events as conflicted
    return events.map(event => {
      if (event.aircraft_id === aircraftId && event.status === "scheduled") {
        return {
          ...event,
          conflicts: [...(event.conflicts || []), `aircraft_grounded:${reason}`]
        };
      }
      return event;
    });
  }
}

// Export utility functions
export const checkAllScheduleConflicts = (
  events: ScheduleEvent[],
  aircraft: Aircraft[],
  instructors: Instructor[]
): Map<string, ConflictCheck[]> => {
  const conflicts = new Map<string, ConflictCheck[]>();
  
  events.forEach(event => {
    const eventConflicts = ConflictDetector.checkScheduleEvent(
      event, aircraft, instructors, events
    );
    if (eventConflicts.length > 0) {
      conflicts.set(event.id, eventConflicts);
    }
  });
  
  return conflicts;
};