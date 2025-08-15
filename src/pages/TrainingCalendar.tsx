import { useState } from "react"
import { Calendar, Clock, User, Plane, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SchedulerAgent } from "@/components/ai/SchedulerAgent"
import { todaysFlights, type FlightSession } from "@/data/schedule"
import { useToast } from "@/hooks/use-toast"

const initialFlights = todaysFlights;

export default function TrainingCalendar() {
  const [flights, setFlights] = useState(initialFlights);
  const { toast } = useToast();

  const handleScheduleChanges = (changes: any[]) => {
    toast({
      title: "Schedule Updated",
      description: `Applied ${changes.length} optimization changes successfully.`,
    });
    
    // In a real app, this would update the actual schedule
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
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-success/10 text-success">Completed</Badge>
      case "in-progress":
        return <Badge variant="secondary" className="bg-primary/10 text-primary">In Progress</Badge>
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>
      case "cancelled":
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Training Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and track flight training sessions
          </p>
        </div>
      </div>

      {/* Today's Schedule */}
      <Card className="aviation-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Schedule
              <Badge variant="outline" className="ml-2">
                {new Date().toLocaleDateString()}
              </Badge>
            </div>
            <SchedulerAgent onApplyChanges={handleScheduleChanges} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flights.map((flight) => (
              <div key={flight.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {flight.time}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{flight.student}</span>
                      <span className="text-sm text-muted-foreground">with {flight.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{flight.aircraft} • {flight.type}</span>
                    </div>
                    {flight.conflicts && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-destructive">{flight.conflicts.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(flight.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="aviation-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Flights Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="aviation-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">18</p>
                <p className="text-sm text-muted-foreground">Active Instructors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="aviation-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Plane className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">9</p>
                <p className="text-sm text-muted-foreground">Aircraft Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}