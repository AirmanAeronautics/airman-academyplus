import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, BookOpen, Plane, Zap, Star, TrendingUp, Bot, Calendar, Clock } from "lucide-react";
import { StudentProgress, StudentMilestone, Badge as ProgressBadge } from "@/types/progress";
import { MilestoneTracker } from "./MilestoneTracker";
import { BadgeCollection } from "./BadgeCollection";
import { AIDebriefViewer } from "./AIDebriefViewer";
import { ProgressMetrics } from "./ProgressMetrics";

interface StudentProgressDashboardProps {
  studentId: string;
  progress: StudentProgress;
  onGenerateDebrief: () => void;
  isInstructor?: boolean;
}

export function StudentProgressDashboard({ 
  studentId, 
  progress, 
  onGenerateDebrief,
  isInstructor = false 
}: StudentProgressDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getReadinessColor = (level: string) => {
    switch (level) {
      case "ready": return "text-success";
      case "approaching": return "text-warning";
      case "not_ready": return "text-muted-foreground";
      case "overdue": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getReadinessText = (level: string) => {
    switch (level) {
      case "ready": return "Ready for Checkride";
      case "approaching": return "Approaching Readiness";
      case "not_ready": return "Building Foundation";
      case "overdue": return "Checkride Overdue";
      default: return "Unknown Status";
    }
  };

  const completedMilestones = progress.milestones.filter(m => m.completed).length;
  const totalMilestones = progress.milestones.length;
  const progressPercentage = (completedMilestones / totalMilestones) * 100;

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Progress</p>
                <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Plane className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Hours</p>
                <p className="text-2xl font-bold">{progress.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Milestones</p>
                <p className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className={`h-5 w-5 ${getReadinessColor(progress.readinessLevel)}`} />
              <div>
                <p className="text-sm font-medium">Readiness</p>
                <p className={`text-lg font-bold ${getReadinessColor(progress.readinessLevel)}`}>
                  {getReadinessText(progress.readinessLevel)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="debriefs">AI Debriefs</TabsTrigger>
          <TabsTrigger value="metrics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Recent Achievements</h4>
                  {progress.milestones
                    .filter(m => m.completed)
                    .slice(-3)
                    .map(milestone => (
                      <div key={milestone.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm font-medium">{milestone.name}</span>
                        <Badge variant="secondary">{milestone.dateCompleted}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Streaks & Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Gamification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {progress.streaks.map(streak => (
                    <div key={streak.type} className="text-center p-3 bg-muted rounded">
                      <p className="text-2xl font-bold text-primary">{streak.currentStreak}</p>
                      <p className="text-xs text-muted-foreground">{streak.type}</p>
                      <p className="text-xs text-muted-foreground">Best: {streak.bestStreak}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Recent Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {progress.badges.slice(-4).map(badge => (
                      <div key={badge.id} className="text-center p-2 bg-muted rounded">
                        <div className="text-lg">{badge.icon}</div>
                        <p className="text-xs font-medium">{badge.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Improvement Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-success">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {progress.strongAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-warning">Focus Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {progress.weakAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning rounded-full" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones">
          <MilestoneTracker 
            milestones={progress.milestones} 
            totalHours={progress.totalHours}
            isInstructor={isInstructor}
          />
        </TabsContent>

        <TabsContent value="badges">
          <BadgeCollection badges={progress.badges} />
        </TabsContent>

        <TabsContent value="debriefs">
          <AIDebriefViewer 
            studentId={studentId}
            onGenerateDebrief={onGenerateDebrief}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <ProgressMetrics progress={progress} />
        </TabsContent>
      </Tabs>

      {/* Quick Action Bar for Instructors */}
      {isInstructor && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Instructor Actions</h3>
                <p className="text-sm text-muted-foreground">Quick actions for student progress</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
                <Button variant="outline" size="sm" onClick={onGenerateDebrief}>
                  <Bot className="h-4 w-4 mr-2" />
                  Generate AI Debrief
                </Button>
                <Button variant="outline" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Update Progress
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}