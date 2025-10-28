import { useState } from "react"
import { Search, Filter, GraduationCap, Calendar, Clock, BookOpen, Plane, MessageSquare, BarChart3, Bot, UserCheck, Download, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { StudentProgressDashboard } from "@/components/progress/StudentProgressDashboard"
import { StudentReadinessDashboard } from "@/components/instructor/StudentReadinessDashboard"
import { RoleGuard } from "@/components/access/RoleGuard"
import { MILESTONES_PPL, AVAILABLE_BADGES } from "@/types/progress"
import { useAuth } from "@/hooks/useAuth"
import { getUserPermissions, getRoleDisplayName } from "@/lib/roleUtils"
import { RegulatoryExportPanel } from "@/components/reports/RegulatoryExportPanel"

const pilots = [
  // Students
  {
    id: 1,
    name: "Sarah Wilson",
    avatar: "/placeholder.svg",
    type: "student",
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
    type: "student",
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
    type: "student",
    course: "Instrument Rating",
    stage: "IFR Procedures",
    progress: 67,
    hoursFlown: 89.3,
    nextLesson: "2024-01-16 10:30",
    instructor: "CFII David Brown",
    status: "active",
    aiInsights: "Excelling in instrument approaches, ready for complex weather scenarios"
  },
  // Instructors
  {
    id: 4,
    name: "Capt. James Miller",
    avatar: "/placeholder.svg",
    type: "instructor",
    course: "Flight Instructor",
    stage: "Active Instructor",
    progress: 100,
    hoursFlown: 2450.0,
    nextLesson: "2024-01-15 09:00",
    instructor: "Senior Instructor",
    status: "active",
    aiInsights: "Excellent teaching record with 95% first-time pass rate"
  },
  {
    id: 5,
    name: "FI Emma Thompson",
    avatar: "/placeholder.svg",
    type: "instructor",
    course: "Flight Instructor",
    stage: "Active Instructor",
    progress: 100,
    hoursFlown: 1850.0,
    nextLesson: "2024-01-15 14:00",
    instructor: "Check Pilot",
    status: "active",
    aiInsights: "Specialized in PPL training with strong student progress rates"
  },
  {
    id: 6,
    name: "CFII David Brown",
    avatar: "/placeholder.svg",
    type: "instructor",
    course: "Instrument Flight Instructor",
    stage: "Active CFII",
    progress: 100,
    hoursFlown: 3200.0,
    nextLesson: "2024-01-16 10:30",
    instructor: "Chief Flight Instructor",
    status: "active",
    aiInsights: "Expert in instrument training with advanced weather flying experience"
  }
]

export default function People() {
  const { profile } = useAuth()
  const [selectedPilot, setSelectedPilot] = useState(pilots[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [activeTab, setActiveTab] = useState("directory")
  // Use actual authenticated user's role for permissions
  const permissions = getUserPermissions(profile)

  // Mock student progress data
  const mockStudentProgress = {
    studentId: selectedPilot.id.toString(),
    milestones: MILESTONES_PPL.map((milestone, index) => ({
      ...milestone,
      completed: index < 2, // First 2 milestones completed
      dateCompleted: index < 2 ? "2024-08-15" : undefined
    })),
    badges: AVAILABLE_BADGES.slice(0, 3).map(badge => ({
      ...badge,
      dateEarned: "2024-08-15"
    })),
    streaks: [
      { type: "consistency" as const, currentStreak: 5, bestStreak: 8, lastActivity: "2024-08-15" },
      { type: "improvement" as const, currentStreak: 3, bestStreak: 5, lastActivity: "2024-08-14" },
    ],
    totalHours: selectedPilot.hoursFlown,
    soloHours: Math.floor(selectedPilot.hoursFlown * 0.3),
    dualHours: Math.floor(selectedPilot.hoursFlown * 0.7),
    crossCountryHours: Math.floor(selectedPilot.hoursFlown * 0.4),
    nightHours: Math.floor(selectedPilot.hoursFlown * 0.1),
    instrumentHours: Math.floor(selectedPilot.hoursFlown * 0.2),
    overallScore: selectedPilot.progress,
    readinessLevel: (selectedPilot.progress >= 80 ? "ready" : selectedPilot.progress >= 60 ? "approaching" : "not_ready") as "ready" | "approaching" | "not_ready" | "overdue",
    nextCheckride: selectedPilot.progress >= 80 ? "2024-08-25" : undefined,
    weakAreas: ["Radio communications", "Crosswind landings"],
    strongAreas: ["Landing technique", "Aircraft control", "Navigation"]
  }

  const handleGenerateDebrief = () => {
    console.log("Generating AI debrief for student:", selectedPilot.name)
  }

  const filteredPilots = pilots.filter(pilot => {
    const matchesSearch = pilot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pilot.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || pilot.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Flight Training Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Flight training personnel directory - Data synced from Maverick Training Platform
              <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">External Integration</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            {permissions.canManageStudentData && (
              <Button className="bg-primary hover:bg-primary-dark">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Notice to Captain
              </Button>
            )}
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${permissions.canViewStudentProgress ? 'grid-cols-4' : 'grid-cols-1'}`}>
            <TabsTrigger value="directory">
              {permissions.isStudent ? "Training Directory" : "Directory"}
            </TabsTrigger>
            {permissions.canViewStudentProgress && (
              <>
                <TabsTrigger value="student-progress">Student Progress</TabsTrigger>
                <TabsTrigger value="instructor-dashboard">Readiness Dashboard</TabsTrigger>
                <TabsTrigger value="reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pilots List */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search pilots..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant={filterType === "all" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilterType("all")}
                  >
                    All
                  </Button>
                  <Button 
                    variant={filterType === "student" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilterType("student")}
                  >
                    <GraduationCap className="h-4 w-4 mr-1" />
                    Students
                  </Button>
                  <Button 
                    variant={filterType === "instructor" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilterType("instructor")}
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Instructors
                  </Button>
                </div>

                <div className="space-y-3">
                  {filteredPilots.map((pilot) => (
                    <Card
                      key={pilot.id}
                      className={`cursor-pointer transition-all aviation-card hover:aviation-card-elevated ${
                        selectedPilot.id === pilot.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPilot(pilot)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={pilot.avatar} />
                            <AvatarFallback>{pilot.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground truncate">{pilot.name}</p>
                              <Badge variant={pilot.type === "instructor" ? "default" : "secondary"} className="text-xs">
                                {pilot.type === "instructor" ? "Instructor" : "Student"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{pilot.course}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`status-${pilot.status === 'active' ? 'active' : 'inactive'}`} />
                              <span className="text-xs text-muted-foreground">{pilot.stage}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{pilot.type === "instructor" ? `${pilot.hoursFlown}h` : `${pilot.progress}%`}</p>
                            {pilot.type === "student" && <Progress value={pilot.progress} className="w-16 h-1" />}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Pilot Details */}
              <div className="lg:col-span-2">
                <Card className="aviation-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedPilot.avatar} />
                          <AvatarFallback>{selectedPilot.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {selectedPilot.name}
                            <Badge variant={selectedPilot.type === "instructor" ? "default" : "secondary"}>
                              {selectedPilot.type === "instructor" ? "Instructor" : "Student"}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{selectedPilot.course} • {selectedPilot.stage}</CardDescription>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {permissions.isStudent 
                          ? "Directory view" 
                          : permissions.canManageStudentData 
                          ? "Full access" 
                          : "Read-only view"
                        }
                      </div>
                    </div>
                    
                    {showAIInsights && (
                      <div className="mt-4 p-3 bg-accent rounded-lg border border-primary/20">
                        <p className="text-sm text-accent-foreground">{selectedPilot.aiInsights}</p>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent>
                    <Tabs defaultValue="profile" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="progress">Progress</TabsTrigger>
                        <TabsTrigger value="logbook">Logbook</TabsTrigger>
                        <TabsTrigger value="flight-data">Flight Data</TabsTrigger>
                      </TabsList>

                      <TabsContent value="profile" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">{selectedPilot.type === "instructor" ? "Instructor Details" : "Training Details"}</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-muted-foreground">Course:</span> {selectedPilot.course}</p>
                              <p><span className="text-muted-foreground">Current Stage:</span> {selectedPilot.stage}</p>
                              <p><span className="text-muted-foreground">{selectedPilot.type === "instructor" ? "Specialty" : "Instructor"}:</span> {selectedPilot.instructor}</p>
                              <p><span className="text-muted-foreground">Hours Flown:</span> {selectedPilot.hoursFlown}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium">Next Session</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-muted-foreground">Date:</span> {selectedPilot.nextLesson}</p>
                              <p><span className="text-muted-foreground">Type:</span> {selectedPilot.type === "instructor" ? "Teaching" : "Dual Instruction"}</p>
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
                                  <p className="text-sm font-medium">{selectedPilot.type === "instructor" ? "Teaching Rating" : "Theory Progress"}</p>
                                  <p className="text-2xl font-bold">{selectedPilot.type === "instructor" ? "A+" : `${selectedPilot.progress - 5}%`}</p>
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
                                  <p className="text-2xl font-bold">{selectedPilot.hoursFlown}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm font-medium">{selectedPilot.type === "instructor" ? "Student Success Rate" : "Overall Progress"}</p>
                                  <p className="text-2xl font-bold">{selectedPilot.type === "instructor" ? "95%" : `${selectedPilot.progress}%`}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
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

                      <TabsContent value="flight-data" className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Captain/XB-70 Flight Data Analysis</h4>
                            <Button variant="outline" size="sm" disabled>
                              <Bot className="h-4 w-4 mr-2" />
                              Generate AI Debrief
                            </Button>
                          </div>
                          
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-sm text-muted-foreground">Flight data analysis available after integration with Captain/XB-70 system</p>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {permissions.canViewStudentProgress && (
            <TabsContent value="student-progress" className="space-y-6">
              {selectedPilot.type === "student" ? (
                <StudentProgressDashboard 
                  studentId={selectedPilot.id.toString()}
                  progress={mockStudentProgress}
                  onGenerateDebrief={handleGenerateDebrief}
                  isInstructor={permissions.isInstructor}
                />
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">
                      Please select a student to view their progress
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {permissions.canViewStudentProgress && (
            <TabsContent value="instructor-dashboard" className="space-y-6">
              <StudentReadinessDashboard instructorId={profile?.id || "1"} />
            </TabsContent>
          )}

          {permissions.canViewStudentProgress && (
            <TabsContent value="reports" className="space-y-6">
              {/* Regulatory Export */}
              <RegulatoryExportPanel />
              
              {/* Training Reports */}
              <Card className="aviation-card">
                <CardHeader>
                  <CardTitle>Training Reports</CardTitle>
                  <CardDescription>Generate and export training records and progress reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      <span className="text-sm">Student Progress</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span className="text-sm">Flight Hours</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      <span className="text-sm">Instructor Report</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-sm">Course Completion</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
    </div>
  )
}