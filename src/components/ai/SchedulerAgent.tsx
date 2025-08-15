import { useState } from "react"
import { Bot, CheckCircle, Clock, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface ScheduleChange {
  id: string;
  type: "reschedule" | "reassign_aircraft" | "reassign_instructor";
  originalSlot: string;
  newSlot?: string;
  student: string;
  instructor: string;
  originalAircraft: string;
  newAircraft?: string;
  newInstructor?: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

const mockChanges: ScheduleChange[] = [
  {
    id: "1",
    type: "reassign_aircraft",
    originalSlot: "13:30 - 15:30",
    student: "Michael Davis",
    instructor: "Capt. Wilson", 
    originalAircraft: "N321GH",
    newAircraft: "N654IJ",
    reason: "N321GH grounded due to unresolved defects",
    priority: "high"
  },
  {
    id: "2",
    type: "reschedule",
    originalSlot: "16:30 - 18:30",
    newSlot: "17:00 - 19:00",
    student: "Maria Garcia",
    instructor: "Capt. Wilson",
    originalAircraft: "N789EF",
    reason: "Instructor duty time optimization",
    priority: "medium"
  },
  {
    id: "3",
    type: "reassign_instructor",
    originalSlot: "18:00 - 20:00",
    student: "Emma Thompson",
    instructor: "Capt. Johnson",
    newInstructor: "Capt. Smith",
    originalAircraft: "N147MN",
    reason: "Capt. Johnson exceeding daily duty limits",
    priority: "high"
  }
];

interface SchedulerAgentProps {
  onApplyChanges: (changes: ScheduleChange[]) => void;
}

export function SchedulerAgent({ onApplyChanges }: SchedulerAgentProps) {
  const [open, setOpen] = useState(false);
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setSelectedChanges(mockChanges.map(c => c.id));
    }, 2000);
  };

  const handleApply = () => {
    const changesToApply = mockChanges.filter(c => selectedChanges.includes(c.id));
    onApplyChanges(changesToApply);
    setOpen(false);
    setSelectedChanges([]);
  };

  const toggleChange = (changeId: string) => {
    setSelectedChanges(prev => 
      prev.includes(changeId) 
        ? prev.filter(id => id !== changeId)
        : [...prev, changeId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleOptimize} className="gap-2">
          <Bot className="h-4 w-4" />
          Optimize Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Schedule Optimization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isOptimizing ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-sm text-muted-foreground">Analyzing schedule conflicts...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                Found {mockChanges.length} optimization opportunities. Select changes to apply:
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {mockChanges.map((change) => (
                  <div key={change.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={selectedChanges.includes(change.id)}
                        onCheckedChange={() => toggleChange(change.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={change.priority === "high" ? "destructive" : change.priority === "medium" ? "secondary" : "outline"}>
                            {change.type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(change.priority)}>
                            {change.priority} priority
                          </Badge>
                        </div>

                        <div className="text-sm">
                          <div className="font-medium">{change.student} • {change.originalSlot}</div>
                          <div className="text-muted-foreground">Instructor: {change.instructor}</div>
                        </div>

                        {change.type === "reschedule" && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Reschedule to:</span> {change.newSlot}
                          </div>
                        )}

                        {change.type === "reassign_aircraft" && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Change aircraft:</span> {change.originalAircraft} → {change.newAircraft}
                          </div>
                        )}

                        {change.type === "reassign_instructor" && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Change instructor:</span> {change.instructor} → {change.newInstructor}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="h-4 w-4" />
                          {change.reason}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {selectedChanges.length} of {mockChanges.length} changes selected
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleApply}
                    disabled={selectedChanges.length === 0}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Apply Changes
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}