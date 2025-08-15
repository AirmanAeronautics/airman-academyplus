import { useState } from "react"
import { Bot, FileText, RefreshCw, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockFlightSession } from "@/data/flightData"

interface InstructorCopilotProps {
  onInsertDebrief: (debrief: string) => void;
}

export function InstructorCopilot({ onInsertDebrief }: InstructorCopilotProps) {
  const [open, setOpen] = useState(false);
  const [debrief, setDebrief] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDebrief = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generatedDebrief = `Flight Performance Summary - ${mockFlightSession.date}

Overall Performance: GOOD (${mockFlightSession.scores.overall}/100)

STRENGTHS:
• Excellent landing technique (Score: ${mockFlightSession.scores.landing}/100)
• Good circuit spacing and pattern discipline (Score: ${mockFlightSession.scores.circuitSpacing}/100)
• Smooth taxi operations and radio procedures

AREAS FOR IMPROVEMENT:
• Approach speed management - exceeded target speed by 8 knots at 5:22 into flight
• Bank angle control - brief exceedance of 52° (limit 45°) during steep turns
• Consider earlier power reduction on final approach for better speed control

SPECIFIC RECOMMENDATIONS:
• Practice stabilized approach criteria: target speed ±5 knots by 500ft AGL
• Review steep turn technique focusing on bank angle discipline
• Continue pattern work to maintain proficiency in circuit procedures

NEXT LESSON FOCUS:
• Stabilized approach techniques
• Speed control exercises
• Review of aircraft limitations and normal operating procedures

Flight Time: ${mockFlightSession.flightTime} hours
Student showed good overall airmanship and is progressing well toward solo requirements.`;
      
      setDebrief(generatedDebrief);
      setIsGenerating(false);
    }, 3000);
  };

  const handleInsert = () => {
    onInsertDebrief(debrief);
    setOpen(false);
    setDebrief("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bot className="h-4 w-4" />
          AI Debrief Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Flight Debrief Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flight Data Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Flight Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Approach</span>
                  <Badge variant={mockFlightSession.scores.approach >= 85 ? "default" : "secondary"}>
                    {mockFlightSession.scores.approach}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Landing</span>
                  <Badge variant={mockFlightSession.scores.landing >= 85 ? "default" : "secondary"}>
                    {mockFlightSession.scores.landing}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Circuit Spacing</span>
                  <Badge variant={mockFlightSession.scores.circuitSpacing >= 85 ? "default" : "secondary"}>
                    {mockFlightSession.scores.circuitSpacing}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Exceedances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockFlightSession.exceedances.map((exc, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-destructive">{exc.type}</div>
                    <div className="text-muted-foreground">
                      {exc.value} (limit: {exc.limit})
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Flight Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div>Duration: {mockFlightSession.flightTime}h</div>
                  <div>Route: {mockFlightSession.route}</div>
                  <div>Aircraft: {mockFlightSession.aircraft}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generate Button */}
          {!debrief && (
            <div className="flex justify-center">
              <Button onClick={generateDebrief} disabled={isGenerating} className="gap-2">
                <Bot className="h-4 w-4" />
                {isGenerating ? "Analyzing Flight Data..." : "Generate AI Debrief"}
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-sm text-muted-foreground">
                  Analyzing telemetry data and generating debrief...
                </span>
              </div>
            </div>
          )}

          {/* Generated Debrief */}
          {debrief && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">Generated Flight Debrief</span>
              </div>
              
              <Textarea 
                value={debrief}
                onChange={(e) => setDebrief(e.target.value)}
                className="min-h-96 font-mono text-sm"
                placeholder="AI-generated debrief will appear here..."
              />

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={generateDebrief} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInsert} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Insert to Notes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}