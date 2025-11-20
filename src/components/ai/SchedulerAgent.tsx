import { useState } from "react"
import { Bot, CheckCircle, Clock, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { generateAiRoster, createRosterEntry, type AiRosterSuggestion } from "@/lib/api/roster"
import { useToast } from "@/hooks/use-toast"
import { startOfWeek, endOfWeek, format } from "date-fns"

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

// Default mock changes (used as fallback if no AI suggestions)
const getDefaultMockChanges = (): ScheduleChange[] => [
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
  instituteId?: string;
  startDate?: string;
  endDate?: string;
}

export function SchedulerAgent({ onApplyChanges, instituteId, startDate, endDate }: SchedulerAgentProps) {
  const [open, setOpen] = useState(false);
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiRosterSuggestion[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [changes, setChanges] = useState<ScheduleChange[]>(getDefaultMockChanges());
  const { toast } = useToast();

  const handleOptimize = async () => {
    if (!instituteId) {
      toast({
        title: "Error",
        description: "Institute ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    setAiError(null);
    setAiSuggestions([]);
    setSelectedChanges([]);

    try {
      // Calculate date range - use provided dates or default to current week
      const start = startDate || format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd');
      const end = endDate || format(endOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd');

      const response = await generateAiRoster({
        instituteId,
        startDate: start,
        endDate: end,
      });

      setAiSuggestions(response.data.suggestions);
      
      // Convert AI suggestions to ScheduleChange format for compatibility
      const newChanges = response.data.suggestions.map((suggestion) => ({
        id: suggestion.tempId,
        type: 'reschedule' as const,
        originalSlot: `${suggestion.startTime} - ${suggestion.endTime}`,
        newSlot: `${suggestion.startTime} - ${suggestion.endTime}`,
        student: suggestion.studentName || suggestion.studentId || 'Unknown',
        instructor: suggestion.instructorName || suggestion.instructorId,
        originalAircraft: suggestion.aircraftRegistration || suggestion.aircraftId || 'N/A',
        newAircraft: suggestion.aircraftRegistration || suggestion.aircraftId || 'N/A',
        reason: `AI suggestion (confidence: ${Math.round(suggestion.confidenceScore * 100)}%)${suggestion.conflictFlags?.length ? ` - Flags: ${suggestion.conflictFlags.join(', ')}` : ''}`,
        priority: suggestion.conflictFlags?.includes('WX_RISK') || suggestion.conflictFlags?.includes('MAINT_DUE') ? 'high' as const : 'medium' as const,
      }));

      setChanges(newChanges);
      setSelectedChanges(newChanges.map(c => c.id));
    } catch (error: any) {
      console.error('AI roster generation failed:', error);
      setAiError(error.message || 'Failed to generate AI roster suggestions');
      toast({
        title: "AI Generation Failed",
        description: error.message || 'Failed to generate AI roster suggestions',
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApply = async () => {
    const changesToApply = changes.filter(c => selectedChanges.includes(c.id));
    
    // If we have AI suggestions, create roster entries via API
    if (aiSuggestions.length > 0 && instituteId) {
      const suggestionsToApply = aiSuggestions.filter(s => selectedChanges.includes(s.tempId));
      
      try {
        for (const suggestion of suggestionsToApply) {
          await createRosterEntry({
            instituteId,
            date: suggestion.date,
            startTime: suggestion.startTime,
            endTime: suggestion.endTime,
            type: suggestion.type,
            studentId: suggestion.studentId,
            instructorId: suggestion.instructorId,
            aircraftId: suggestion.aircraftId,
            lessonCode: suggestion.lessonCode,
            notes: 'AI-SUGGESTED',
          });
        }

        toast({
          title: "Suggestions Applied",
          description: `Successfully created ${suggestionsToApply.length} roster entries`,
        });

        // Also call the original handler for compatibility
        onApplyChanges(changesToApply);
        setOpen(false);
        setSelectedChanges([]);
        setAiSuggestions([]);
        return;
      } catch (error: any) {
        const errorMessage = error.errorCode === 'CONFLICT'
          ? 'Cannot apply suggestion due to overlap.'
          : error.message || 'Failed to apply suggestions';
        toast({
          title: "Apply Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Fallback to original handler if no AI suggestions
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
              {aiError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive">{aiError}</p>
                </div>
              )}
              
              {aiSuggestions.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Found {aiSuggestions.length} AI optimization suggestions. Select changes to apply:
                </div>
              )}
              
              {aiSuggestions.length === 0 && mockChanges.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Found {mockChanges.length} optimization opportunities. Select changes to apply:
                </div>
              )}
              
              {aiSuggestions.length === 0 && mockChanges.length === 0 && !isOptimizing && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Click "Generate AI Suggestions" to get optimization recommendations.
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {changes.map((change) => (
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
                  {selectedChanges.length} of {changes.length} changes selected
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setOpen(false);
                    setAiSuggestions([]);
                    setAiError(null);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleApply}
                    disabled={selectedChanges.length === 0 || !instituteId}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Apply {selectedChanges.length} {selectedChanges.length === 1 ? 'Change' : 'Changes'}
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