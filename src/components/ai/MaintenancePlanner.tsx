// AIRMAN Academy+ Maintenance Planner
// AI-powered maintenance planning and task generation

import { useState } from "react";
import { Bot, Wrench, Calendar, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { logAIAction, publish } from "@/lib/eventBus";
import type { Aircraft } from "@/types";

interface MaintenanceTask {
  id: string;
  description: string;
  estimated_hours: number;
  parts_required: { name: string; quantity: number; }[];
  priority: "low" | "medium" | "high";
  category: "inspection" | "repair" | "preventive" | "regulatory";
}

interface MaintenancePlannerProps {
  aircraft: Aircraft;
  onCreateTasks: (tasks: MaintenanceTask[]) => void;
  currentUser?: { id: string; role: string };
}

export function MaintenancePlanner({ aircraft, onCreateTasks, currentUser }: MaintenancePlannerProps) {
  const [open, setOpen] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [maintenancePlan, setMaintenancePlan] = useState<MaintenanceTask[] | null>(null);
  const { toast } = useToast();

  const generateMaintenancePlan = async () => {
    setIsPlanning(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Generate maintenance plan based on aircraft type and hours
    const tasks: MaintenanceTask[] = [];
    
    // Determine maintenance type based on hours remaining
    if (aircraft.hours_to_maintenance <= 25) {
      if (aircraft.maintenance_type.includes("100hr")) {
        tasks.push({
          id: "task_100hr",
          description: "100-Hour Inspection",
          estimated_hours: 8,
          parts_required: [
            { name: "Oil Filter", quantity: 1 },
            { name: "Air Filter", quantity: 1 },
            { name: "Spark Plugs", quantity: 8 }
          ],
          priority: "high",
          category: "inspection"
        });
      }
      
      if (aircraft.maintenance_type.includes("50hr")) {
        tasks.push({
          id: "task_50hr",
          description: "50-Hour Service Check",
          estimated_hours: 4,
          parts_required: [
            { name: "Engine Oil", quantity: 6 },
            { name: "Oil Filter", quantity: 1 }
          ],
          priority: "medium",
          category: "preventive"
        });
      }
      
      if (aircraft.maintenance_type.includes("Annual")) {
        tasks.push({
          id: "task_annual",
          description: "Annual Inspection (Base)",
          estimated_hours: 16,
          parts_required: [
            { name: "Inspection Kit", quantity: 1 },
            { name: "Various Consumables", quantity: 1 }
          ],
          priority: "high",
          category: "regulatory"
        });
      }
    }
    
    // Add defect-related tasks if aircraft has defects
    if (aircraft.defects > 0) {
      tasks.push({
        id: "task_defect_repair",
        description: "NAV1 Radio Repair/Replacement",
        estimated_hours: 3,
        parts_required: [
          { name: "NAV1 Radio Unit", quantity: 1 },
          { name: "Antenna Cable", quantity: 1 }
        ],
        priority: "medium",
        category: "repair"
      });
    }
    
    // Fuel system check if fuel level is low
    if (aircraft.fuel_level < 50) {
      tasks.push({
        id: "task_fuel_check",
        description: "Fuel System Inspection",
        estimated_hours: 2,
        parts_required: [
          { name: "Fuel Sample Bottles", quantity: 4 }
        ],
        priority: "low",
        category: "inspection"
      });
    }
    
    setMaintenancePlan(tasks);
    setIsPlanning(false);
    
    logAIAction("maintenance.planned", {
      aircraft: aircraft.registration,
      aircraftId: aircraft.id,
      tasksGenerated: tasks.length,
      totalEstimatedHours: tasks.reduce((sum, task) => sum + task.estimated_hours, 0)
    }, currentUser?.id, currentUser?.role as any);

    // Publish categorized notification
    await publish({
      type: "Maintenance Planning", 
      message: `AI planned maintenance for ${aircraft.registration}: ${tasks.length} tasks generated`,
      metadata: { aircraft: aircraft.registration, tasksGenerated: tasks.length },
      org_id: "org_airman_academy",
      category: "maintenance"
    });
  };

  const handleCreateTasks = () => {
    if (!maintenancePlan) return;
    
    onCreateTasks(maintenancePlan);
    
    logAIAction("maintenance.tasks.created", {
      aircraft: aircraft.registration,
      tasksCreated: maintenancePlan.length,
      highPriorityTasks: maintenancePlan.filter(t => t.priority === "high").length
    }, currentUser?.id, currentUser?.role as any);
    
    toast({
      title: "Maintenance Tasks Created",
      description: `Created ${maintenancePlan.length} maintenance tasks for ${aircraft.registration}.`
    });
    
    setOpen(false);
    setMaintenancePlan(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inspection": return Clock;
      case "repair": return Wrench;
      case "preventive": return Package;
      case "regulatory": return Calendar;
      default: return Wrench;
    }
  };

  const suggestedSlot = new Date();
  suggestedSlot.setDate(suggestedSlot.getDate() + 3); // 3 days from now

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          data-testid="maintenance-ask-ai"
        >
          <Bot className="h-4 w-4 mr-2" />
          Ask AI
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Maintenance Planner
          </DialogTitle>
          <DialogDescription>
            Intelligent maintenance planning for {aircraft.registration} ({aircraft.model})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aircraft Status Summary */}
          <Card className="aviation-card">
            <CardHeader>
              <CardTitle className="text-base">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Hours</div>
                  <div className="font-bold">{aircraft.total_hours}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Hours to Check</div>
                  <div className="font-bold text-warning">{aircraft.hours_to_maintenance}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Next Check</div>
                  <div className="font-bold">{aircraft.maintenance_type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Open Defects</div>
                  <div className="font-bold text-destructive">{aircraft.defects}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!maintenancePlan ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-medium mb-2">Ready to Plan Maintenance</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI will analyze aircraft status, flight hours, and maintenance history 
                      to create an optimized maintenance plan with task scheduling and parts requirements.
                    </p>
                    <div className="bg-accent/50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium">Suggested Time Slot:</p>
                      <p className="text-sm text-muted-foreground">
                        {suggestedSlot.toDateString()} • Based on current schedule availability
                      </p>
                    </div>
                    <Button 
                      onClick={generateMaintenancePlan} 
                      disabled={isPlanning}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      {isPlanning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Analyzing Aircraft...
                        </>
                      ) : (
                        <>
                          <Bot className="h-4 w-4 mr-2" />
                          Generate Maintenance Plan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Maintenance Plan</h3>
                  <Badge variant="outline">
                    {maintenancePlan.reduce((sum, task) => sum + task.estimated_hours, 0)} hours total
                  </Badge>
                </div>
                
                {maintenancePlan.map((task) => {
                  const CategoryIcon = getCategoryIcon(task.category);
                  return (
                    <Card key={task.id} className="aviation-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4 text-primary" />
                            <span className="font-medium">{task.description}</span>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(task.priority) as any}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline">
                              {task.estimated_hours}h
                            </Badge>
                          </div>
                        </div>
                        
                        {task.parts_required.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Parts Required:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {task.parts_required.map((part, index) => (
                                <div key={index} className="text-sm bg-muted/50 rounded px-2 py-1">
                                  {part.name} × {part.quantity}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTasks}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Create Maintenance Tasks
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}