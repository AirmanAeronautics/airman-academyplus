// AIRMAN Academy+ CRM AI Agent
// Lead nurturing, student pipeline tracking, conversion risk alerts

import { useState } from "react"
import { Bot, Users, Target, TrendingUp, Mail, Phone, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { logAIAction } from "@/lib/eventBus"
import { leads } from "@/data/seeds"
import type { Lead, AcademyRole } from "@/types"

interface CRMAgentProps {
  currentUserRole?: AcademyRole
  onLeadUpdate?: (leads: Lead[]) => void
}

export function CRMAgent({ currentUserRole, onLeadUpdate }: CRMAgentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const scoreLeads = async () => {
    setLoading(true)
    
    // Simulate AI scoring delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const scoredLeads = leads.map(lead => {
      // AI scoring based on goal, budget, location, source
      let score = 50
      
      // Goal scoring
      if (lead.goal === "cpl" || lead.goal === "atpl") score += 20
      if (lead.goal === "ppl") score += 15
      if (lead.goal === "ir") score += 10
      
      // Budget scoring
      if (lead.budget > 15000) score += 25
      else if (lead.budget > 8000) score += 15
      else if (lead.budget > 4000) score += 10
      
      // Source scoring
      if (lead.source === "referral") score += 15
      if (lead.source === "website") score += 10
      
      // Location scoring (closer = better)
      if (lead.location.includes("London") || lead.location.includes("Cambridge")) score += 10
      
      // Add some variation
      score += Math.floor(Math.random() * 10 - 5)
      score = Math.max(0, Math.min(100, score))
      
      // Assign segments
      let segment: "hot" | "warm" | "cold"
      if (score >= 80) segment = "hot"
      else if (score >= 60) segment = "warm"
      else segment = "cold"
      
      return {
        ...lead,
        ai_score: score,
        segment
      }
    })

    const hotLeads = scoredLeads.filter(l => l.segment === "hot").length
    const warmLeads = scoredLeads.filter(l => l.segment === "warm").length
    const coldLeads = scoredLeads.filter(l => l.segment === "cold").length

    setAnalysis({
      totalLeads: scoredLeads.length,
      hotLeads,
      warmLeads,
      coldLeads,
      conversionRisk: scoredLeads.filter(l => l.segment === "cold" && l.status === "new").length,
      recommendations: [
        `Prioritize ${hotLeads} hot leads for immediate contact`,
        `Schedule follow-up calls for ${warmLeads} warm leads this week`,
        `Create nurture campaign for ${coldLeads} cold leads`,
        "Focus on referral program - highest conversion rate"
      ]
    })

    onLeadUpdate?.(scoredLeads)
    setLoading(false)

    // Log to event bus
    logAIAction(
      "crm.lead.scored",
      {
        leadsCount: scoredLeads.length,
        hotLeads,
        warmLeads,
        coldLeads,
        avgScore: Math.round(scoredLeads.reduce((sum, l) => sum + l.ai_score, 0) / scoredLeads.length)
      },
      "ai_agent",
      currentUserRole
    )
  }

  const generateOutreach = (segment: "hot" | "warm" | "cold") => {
    const templates = {
      hot: {
        subject: "Fast-track your aviation career - Limited spots available",
        content: "Hi [Name], I noticed you're interested in [goal] training. With your background and timeline, you're an excellent candidate for our accelerated program. We have just 3 spots remaining for this quarter. Can we schedule a brief call to discuss your aviation goals?"
      },
      warm: {
        subject: "Your aviation training questions answered",
        content: "Hi [Name], Thank you for your interest in [goal] training. I'd love to answer any questions about our programs and help you map out the best path to achieve your aviation goals. When would be a good time for a quick 15-minute call?"
      },
      cold: {
        subject: "Discover your path to the cockpit",
        content: "Hi [Name], Starting your aviation journey can feel overwhelming, but it doesn't have to be. Our structured [goal] program has helped hundreds of students achieve their dreams. I'd love to send you our free training guide - would that be helpful?"
      }
    }

    const template = templates[segment]
    
    logAIAction(
      "crm.outreach.drafted",
      {
        segment,
        template: template.subject,
        targetLeads: leads.filter(l => l.segment === segment).length
      },
      "ai_agent",
      currentUserRole
    )

    return template
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-primary hover:bg-primary/90"
          data-testid="crm-ai-agent"
        >
          <Bot className="h-4 w-4 mr-2" />
          CRM AI Agent
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            CRM AI Agent
          </DialogTitle>
          <DialogDescription>
            Lead scoring, pipeline analysis, and automated outreach recommendations
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="scoring" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
            <TabsTrigger value="outreach">Outreach Generator</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="scoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  AI Lead Scoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Analyze {leads.length} leads using AI scoring algorithm
                  </p>
                  <Button 
                    onClick={scoreLeads}
                    disabled={loading}
                    data-testid="score-leads"
                  >
                    {loading ? "Analyzing..." : "Score All Leads"}
                  </Button>
                </div>

                {analysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{analysis.hotLeads}</div>
                        <div className="text-sm text-red-600">Hot Leads</div>
                        <Badge variant="destructive" className="mt-1">80-100</Badge>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{analysis.warmLeads}</div>
                        <div className="text-sm text-yellow-600">Warm Leads</div>
                        <Badge variant="secondary" className="mt-1">60-79</Badge>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{analysis.coldLeads}</div>
                        <div className="text-sm text-blue-600">Cold Leads</div>
                        <Badge variant="outline" className="mt-1">0-59</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">AI Recommendations:</h4>
                      <ul className="space-y-1">
                        {analysis.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground">• {rec}</li>
                        ))}
                      </ul>
                    </div>

                    {analysis.conversionRisk > 0 && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-600">Conversion Risk Alert</span>
                        </div>
                        <p className="text-sm text-orange-600 mt-1">
                          {analysis.conversionRisk} new leads are at risk of going cold. Recommend immediate action.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outreach" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Automated Outreach Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(["hot", "warm", "cold"] as const).map(segment => {
                  const template = generateOutreach(segment)
                  const count = leads.filter(l => l.segment === segment).length
                  
                  return (
                    <div key={segment} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={segment === "hot" ? "destructive" : segment === "warm" ? "secondary" : "outline"}>
                            {segment.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{count} leads</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Campaign
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Subject: </span>
                          <span className="text-sm">{template.subject}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Template: </span>
                          <p className="text-sm text-muted-foreground mt-1">{template.content}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Pipeline Health Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Conversion Funnel</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">New Leads</span>
                        <span className="text-sm font-medium">
                          {leads.filter(l => l.status === "new").length}
                        </span>
                      </div>
                      <Progress value={85} className="h-2" />
                      
                      <div className="flex justify-between">
                        <span className="text-sm">Qualified</span>
                        <span className="text-sm font-medium">
                          {leads.filter(l => l.status === "qualified").length}
                        </span>
                      </div>
                      <Progress value={65} className="h-2" />
                      
                      <div className="flex justify-between">
                        <span className="text-sm">Enrolled</span>
                        <span className="text-sm font-medium">
                          {leads.filter(l => l.status === "closed_won").length}
                        </span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Source Performance</h4>
                    <div className="space-y-2">
                      {["website", "referral", "social", "event"].map(source => {
                        const count = leads.filter(l => l.source === source).length
                        const conversion = leads.filter(l => l.source === source && l.status === "closed_won").length
                        const rate = count > 0 ? Math.round((conversion / count) * 100) : 0
                        
                        return (
                          <div key={source} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{source}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{rate}%</span>
                              <div className="w-16 h-2 bg-muted rounded">
                                <div 
                                  className="h-full bg-primary rounded" 
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">AI Insights</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Referral leads convert 40% better than website leads</li>
                    <li>• CPL/ATPL inquiries have highest lifetime value potential</li>
                    <li>• Weekend training queries show 60% faster enrollment</li>
                    <li>• Budget &gt;£10k correlates with 80% completion rate</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}