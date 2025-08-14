import { Calendar, Clock, User, Plane } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FlightSession {
  id: string
  time: string
  student: string
  instructor: string
  aircraft: string
  type: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
}

const todaysFlights: FlightSession[] = [
  {
    id: "1",
    time: "08:00 - 10:00",
    student: "Sarah Wilson",
    instructor: "Capt. Johnson",
    aircraft: "N123AB",
    type: "Solo Flight",
    status: "completed"
  },
  {
    id: "2", 
    time: "10:30 - 12:30",
    student: "Mike Chen",
    instructor: "Capt. Smith",
    aircraft: "N789EF",
    type: "Navigation Training",
    status: "in-progress"
  },
  {
    id: "3",
    time: "14:00 - 16:00", 
    student: "Emma Davis",
    instructor: "Capt. Wilson",
    aircraft: "N123AB",
    type: "Instrument Training",
    status: "scheduled"
  },
  {
    id: "4",
    time: "16:30 - 18:30",
    student: "John Smith",
    instructor: "Capt. Johnson", 
    aircraft: "N456CD",
    type: "Cross Country",
    status: "cancelled"
  }
]

export default function TrainingCalendar() {
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
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today's Schedule
            <Badge variant="outline" className="ml-2">
              {new Date().toLocaleDateString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todaysFlights.map((flight) => (
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