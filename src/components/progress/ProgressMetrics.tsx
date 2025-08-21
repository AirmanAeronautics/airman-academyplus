import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Target, Clock, Plane, BookOpen } from "lucide-react";
import { StudentProgress } from "@/types/progress";

interface ProgressMetricsProps {
  progress: StudentProgress;
}

export function ProgressMetrics({ progress }: ProgressMetricsProps) {
  // Calculate hourly breakdown percentages
  const totalHours = progress.totalHours;
  const soloPercentage = totalHours > 0 ? (progress.soloHours / totalHours) * 100 : 0;
  const dualPercentage = totalHours > 0 ? (progress.dualHours / totalHours) * 100 : 0;
  const crossCountryPercentage = totalHours > 0 ? (progress.crossCountryHours / totalHours) * 100 : 0;
  const nightPercentage = totalHours > 0 ? (progress.nightHours / totalHours) * 100 : 0;
  const instrumentPercentage = totalHours > 0 ? (progress.instrumentHours / totalHours) * 100 : 0;

  // Mock performance trends data
  const performanceTrends = [
    { session: "Session 1", score: 65, date: "2024-08-01" },
    { session: "Session 2", score: 72, date: "2024-08-05" },
    { session: "Session 3", score: 78, date: "2024-08-10" },
    { session: "Session 4", score: 85, date: "2024-08-15" },
    { session: "Session 5", score: 88, date: "2024-08-20" },
  ];

  const latestScore = performanceTrends[performanceTrends.length - 1]?.score || 0;
  const previousScore = performanceTrends[performanceTrends.length - 2]?.score || 0;
  const improvement = latestScore - previousScore;

  // Mock maneuver performance data
  const maneuverPerformance = [
    { name: "Takeoffs", score: 85, sessions: 12, improvement: 8 },
    { name: "Landings", score: 92, sessions: 15, improvement: 12 },
    { name: "Navigation", score: 78, sessions: 8, improvement: -2 },
    { name: "Radio Work", score: 70, sessions: 10, improvement: 5 },
    { name: "Emergency Procedures", score: 88, sessions: 6, improvement: 15 },
    { name: "Traffic Pattern", score: 82, sessions: 14, improvement: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* Flight Hours Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Flight Hours Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{progress.totalHours}</p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-light">{progress.dualHours}</p>
              <p className="text-sm text-muted-foreground">Dual ({Math.round(dualPercentage)}%)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-foreground">{progress.soloHours}</p>
              <p className="text-sm text-muted-foreground">Solo ({Math.round(soloPercentage)}%)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{progress.crossCountryHours}</p>
              <p className="text-sm text-muted-foreground">Cross Country</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-dark">{progress.nightHours}</p>
              <p className="text-sm text-muted-foreground">Night</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Dual Instruction</span>
                <span>{progress.dualHours}h ({Math.round(dualPercentage)}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full progress-cross-country rounded-full transition-all duration-300" 
                  style={{ width: `${dualPercentage}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Solo Flight</span>
                <span>{progress.soloHours}h ({Math.round(soloPercentage)}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full progress-solo rounded-full transition-all duration-300" 
                  style={{ width: `${soloPercentage}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Cross Country</span>
                <span>{progress.crossCountryHours}h ({Math.round(crossCountryPercentage)}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full progress-cross-country rounded-full transition-all duration-300" 
                  style={{ width: `${crossCountryPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-skybg to-skyblue rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-navy-blue">{latestScore}%</p>
              <p className="text-sm text-navy-blue/70">Latest Score</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-skybg to-skyblue rounded-lg shadow-sm">
              <p className={`text-2xl font-bold ${improvement >= 0 ? 'text-success' : 'text-destructive'}`}>
                {improvement >= 0 ? '+' : ''}{improvement}%
              </p>
              <p className="text-sm text-navy-blue/70">Recent Change</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-skybg to-skyblue rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-navy-blue">{progress.overallScore}%</p>
              <p className="text-sm text-navy-blue/70">Overall Average</p>
            </div>
          </div>

          {/* Session History */}
          <div className="space-y-2">
            <h4 className="font-medium">Recent Sessions</h4>
            {performanceTrends.slice(-5).map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <p className="font-medium">{session.session}</p>
                  <p className="text-sm text-muted-foreground">{session.date}</p>
                </div>
                <Badge variant={session.score >= 80 ? "default" : session.score >= 60 ? "secondary" : "destructive"}>
                  {session.score}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maneuver Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Maneuver Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maneuverPerformance.map((maneuver, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{maneuver.name}</p>
                    <p className="text-sm text-muted-foreground">{maneuver.sessions} sessions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{maneuver.score}%</p>
                    <p className={`text-sm ${maneuver.improvement >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {maneuver.improvement >= 0 ? '+' : ''}{maneuver.improvement}%
                    </p>
                  </div>
                </div>
                <Progress value={maneuver.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streak Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Engagement Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {progress.streaks.map((streak, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{streak.currentStreak}</p>
                <p className="text-sm font-medium capitalize">{streak.type.replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">Best: {streak.bestStreak}</p>
                <p className="text-xs text-muted-foreground">Last: {streak.lastActivity}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Readiness Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Checkride Readiness Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-success mb-3">Ready Areas</h4>
              <div className="space-y-2">
                {progress.strongAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-warning mb-3">Needs Work</h4>
              <div className="space-y-2">
                {progress.weakAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-warning rounded-full" />
                    <span className="text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Overall Readiness</h4>
              <Badge variant={
                progress.readinessLevel === "ready" ? "default" :
                progress.readinessLevel === "approaching" ? "secondary" : "outline"
              }>
                {progress.readinessLevel.replace('_', ' ')}
              </Badge>
            </div>
            
            {progress.nextCheckride && (
              <p className="text-sm text-muted-foreground">
                Estimated checkride date: {progress.nextCheckride}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}