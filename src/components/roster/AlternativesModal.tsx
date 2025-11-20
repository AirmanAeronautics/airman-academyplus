import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, X } from "lucide-react";
import { format } from "date-fns";
import { useReplanningMonitor } from "@/hooks/useReplanningMonitor";

interface AlternativesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  originalAssignment?: any;
}

export const AlternativesModal = ({
  open,
  onOpenChange,
  assignmentId,
  originalAssignment,
}: AlternativesModalProps) => {
  const { alternatives, loading, acceptAlternative, rejectAlternative } = useReplanningMonitor(assignmentId);

  const getTriggerBadge = (type: string) => {
    const variants: Record<string, any> = {
      weather: { variant: "destructive", label: "Weather" },
      notam: { variant: "warning", label: "NOTAM" },
      availability: { variant: "secondary", label: "Availability" },
      aircraft: { variant: "outline", label: "Aircraft" },
    };
    const config = variants[type] || variants.weather;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy HH:mm");
    } catch {
      return dateStr;
    }
  };

  if (alternatives.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Alternative Schedules Available
          </DialogTitle>
          <DialogDescription>
            {alternatives.length} alternative schedule(s) generated due to {getTriggerBadge(alternatives[0].trigger_type)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {originalAssignment && (
            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="text-sm">Original Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Time:</span>{" "}
                    {formatDateTime(originalAssignment.start_at)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>{" "}
                    {Math.round((new Date(originalAssignment.end_at).getTime() - 
                      new Date(originalAssignment.start_at).getTime()) / 1000 / 60)} min
                  </div>
                  <div>
                    <span className="text-muted-foreground">Score:</span>{" "}
                    {originalAssignment.total_score?.toFixed(2) || "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Alternatives (Ranked by Score)</h3>
            {alternatives.map((alt, idx) => {
              const altData = alt.alternative_assignment as any;
              const scoreData = alt.score_breakdown as any;

              return (
                <Card key={alt.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Alternative {idx + 1}
                        <Badge className="ml-2" variant="secondary">
                          Score: {scoreData.total_score?.toFixed(2) || "N/A"}
                        </Badge>
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => acceptAlternative(alt.id)}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectAlternative(alt.id)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      Generated {formatDateTime(alt.generated_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Time:</span>{" "}
                        {formatDateTime(altData.start_at)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>{" "}
                        {Math.round((new Date(altData.end_at).getTime() - 
                          new Date(altData.start_at).getTime()) / 1000 / 60)} min
                      </div>
                      {altData.instructor_id !== originalAssignment?.instructor_id && (
                        <div className="col-span-2">
                          <Badge variant="outline">Different Instructor</Badge>
                        </div>
                      )}
                      {altData.aircraft_id !== originalAssignment?.aircraft_id && (
                        <div className="col-span-2">
                          <Badge variant="outline">Different Aircraft</Badge>
                        </div>
                      )}
                    </div>

                    {scoreData.breakdown && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Score Breakdown:</p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {Object.entries(scoreData.breakdown).map(([key, value]: [string, any]) => (
                            <div key={key}>
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/_/g, " ")}:
                              </span>{" "}
                              {value?.toFixed(2)}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
