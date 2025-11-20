import { useState, useEffect, useMemo } from "react"
import { FlightCalendar } from "@/components/calendar/FlightCalendar"
import { NotificationManager } from "@/components/NotificationManager"
import { todaysFlights, type FlightSession } from "@/data/schedule"
import { useToast } from "@/hooks/use-toast"
import { eventBus } from "@/lib/eventBus"
import { useAuthBackend } from "@/hooks/useAuthBackend"
import { useAuth } from "@/hooks/useAuth"
import { fetchMasterRoster, fetchMyRoster, type RosterEntry } from "@/lib/api/roster"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns"

// Helper to convert RosterEntry to FlightSession
function rosterEntryToFlightSession(entry: RosterEntry): FlightSession {
  return {
    id: entry.id,
    time: `${entry.startTime} - ${entry.endTime}`,
    timeStart: entry.startTime,
    timeEnd: entry.endTime,
    student: entry.studentName || entry.studentId || 'Unknown',
    instructor: entry.instructorName || entry.instructorId,
    aircraft: entry.aircraftRegistration || entry.aircraftId || 'N/A',
    type: entry.type === 'FLIGHT' ? 'Flight' : entry.type === 'SIM' ? 'Simulator' : 'Ground',
    status: entry.status === 'SCHEDULED' ? 'scheduled' : 
            entry.status === 'COMPLETED' ? 'completed' :
            entry.status === 'CANCELLED' ? 'cancelled' : 'in-progress',
    location: entry.lessonCode || undefined,
    notes: entry.notes,
    conflicts: entry.status === 'CANCELLED' ? ['Cancelled'] : undefined,
  }
}

export default function TrainingCalendar() {
  const [flights, setFlights] = useState<FlightSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast()
  const { user: backendUser } = useAuthBackend()
  const { user } = useAuth()
  
  // Use new auth user if available, fallback to backend user
  const currentUser = user || backendUser;
  
  // Get institute ID - assume it's on user or use a default
  const instituteId = (currentUser as any)?.instituteId || (currentUser as any)?.tenantId || 'default';
  
  // Determine if user is admin/ops (can see master roster) or instructor/student (see own roster)
  const isAdminOrOps = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'OPS_MANAGER';
  const isInstructor = currentUser?.role === 'INSTRUCTOR';
  const isStudent = currentUser?.role === 'STUDENT';

  // Calculate date range based on selected date and view (default to week view)
  const dateRange = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    return {
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
    };
  }, [selectedDate]);

  // Fetch roster data
  useEffect(() => {
    const loadRoster = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let response;
        
        if (isAdminOrOps) {
          // Fetch master roster for admins/ops
          response = await fetchMasterRoster({
            instituteId,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
        } else if (isInstructor || isStudent) {
          // Fetch user's own roster
          response = await fetchMyRoster({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
        } else {
          // Fallback to empty
          setFlights([]);
          setIsLoading(false);
          return;
        }

        // Convert roster entries to flight sessions
        const flightSessions = response.data.entries.map(rosterEntryToFlightSession);
        setFlights(flightSessions);
      } catch (err: any) {
        console.error('Failed to load roster:', err);
        setError(err.message || 'Failed to load roster data');
        toast({
          title: "Error Loading Roster",
          description: err.message || 'Failed to load roster data',
          variant: "destructive",
        });
        // Fallback to empty array on error
        setFlights([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoster();
  }, [currentUser, instituteId, dateRange.startDate, dateRange.endDate, isAdminOrOps, isInstructor, isStudent, toast]);

  // Set up event bus notifications
  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event) => {
      if (event.type === 'flight_rescheduled' || event.type === 'ai_schedule_optimization') {
        // For now, we'll just log the events. In a real app, you might want to trigger notifications
        console.log('Schedule event:', event)
      }
    })

    return unsubscribe
  }, [])

  const handleScheduleChanges = (changes: any[]) => {
    toast({
      title: "Schedule Updated",
      description: `Applied ${changes.length} optimization changes successfully.`,
    });
    
    // Update the actual schedule
    setTimeout(() => {
      setFlights(prev => prev.map(flight => {
        const change = changes.find(c => c.student === flight.student);
        if (change) {
          return {
            ...flight,
            aircraft: change.newAircraft || flight.aircraft,
            instructor: change.newInstructor || flight.instructor,
            time: change.newSlot || flight.time,
            status: "scheduled" as const
          };
        }
        return flight;
      }));
    }, 500);

    // Log the changes to event bus
    eventBus.push('schedule_bulk_update', {
      changesApplied: changes.length,
      affectedFlights: changes.map(c => c.student)
    }, currentUser?.id, currentUser?.role)
  };

  // Refresh roster data
  const refreshRoster = () => {
    // Trigger re-fetch by updating a dependency
    setSelectedDate(new Date(selectedDate));
  };

  return (
    <div className="space-y-6">
      <NotificationManager />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crew Roster & Schedule</h1>
          <p className="text-muted-foreground mt-1">
            AI-driven dynamic scheduling with real-time weather, NOTAMs, and resource optimization
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-sm text-muted-foreground">Loading roster data...</span>
          </div>
        </div>
      ) : (
        /* Flight Calendar */
        <FlightCalendar 
          flights={flights}
          onFlightsChange={setFlights}
          onScheduleOptimize={handleScheduleChanges}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onRefresh={refreshRoster}
          isLoading={isLoading}
          instituteId={instituteId}
          isAdminOrOps={isAdminOrOps}
        />
      )}
    </div>
  )
}