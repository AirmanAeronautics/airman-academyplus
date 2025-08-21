import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Clock, Target, Trophy, BookOpen } from "lucide-react";
import { StudentMilestone } from "@/types/progress";

interface MilestoneTrackerProps {
  milestones: StudentMilestone[];
  totalHours: number;
  isInstructor?: boolean;
}

export function MilestoneTracker({ milestones, totalHours, isInstructor = false }: MilestoneTrackerProps) {
  const getMilestoneIcon = (category: string, completed: boolean) => {
    const iconClass = completed ? "text-white" : "text-white/70";
    
    switch (category) {
      case "solo":
        return completed ? <CheckCircle className={`h-5 w-5 ${iconClass}`} /> : <Circle className={`h-5 w-5 ${iconClass}`} />;
      case "cross_country":
        return <Target className={`h-5 w-5 ${iconClass}`} />;
      case "night":
        return <Clock className={`h-5 w-5 ${iconClass}`} />;
      case "instrument":
        return <BookOpen className={`h-5 w-5 ${iconClass}`} />;
      case "checkride":
        return <Trophy className={`h-5 w-5 ${iconClass}`} />;
      default:
        return <Circle className={`h-5 w-5 ${iconClass}`} />;
    }
  };

  const getMilestoneProgress = (milestone: StudentMilestone) => {
    if (milestone.completed) return 100;
    if (totalHours >= milestone.hoursRequired) return 100;
    return (totalHours / milestone.hoursRequired) * 100;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "solo": return "bg-sega-blue";
      case "cross_country": return "bg-sega-blue";
      case "night": return "bg-sega-blue";
      case "instrument": return "bg-sega-blue";
      case "checkride": return "bg-sega-blue";
      default: return "bg-muted";
    }
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Milestone Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["solo", "cross_country", "night", "checkride"].map(category => {
              const categoryMilestones = milestones.filter(m => m.category === category);
              const completed = categoryMilestones.filter(m => m.completed).length;
              const total = categoryMilestones.length;
              const percentage = total > 0 ? (completed / total) * 100 : 0;

              return (
                <div key={category} className="text-center p-4 border rounded-lg">
                  <div className={`w-12 h-12 ${getCategoryColor(category)} rounded-full mx-auto mb-2 flex items-center justify-center shadow-lg`}>
                    {getMilestoneIcon(category, percentage === 100)}
                  </div>
                  <h3 className="font-medium capitalize">{category.replace("_", " ")}</h3>
                  <p className="text-2xl font-bold">{completed}/{total}</p>
                  <Progress value={percentage} className="h-2 mt-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Milestones */}
      <div className="space-y-4">
        {sortedMilestones.map((milestone, index) => {
          const progress = getMilestoneProgress(milestone);
          const isAvailable = index === 0 || sortedMilestones[index - 1].completed;
          
          return (
            <Card key={milestone.id} className={milestone.completed ? "border-success" : isAvailable ? "border-primary" : "border-muted"}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getMilestoneIcon(milestone.category, milestone.completed)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{milestone.name}</h3>
                        <Badge variant={milestone.completed ? "default" : isAvailable ? "secondary" : "outline"}>
                          {milestone.category.replace("_", " ")}
                        </Badge>
                        {milestone.completed && (
                          <Badge variant="default" className="bg-success">
                            Completed {milestone.dateCompleted}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{milestone.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Requirements:</h4>
                        <ul className="space-y-1">
                          {milestone.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <div className={`w-2 h-2 rounded-full ${milestone.completed ? "bg-success" : "bg-muted-foreground"}`} />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right min-w-[120px]">
                    <div className="mb-2">
                      <p className="text-sm text-muted-foreground">Hours Required</p>
                      <p className="text-lg font-bold">{milestone.hoursRequired}</p>
                    </div>
                    
                    {!milestone.completed && (
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {totalHours}/{milestone.hoursRequired} hours
                        </p>
                        {isInstructor && isAvailable && progress >= 100 && (
                          <Button size="sm" className="w-full">
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}