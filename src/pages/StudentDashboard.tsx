import { useAuthBackend } from "@/hooks/useAuthBackend";
import { StudentProgressDashboard } from "@/components/progress/StudentProgressDashboard";
import { RoleGuard } from "@/components/access/RoleGuard";
import { MILESTONES_PPL, AVAILABLE_BADGES } from "@/types/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, BookOpen, Clock } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuthBackend();

  // Mock student progress data for the current user
  const mockStudentProgress = {
    studentId: user?.id || "current-student",
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
    totalHours: 45.5,
    soloHours: 12.3,
    dualHours: 33.2,
    crossCountryHours: 8.5,
    nightHours: 2.1,
    instrumentHours: 0,
    overallScore: 78,
    readinessLevel: "approaching" as const,
    nextCheckride: undefined,
    weakAreas: ["Radio communications", "Crosswind landings"],
    strongAreas: ["Landing technique", "Aircraft control", "Navigation"]
  };

  const handleGenerateDebrief = () => {
    console.log("Generating AI debrief for current student");
  };

  return (
    <RoleGuard allowedRoles={["student"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Progress</h1>
            <p className="text-muted-foreground mt-1">Track your flight training journey and achievements</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStudentProgress.overallScore}%</div>
              <p className="text-xs text-muted-foreground">Overall completion</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flight Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStudentProgress.totalHours}h</div>
              <p className="text-xs text-muted-foreground">Total logged</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Solo XC</div>
              <p className="text-xs text-muted-foreground">Cross-country flight</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Dashboard */}
        <StudentProgressDashboard 
          studentId={mockStudentProgress.studentId}
          progress={mockStudentProgress}
          onGenerateDebrief={handleGenerateDebrief}
          isInstructor={false}
        />
      </div>
    </RoleGuard>
  );
}