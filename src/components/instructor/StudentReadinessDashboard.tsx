import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { UserCheck, Search, Calendar, TrendingUp, AlertTriangle, Trophy, Bot, Target } from "lucide-react";
import { StudentProgress } from "@/types/progress";

interface StudentReadinessData {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: StudentProgress;
  nextSession?: string;
  avatar?: string;
}

interface StudentReadinessDashboardProps {
  instructorId: string;
}

export function StudentReadinessDashboard({ instructorId }: StudentReadinessDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock student data - in real app this would come from props or API
  const mockStudents: StudentReadinessData[] = [
    {
      id: "1",
      name: "Alex Johnson",
      email: "a.johnson@student.airman.academy",
      course: "PPL",
      nextSession: "2024-08-20 10:00",
      progress: {
        studentId: "1",
        milestones: [],
        badges: [],
        streaks: [
          { type: "consistency", currentStreak: 5, bestStreak: 8, lastActivity: "2024-08-15" }
        ],
        totalHours: 35,
        soloHours: 8,
        dualHours: 27,
        crossCountryHours: 12,
        nightHours: 3,
        instrumentHours: 0,
        overallScore: 85,
        readinessLevel: "ready",
        nextCheckride: "2024-08-25",
        weakAreas: ["Radio communications"],
        strongAreas: ["Landing technique", "Aircraft control", "Navigation"]
      }
    },
    {
      id: "2",
      name: "Emma Thompson",
      email: "e.thompson@student.airman.academy",
      course: "PPL",
      nextSession: "2024-08-21 14:00",
      progress: {
        studentId: "2",
        milestones: [],
        badges: [],
        streaks: [
          { type: "consistency", currentStreak: 3, bestStreak: 5, lastActivity: "2024-08-14" }
        ],
        totalHours: 12,
        soloHours: 0,
        dualHours: 12,
        crossCountryHours: 0,
        nightHours: 0,
        instrumentHours: 0,
        overallScore: 72,
        readinessLevel: "approaching",
        weakAreas: ["Crosswind landings", "Pattern spacing"],
        strongAreas: ["Basic aircraft control", "Following instructions"]
      }
    },
    {
      id: "3",
      name: "Robert Chen",
      email: "r.chen@student.airman.academy",
      course: "CPL",
      nextSession: "2024-08-22 09:00",
      progress: {
        studentId: "3",
        milestones: [],
        badges: [],
        streaks: [
          { type: "consistency", currentStreak: 12, bestStreak: 15, lastActivity: "2024-08-16" }
        ],
        totalHours: 95,
        soloHours: 35,
        dualHours: 60,
        crossCountryHours: 45,
        nightHours: 12,
        instrumentHours: 25,
        overallScore: 90,
        readinessLevel: "ready",
        nextCheckride: "2024-08-30",
        weakAreas: ["Complex aircraft systems"],
        strongAreas: ["Flight planning", "Weather assessment", "Emergency procedures"]
      }
    }
  ];

  const getReadinessColor = (level: string) => {
    switch (level) {
      case "ready": return "text-success";
      case "approaching": return "text-warning";
      case "not_ready": return "text-muted-foreground";
      case "overdue": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getReadinessIcon = (level: string) => {
    switch (level) {
      case "ready": return <Trophy className="h-4 w-4 text-success" />;
      case "approaching": return <TrendingUp className="h-4 w-4 text-warning" />;
      case "not_ready": return <Target className="h-4 w-4 text-muted-foreground" />;
      case "overdue": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || 
      selectedFilter === student.progress.readinessLevel;
    
    return matchesSearch && matchesFilter;
  });

  const readyStudents = mockStudents.filter(s => s.progress.readinessLevel === "ready").length;
  const approachingStudents = mockStudents.filter(s => s.progress.readinessLevel === "approaching").length;
  const notReadyStudents = mockStudents.filter(s => s.progress.readinessLevel === "not_ready").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Readiness Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your students' progress toward checkride readiness</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold">{mockStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Checkride Ready</p>
                <p className="text-2xl font-bold text-success">{readyStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium">Approaching</p>
                <p className="text-2xl font-bold text-warning">{approachingStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Building Skills</p>
                <p className="text-2xl font-bold">{notReadyStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
          >
            All
          </Button>
          <Button
            variant={selectedFilter === "ready" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("ready")}
          >
            Ready
          </Button>
          <Button
            variant={selectedFilter === "approaching" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("approaching")}
          >
            Approaching
          </Button>
          <Button
            variant={selectedFilter === "not_ready" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("not_ready")}
          >
            Building
          </Button>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{student.course}</p>
                  </div>
                </div>
                {getReadinessIcon(student.progress.readinessLevel)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress Overview */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{student.progress.overallScore}%</span>
                </div>
                <Progress value={student.progress.overallScore} className="h-2" />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Hours</p>
                  <p className="font-medium">{student.progress.totalHours}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Solo Hours</p>
                  <p className="font-medium">{student.progress.soloHours}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Streak</p>
                  <p className="font-medium">{student.progress.streaks[0]?.currentStreak || 0} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Readiness</p>
                  <p className={`font-medium ${getReadinessColor(student.progress.readinessLevel)}`}>
                    {student.progress.readinessLevel.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-success">Strengths</p>
                  <p className="text-xs text-muted-foreground">
                    {student.progress.strongAreas.slice(0, 2).join(", ")}
                    {student.progress.strongAreas.length > 2 && "..."}
                  </p>
                </div>
                
                {student.progress.weakAreas.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-warning">Focus Areas</p>
                    <p className="text-xs text-muted-foreground">
                      {student.progress.weakAreas.slice(0, 2).join(", ")}
                      {student.progress.weakAreas.length > 2 && "..."}
                    </p>
                  </div>
                )}
              </div>

              {/* Next Session */}
              {student.nextSession && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next:</span>
                  <span>{student.nextSession}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Progress
                </Button>
                <Button variant="outline" size="sm">
                  <Bot className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Students Found</h3>
            <p className="text-sm text-muted-foreground">
              No students match your current search and filter criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}