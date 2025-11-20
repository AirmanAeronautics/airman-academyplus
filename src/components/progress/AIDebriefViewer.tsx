import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, TrendingUp, AlertTriangle, BookOpen, Target, Calendar, Plane } from "lucide-react";
import { mockFlightSession } from "@/data/flightData";
import { InstructorCopilot } from "@/components/ai/InstructorCopilot";
import { FlightDebrief } from "@/types/progress";

interface AIDebriefViewerProps {
  studentId: string;
  onGenerateDebrief: () => void;
}

export function AIDebriefViewer({ studentId, onGenerateDebrief }: AIDebriefViewerProps) {
  const [selectedDebrief, setSelectedDebrief] = useState<FlightDebrief | null>(null);

  // Mock flight debriefs data
  const mockDebriefs: FlightDebrief[] = [
    {
      sessionId: "FLT-2024-08-15-001",
      studentId: studentId,
      instructorId: "INST-001",
      date: "2024-08-15",
      aircraft: "N123AB",
      flightTime: 1.5,
      maneuvers: [
        {
          name: "Takeoff",
          category: "takeoff",
          score: 8,
          maxScore: 10,
          notes: "Good alignment, slight float on touchdown",
          improvement: "Work on final approach speed control"
        },
        {
          name: "Pattern Work",
          category: "maneuvers",
          score: 7,
          maxScore: 10,
          notes: "Generally good spacing, minor altitude deviations",
          improvement: "Maintain consistent pattern altitude"
        },
        {
          name: "Landing",
          category: "landing",
          score: 9,
          maxScore: 10,
          notes: "Excellent flare and touchdown",
          improvement: "Continue current technique"
        }
      ],
      overallScore: 85,
      aiSummary: "Strong performance with excellent landing technique demonstrated. Focus areas include approach speed consistency and pattern altitude maintenance. Student shows good progress toward solo readiness.",
      improvementAreas: [
        "Approach speed control",
        "Pattern altitude consistency", 
        "Radio communication timing"
      ],
      strengths: [
        "Landing technique",
        "Aircraft control",
        "Situational awareness",
        "Safety mindset"
      ],
      studyRecommendations: [
        "Review approach speeds for different configurations",
        "Practice radio phraseology with online simulator",
        "Study traffic pattern procedures - AC 90-66B"
      ],
      nextSteps: [
        "Schedule pattern work session",
        "Practice approach speed control",
        "Prepare for pre-solo exam"
      ],
      exceedances: [
        {
          type: "Bank Angle",
          severity: "minor",
          description: "Brief exceedance of 45° during pattern turn"
        }
      ]
    },
    {
      sessionId: "FLT-2024-08-10-001", 
      studentId: studentId,
      instructorId: "INST-001",
      date: "2024-08-10",
      aircraft: "N456CD",
      flightTime: 1.2,
      maneuvers: [
        {
          name: "Ground Reference",
          category: "maneuvers",
          score: 6,
          maxScore: 10,
          notes: "Need to improve wind correction",
          improvement: "Practice rectangular course and S-turns"
        }
      ],
      overallScore: 72,
      aiSummary: "Good foundational flight with areas for improvement in wind correction and ground reference maneuvers.",
      improvementAreas: ["Wind correction", "Ground reference maneuvers"],
      strengths: ["Basic aircraft control", "Following instructions"],
      studyRecommendations: ["Review ground reference maneuver techniques"],
      nextSteps: ["Practice ground reference maneuvers"],
      exceedances: []
    }
  ];

  const handleInsertDebrief = (debrief: string) => {
    console.log("Inserting debrief:", debrief);
    // This would typically save to database or update state
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor": return "text-warning";
      case "major": return "text-destructive";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Copilot */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Flight Debriefs
            </CardTitle>
            <InstructorCopilot onInsertDebrief={handleInsertDebrief} />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Debriefs List */}
        <div className="space-y-4">
          <h3 className="font-medium">Recent Flight Sessions</h3>
          {mockDebriefs.map((debrief) => (
            <Card
              key={debrief.sessionId}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDebrief?.sessionId === debrief.sessionId ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedDebrief(debrief)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{debrief.date}</span>
                  </div>
                  <Badge variant={debrief.overallScore >= 80 ? "default" : debrief.overallScore >= 60 ? "secondary" : "destructive"}>
                    {debrief.overallScore}%
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Plane className="h-4 w-4" />
                  <span>{debrief.aircraft}</span>
                  <span>•</span>
                  <span>{debrief.flightTime}h</span>
                </div>
                
                <p className="text-sm line-clamp-2">{debrief.aiSummary}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Debrief Details */}
        <div className="lg:col-span-2">
          {selectedDebrief ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Flight Debrief - {selectedDebrief.date}</span>
                  <Badge variant={selectedDebrief.overallScore >= 80 ? "default" : "secondary"}>
                    Overall Score: {selectedDebrief.overallScore}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="maneuvers">Maneuvers</TabsTrigger>
                    <TabsTrigger value="recommendations">Study Plan</TabsTrigger>
                    <TabsTrigger value="exceedances">Safety</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-success mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {selectedDebrief.strengths.map((strength, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-success rounded-full" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-warning mb-2">Areas for Improvement</h4>
                        <ul className="space-y-1">
                          {selectedDebrief.improvementAreas.map((area, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-warning rounded-full" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">AI Analysis</h4>
                      <p className="text-sm">{selectedDebrief.aiSummary}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="maneuvers" className="space-y-4">
                    {selectedDebrief.maneuvers.map((maneuver, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{maneuver.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{maneuver.category}</Badge>
                              <span className={`font-bold ${getScoreColor(maneuver.score, maneuver.maxScore)}`}>
                                {maneuver.score}/{maneuver.maxScore}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{maneuver.notes}</p>
                          {maneuver.improvement && (
                            <div className="p-2 bg-yellow-50 border border-warning rounded text-sm">
                              <strong>Focus:</strong> {maneuver.improvement}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-3">
                          <BookOpen className="h-4 w-4" />
                          Study Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {selectedDebrief.studyRecommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4" />
                          Next Steps
                        </h4>
                        <ul className="space-y-2">
                          {selectedDebrief.nextSteps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-2 h-2 bg-success rounded-full mt-2" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="exceedances" className="space-y-4">
                    {selectedDebrief.exceedances.length > 0 ? (
                      selectedDebrief.exceedances.map((exceedance, index) => (
                        <Card key={index} className="border-warning">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium flex items-center gap-2">
                                <AlertTriangle className={`h-4 w-4 ${getSeverityColor(exceedance.severity)}`} />
                                {exceedance.type}
                              </h4>
                              <Badge variant={exceedance.severity === "minor" ? "secondary" : "destructive"}>
                                {exceedance.severity}
                              </Badge>
                            </div>
                            <p className="text-sm">{exceedance.description}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="h-8 w-8 text-success" />
                        </div>
                        <h3 className="font-medium text-success">No Safety Exceedances</h3>
                        <p className="text-sm text-muted-foreground">Excellent safety performance this flight!</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Select a Flight Session</h3>
                <p className="text-sm text-muted-foreground">Choose a flight session from the left to view the AI-generated debrief</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}