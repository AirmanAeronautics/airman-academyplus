import { useState, useEffect } from "react"
import { FlightCalendar } from "@/components/calendar/FlightCalendar"
import { NotificationManager } from "@/components/NotificationManager"
import { todaysFlights, type FlightSession } from "@/data/schedule"
import { useToast } from "@/hooks/use-toast"
import { eventBus } from "@/lib/eventBus"
import { useAuth } from "@/hooks/useAuth"

const initialFlights = todaysFlights;

export default function TrainingCalendar() {
  const [flights, setFlights] = useState(initialFlights);
  const { toast } = useToast()
  const { user, profile } = useAuth()

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
    }, user?.id, profile?.role)
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

      {/* Flight Calendar */}
      <FlightCalendar 
        flights={flights}
        onFlightsChange={setFlights}
        onScheduleOptimize={handleScheduleChanges}
      />
    </div>
  )
}