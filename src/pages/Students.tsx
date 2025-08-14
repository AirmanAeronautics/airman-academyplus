import { useState } from "react"
import { Search, Filter, GraduationCap, Calendar, Clock, BookOpen, Plane, MessageSquare, BarChart3, Bot } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

const students = [
  {
    id: 1,
    name: "Sarah Wilson",
    avatar: "/placeholder.svg",
    course: "Commercial Pilot License",
    stage: "Cross Country Phase",
    progress: 78,
    hoursFlown: 142.5,
    nextLesson: "2024-01-15 09:00",
    instructor: "Capt. James Miller",
    status: "active",
    aiInsights: "Ready for CPL checkride - recommend scheduling within 2 weeks"
  },
  {
    id: 2,
    name: "Marcus Chen",
    avatar: "/placeholder.svg",
    course: "Private Pilot License",
    stage: "Solo Phase",
    progress: 45,
    hoursFlown: 32.1,
    nextLesson: "2024-01-15 14:00",
    instructor: "FI Emma Thompson",
    status: "active",
    aiInsights: "Strong progress in navigation, consider advanced cross-country planning"
  },
  {
    id: 3,
    name: "Lisa Rodriguez",
    avatar: "/placeholder.svg",
    course: "Instrument Rating",
    stage: "IFR Procedures",
    progress: 67,
    hoursFlown: 89.3,
    nextLesson: "2024-01-16 10:30",
    instructor: "CFII David Brown",
    status: "active",
    aiInsights: "Excelling in instrument approaches, ready for complex weather scenarios"
  }
]

export default function Students() {
  const [selectedStudent, setSelectedStudent] = useState(students[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAIInsights, setShowAIInsights] = useState(false)

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">Manage student profiles and track training progress</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark">
          <GraduationCap className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                className={`cursor-pointer transition-all aviation-card hover:aviation-card-elevated ${
                  selectedStudent.id === student.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedStudent(student)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{student.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{student.course}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`status-${student.status === 'active' ? 'active' : 'inactive'}`} />
                        <span className="text-xs text-muted-foreground">{student.stage}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{student.progress}%</p>
                      <Progress value={student.progress} className="w-16 h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Student Details */}
        <div className="lg:col-span-2">
          <Card className="aviation-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedStudent.avatar} />
                    <AvatarFallback>{selectedStudent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedStudent.name}</CardTitle>
                    <CardDescription>{selectedStudent.course} • {selectedStudent.stage}</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  className={showAIInsights ? 'bg-primary text-primary-foreground' : ''}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  AI Insights
                </Button>
              </div>
              
              {showAIInsights && (
                <div className="mt-4 p-3 bg-accent rounded-lg border border-primary/20">
                  <p className="text-sm text-accent-foreground">{selectedStudent.aiInsights}</p>
                </div>
              )}
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="logbook">Logbook</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="flight-data">Flight Data</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Training Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Course:</span> {selectedStudent.course}</p>
                        <p><span className="text-muted-foreground">Current Stage:</span> {selectedStudent.stage}</p>
                        <p><span className="text-muted-foreground">Instructor:</span> {selectedStudent.instructor}</p>
                        <p><span className="text-muted-foreground">Hours Flown:</span> {selectedStudent.hoursFlown}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Next Session</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Date:</span> {selectedStudent.nextLesson}</p>
                        <p><span className="text-muted-foreground">Type:</span> Dual Instruction</p>
                        <p><span className="text-muted-foreground">Aircraft:</span> C172 G-ABCD</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="progress" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Theory Progress</p>
                            <p className="text-2xl font-bold">{selectedStudent.progress - 5}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Plane className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Flight Hours</p>
                            <p className="text-2xl font-bold">{selectedStudent.hoursFlown}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Overall Progress</p>
                            <p className="text-2xl font-bold">{selectedStudent.progress}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Training Milestones</h4>
                    <div className="space-y-2">
                      {[
                        { name: "First Solo", completed: true, date: "2023-10-15" },
                        { name: "Cross Country Solo", completed: true, date: "2023-11-20" },
                        { name: "Night Rating", completed: false, estimated: "2024-01-25" },
                        { name: "Skills Test", completed: false, estimated: "2024-02-10" }
                      ].map((milestone, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={milestone.completed ? 'status-active' : 'status-warning'} />
                            <span className="font-medium">{milestone.name}</span>
                          </div>
                          <Badge variant={milestone.completed ? "default" : "secondary"}>
                            {milestone.completed ? milestone.date : `Est. ${milestone.estimated}`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logbook" className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Flights</h4>
                    <div className="space-y-2">
                      {[
                        { date: "2024-01-12", aircraft: "C172 G-ABCD", duration: 1.5, type: "Dual", details: "Navigation exercise" },
                        { date: "2024-01-10", aircraft: "C172 G-EFGH", duration: 1.2, type: "Solo", details: "Local area familiarization" },
                        { date: "2024-01-08", aircraft: "C172 G-ABCD", duration: 2.0, type: "Dual", details: "Cross country planning" }
                      ].map((flight, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{flight.date}</p>
                            <p className="text-sm text-muted-foreground">{flight.aircraft} • {flight.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{flight.duration}h</p>
                            <p className="text-sm text-muted-foreground">{flight.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-success" />
                          <div>
                            <p className="text-sm font-medium">Attendance Rate</p>
                            <p className="text-2xl font-bold">94%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-warning" />
                          <div>
                            <p className="text-sm font-medium">Missed Sessions</p>
                            <p className="text-2xl font-bold">3</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="flight-data" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Captain/XB-70 Flight Data Analysis</h4>
                      <Button variant="outline" size="sm">
                        <Bot className="h-4 w-4 mr-2" />
                        Generate AI Debrief
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h5 className="font-medium mb-2">Latest Flight Performance</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Landing Quality:</span>
                              <Badge className="bg-success text-success-foreground">Excellent</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Speed Control:</span>
                              <Badge className="bg-success text-success-foreground">Good</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Navigation:</span>
                              <Badge className="bg-warning text-warning-foreground">Fair</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h5 className="font-medium mb-2">Areas for Improvement</h5>
                          <div className="space-y-1 text-sm">
                            <p>• Radio communication timing</p>
                            <p>• Crosswind landing technique</p>
                            <p>• Navigation checkpoint accuracy</p>
                          </div>
                        </CardContent>
                      </Card>
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