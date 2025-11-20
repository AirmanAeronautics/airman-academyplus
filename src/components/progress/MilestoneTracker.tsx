import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { CheckCircle, Circle, Clock, Target, Trophy, BookOpen, ChevronRight } from "lucide-react";
import { StudentMilestone } from "@/types/progress";

interface MilestoneTrackerProps {
  milestones: StudentMilestone[];
  totalHours: number;
  isInstructor?: boolean;
}

export function MilestoneTracker({ milestones, totalHours, isInstructor = false }: MilestoneTrackerProps) {
  const getMilestoneIcon = (category: string, completed: boolean) => {
    const iconClass = completed ? "text-primary" : "text-muted-foreground";
    const size = "h-5 w-5";
    
    switch (category) {
      case "solo":
        return <Trophy className={`${size} ${iconClass}`} />;
      case "cross_country":
        return <Target className={`${size} ${iconClass}`} />;
      case "night":
        return <Clock className={`${size} ${iconClass}`} />;
      case "instrument":
        return <BookOpen className={`${size} ${iconClass}`} />;
      case "checkride":
        return <Trophy className={`${size} ${iconClass}`} />;
      default:
        return <Circle className={`${size} ${iconClass}`} />;
    }
  };

  const getTimelineIcon = (milestone: StudentMilestone, isAvailable: boolean) => {
    if (milestone.completed) {
      return (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <CheckCircle className="h-4 w-4 text-white" />
        </div>
      );
    }
    
    if (isAvailable) {
      return (
        <div className="w-8 h-8 rounded-full border-2 border-primary bg-background flex items-center justify-center">
          <Circle className="h-4 w-4 text-primary" />
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full border-2 border-muted bg-background flex items-center justify-center">
        <Circle className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  };

  const getMilestoneProgress = (milestone: StudentMilestone) => {
    if (milestone.completed) return 100;
    if (totalHours >= milestone.hoursRequired) return 100;
    return (totalHours / milestone.hoursRequired) * 100;
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "solo": return "Solo Flight";
      case "cross_country": return "Cross Country";
      case "night": return "Night Flight";
      case "instrument": return "Instrument";
      case "checkride": return "Checkride";
      default: return category;
    }
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);
  const categories = ["solo", "cross_country", "night", "checkride"];

  return (
    <div className="space-y-8">
      {/* Progress Stepper Overview */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex justify-between items-center relative px-4">
            {/* Connection line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2 z-0" />
            
            {categories.map((category, index) => {
              const categoryMilestones = milestones.filter(m => m.category === category);
              const completed = categoryMilestones.filter(m => m.completed).length;
              const total = categoryMilestones.length;
              const percentage = total > 0 ? (completed / total) * 100 : 0;

              return (
                <div key={category} className="flex flex-col items-center relative z-10 bg-background">
                  <CircularProgress 
                    value={percentage} 
                    size={64} 
                    strokeWidth={4}
                    className="mb-3 hover:scale-105 transition-transform duration-200"
                  >
                    <div className="text-center">
                      {getMilestoneIcon(category, percentage === 100)}
                    </div>
                  </CircularProgress>
                  
                  <h3 className="font-medium text-sm text-center mb-1">
                    {getCategoryDisplayName(category)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {completed}/{total}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
            
            <div className="space-y-0">
              {sortedMilestones.map((milestone, index) => {
                const progress = getMilestoneProgress(milestone);
                const isAvailable = index === 0 || sortedMilestones[index - 1].completed;
                const isLast = index === sortedMilestones.length - 1;
                
                return (
                  <div key={milestone.id} className="relative">
                    <div className="flex items-start gap-4 p-6 hover:bg-muted/20 transition-colors duration-200">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex-shrink-0">
                        {getTimelineIcon(milestone, isAvailable)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{milestone.name}</h3>
                              <Badge 
                                variant={milestone.completed ? "default" : isAvailable ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {getCategoryDisplayName(milestone.category)}
                              </Badge>
                              {milestone.completed && (
                                <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                                  Completed {milestone.dateCompleted}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                              {milestone.description}
                            </p>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Requirements:</h4>
                              <ul className="grid gap-1">
                                {milestone.requirements.map((req, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                                      milestone.completed ? "bg-primary" : "bg-muted-foreground/50"
                                    }`} />
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {/* Progress section */}
                          <div className="text-right space-y-3 flex-shrink-0 min-w-[100px]">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Hours Required</p>
                              <p className="text-lg font-bold">{milestone.hoursRequired}h</p>
                            </div>
                            
                            {!milestone.completed && (
                              <div className="space-y-2">
                                <div className="w-16">
                                  <Progress value={progress} className="h-1.5" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {totalHours}/{milestone.hoursRequired}h
                                </p>
                                
                                {isInstructor && isAvailable && progress >= 100 && (
                                  <Button size="sm" className="text-xs px-2 py-1">
                                    Mark Complete
                                  </Button>
                                )}
                              </div>
                            )}
                            
                            {milestone.completed && (
                              <div className="flex items-center justify-end text-primary">
                                <CheckCircle className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!isLast && <div className="border-b border-border/50 ml-16" />}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}