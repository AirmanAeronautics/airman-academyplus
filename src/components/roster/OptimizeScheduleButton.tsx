import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useRosterOptimizer } from "@/hooks/useRosterOptimizer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface OptimizeScheduleButtonProps {
  planId?: string;
  onOptimizationComplete?: () => void;
}

export const OptimizeScheduleButton = ({
  planId,
  onOptimizationComplete,
}: OptimizeScheduleButtonProps) => {
  const { toast } = useToast();
  const { loading, progress, optimizeSchedule } = useRosterOptimizer();
  const [open, setOpen] = useState(false);
  const [maxIterations, setMaxIterations] = useState(100);

  const handleOptimize = async () => {
    if (!planId) {
      toast({
        title: "No Plan Selected",
        description: "Please create or select a roster plan first",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, using mock data
    // In production, fetch these from the database based on the plan
    const result = await optimizeSchedule({
      plan_id: planId,
      student_ids: [], // TODO: Fetch from database
      instructor_ids: [], // TODO: Fetch from database
      aircraft_ids: [], // TODO: Fetch from database
      time_slots: [], // TODO: Generate based on plan period
      max_iterations: maxIterations,
    });

    if (result?.success) {
      setOpen(false);
      onOptimizationComplete?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" disabled={!planId}>
          <Sparkles className="mr-2 h-4 w-4" />
          Optimize Schedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Optimize Training Schedule</DialogTitle>
          <DialogDescription>
            Configure optimization parameters and generate the best schedule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="iterations">Maximum Iterations</Label>
            <Input
              id="iterations"
              type="number"
              value={maxIterations}
              onChange={(e) => setMaxIterations(parseInt(e.target.value) || 100)}
              min={10}
              max={500}
            />
            <p className="text-xs text-muted-foreground">
              Higher iterations may produce better results but take longer (10-500)
            </p>
          </div>

          {progress && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">{progress}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleOptimize}
              disabled={loading || !planId}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run Optimization
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
