import { useState } from "react"
import { Plane, Wrench, AlertTriangle, Clock, Calendar, Bot, Plus, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const aircraft = [
  {
    id: 1,
    registration: "G-ABCD",
    type: "Cessna 172",
    status: "operational",
    hoursFlown: 4850.2,
    nextMaintenance: "100hr",
    maintenanceHours: 4900,
    hoursToMaintenance: 49.8,
    location: "Apron A3",
    lastFlight: "2024-01-14 16:30",
    aiRecommendation: "Schedule 100hr inspection for next week. Consider consolidating with annual."
  },
  {
    id: 2,
    registration: "G-EFGH",
    type: "Cessna 172",
    status: "maintenance",
    hoursFlown: 3256.7,
    nextMaintenance: "50hr",
    maintenanceHours: 3300,
    hoursToMaintenance: 43.3,
    location: "Hangar B",
    lastFlight: "2024-01-13 14:15",
    aiRecommendation: "Oil change and tire inspection in progress. Ready for service tomorrow."
  },
  {
    id: 3,
    registration: "G-IJKL",
    type: "Piper Cherokee",
    status: "operational",
    hoursFlown: 6234.1,
    nextMaintenance: "Annual",
    maintenanceHours: 6500,
    hoursToMaintenance: 265.9,
    location: "Apron B1",
    lastFlight: "2024-01-14 11:20",
    aiRecommendation: "Performance trending well. Annual inspection not due for 3 months."
  },
  {
    id: 4,
    registration: "G-MNOP",
    type: "Cessna 152",
    status: "grounded",
    hoursFlown: 7821.5,
    nextMaintenance: "AOG",
    maintenanceHours: 0,
    hoursToMaintenance: 0,
    location: "Hangar C",
    lastFlight: "2024-01-10 09:45",
    aiRecommendation: "Engine issue requires immediate attention. Parts ordered, ETA 3 days."
  }
]

const defects = [
  {
    id: 1,
    aircraft: "G-ABCD",
    description: "Nav light flickering intermittently",
    priority: "low",
    reportedBy: "CFI J. Miller",
    reportedDate: "2024-01-14",
    status: "open"
  },
  {
    id: 2,
    aircraft: "G-EFGH",
    description: "Radio volume control sticky",
    priority: "medium",
    reportedBy: "Student M. Chen",
    reportedDate: "2024-01-13",
    status: "in-progress"
  },
  {
    id: 3,
    aircraft: "G-MNOP",
    description: "Engine rough running at cruise power",
    priority: "high",
    reportedBy: "CFI D. Brown",
    reportedDate: "2024-01-10",
    status: "grounded"
  }
]

export default function Fleet() {
  const [selectedAircraft, setSelectedAircraft] = useState(aircraft[0])
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'default'
      case 'maintenance': return 'outline'
      case 'grounded': return 'destructive'
      default: return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'outline'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getMaintenanceProgress = (current: number, next: number) => {
    return Math.max(0, Math.min(100, ((next - current) / next) * 100))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fleet & Maintenance</h1>
          <p className="text-muted-foreground mt-1">Monitor aircraft status and maintenance schedules</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={showAIPanel ? 'bg-primary text-primary-foreground' : ''}
          >
            <Bot className="h-4 w-4 mr-2" />
            AI Maintenance Planner
          </Button>
          <Button className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />
            Add Aircraft
          </Button>
        </div>
      </div>

      {/* AI Panel */}
      {showAIPanel && (
        <Card className="aviation-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Maintenance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm font-medium text-accent-foreground">Weekly Optimization Suggestion</p>
              <p className="text-sm text-muted-foreground mt-1">
                Schedule G-ABCD and G-EFGH maintenance together next week to reduce downtime. 
                Parts for both aircraft can be ordered in bulk for 15% cost savings.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-primary hover:bg-primary-dark">Apply Suggestion</Button>
              <Button size="sm" variant="outline">Show Details</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aircraft List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search aircraft..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {aircraft.filter(a => 
              a.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.type.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((plane) => (
              <Card
                key={plane.id}
                className={`cursor-pointer transition-all aviation-card hover:aviation-card-elevated ${
                  selectedAircraft.id === plane.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedAircraft(plane)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Plane className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{plane.registration}</p>
                        <p className="text-sm text-muted-foreground">{plane.type}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(plane.status)} className="capitalize">
                      {plane.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hours Flown:</span>
                      <span className="font-medium">{plane.hoursFlown}h</span>
                    </div>
                    
                    {plane.status !== 'grounded' && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Next Maintenance:</span>
                          <span className="font-medium">{plane.hoursToMaintenance}h</span>
                        </div>
                        <Progress 
                          value={100 - getMaintenanceProgress(plane.hoursFlown, plane.maintenanceHours)} 
                          className="h-2" 
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Aircraft Details */}
        <div className="lg:col-span-2">
          <Card className="aviation-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Plane className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>{selectedAircraft.registration}</CardTitle>
                    <CardDescription>{selectedAircraft.type} • {selectedAircraft.location}</CardDescription>
                  </div>
                </div>
                <Badge variant={getStatusColor(selectedAircraft.status)} className="capitalize">
                  {selectedAircraft.status}
                </Badge>
              </div>

              <div className="mt-4 p-3 bg-accent rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-accent-foreground">AI Recommendation</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedAircraft.aiRecommendation}</p>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  <TabsTrigger value="defects">Defects</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Total Hours</p>
                            <p className="text-2xl font-bold">{selectedAircraft.hoursFlown}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Wrench className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Hours to Maintenance</p>
                            <p className="text-2xl font-bold">{selectedAircraft.hoursToMaintenance}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">Last Flight</p>
                          <p className="text-sm text-muted-foreground">{selectedAircraft.lastFlight}</p>
                        </div>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">Pre-flight Check</p>
                          <p className="text-sm text-muted-foreground">Today 08:00</p>
                        </div>
                        <Badge variant="default" className="bg-success text-success-foreground">Passed</Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Maintenance Schedule</h4>
                      <Button variant="outline" size="sm">
                        <Bot className="h-4 w-4 mr-2" />
                        Optimize Schedule
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        { type: "50hr Check", due: 3250, current: selectedAircraft.hoursFlown, status: "overdue" },
                        { type: "100hr Check", due: selectedAircraft.maintenanceHours, current: selectedAircraft.hoursFlown, status: "due" },
                        { type: "Annual", due: 6500, current: selectedAircraft.hoursFlown, status: "upcoming" }
                      ].map((check, idx) => {
                        const hoursRemaining = check.due - check.current
                        const isOverdue = hoursRemaining < 0
                        const isDue = hoursRemaining < 50 && hoursRemaining > 0
                        
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`status-${isOverdue ? 'inactive' : isDue ? 'warning' : 'active'}`} />
                              <span className="font-medium">{check.type}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {isOverdue ? `${Math.abs(hoursRemaining).toFixed(1)}h overdue` : `${hoursRemaining.toFixed(1)}h remaining`}
                              </p>
                              <p className="text-sm text-muted-foreground">Due at {check.due}h</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="defects" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Open Defects</h4>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Report Defect
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {defects.filter(d => d.aircraft === selectedAircraft.registration).map((defect) => (
                        <div key={defect.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium">{defect.description}</p>
                            <Badge variant={getPriorityColor(defect.priority)} className="capitalize">
                              {defect.priority}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Reported by {defect.reportedBy}</span>
                            <span>{defect.reportedDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Upcoming Flights</h4>
                    <div className="space-y-2">
                      {[
                        { time: "09:00-10:30", student: "Sarah Wilson", instructor: "CFI Miller", type: "Dual" },
                        { time: "11:00-12:00", student: "Marcus Chen", instructor: "CFI Thompson", type: "Solo" },
                        { time: "14:30-16:00", student: "Lisa Rodriguez", instructor: "CFII Brown", type: "IFR" }
                      ].map((flight, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{flight.time}</p>
                            <p className="text-sm text-muted-foreground">{flight.student} • {flight.instructor}</p>
                          </div>
                          <Badge variant="secondary">{flight.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}