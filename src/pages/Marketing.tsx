import { useState } from "react"
import { Search, Filter, Plus, TrendingUp, Users, Target, Mail, MessageSquare, Bot, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { leads, campaigns, type Lead, type Campaign } from "@/data/leads"

const statusColors = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500", 
  qualified: "bg-orange-500",
  proposal: "bg-purple-500",
  negotiation: "bg-green-400",
  closed_won: "bg-green-600",
  closed_lost: "bg-red-500"
}

const sourceIcons = {
  website: "🌐",
  referral: "👥", 
  social: "📱",
  event: "📅",
  cold_call: "📞"
}

export default function Marketing() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const conversionFunnelData = [
    { stage: "Leads", count: 245, percentage: 100 },
    { stage: "Contacted", count: 186, percentage: 76 },
    { stage: "Qualified", count: 124, percentage: 51 },
    { stage: "Proposal", count: 67, percentage: 27 },
    { stage: "Negotiation", count: 34, percentage: 14 },
    { stage: "Closed Won", count: 23, percentage: 9 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketing & CRM</h1>
          <p className="text-muted-foreground mt-1">Lead management and campaign performance</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Leads</p>
                <p className="text-2xl font-bold">245</p>
                <p className="text-xs text-muted-foreground">+18 this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold">9.4%</p>
                <p className="text-xs text-muted-foreground">+1.2% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Pipeline Value</p>
                <p className="text-2xl font-bold">£186K</p>
                <p className="text-xs text-muted-foreground">Potential revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">AI Score Avg</p>
                <p className="text-2xl font-bold">83</p>
                <p className="text-xs text-muted-foreground">Lead quality</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {filteredLeads.map((lead) => (
                <Card
                  key={lead.id}
                  className={`cursor-pointer transition-all aviation-card hover:aviation-card-elevated ${
                    selectedLead?.id === lead.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${statusColors[lead.status]}`} />
                          <span className="text-lg">{sourceIcons[lead.source]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{lead.goal.toUpperCase()}</Badge>
                            <span className="text-xs text-muted-foreground">£{lead.value.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(lead.aiScore)}`}>
                          {lead.aiScore}
                        </div>
                        <p className="text-xs text-muted-foreground">AI Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedLead && (
              <Card className="aviation-card">
                <CardHeader>
                  <CardTitle>{selectedLead.name}</CardTitle>
                  <CardDescription>{selectedLead.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant="outline">{selectedLead.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Value:</span>
                      <span className="font-medium">£{selectedLead.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Goal:</span>
                      <span className="font-medium">{selectedLead.goal.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Budget:</span>
                      <span className="font-medium">£{selectedLead.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedLead.location}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">AI Lead Scoring</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Overall Score</span>
                        <span className={`font-bold ${getScoreColor(selectedLead.aiScore)}`}>
                          {selectedLead.aiScore}/100
                        </span>
                      </div>
                      <Progress value={selectedLead.aiScore} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        High conversion probability based on budget alignment, goal clarity, and location accessibility.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Log Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="aviation-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {campaign.type === 'email' && '📧'}
                          {campaign.type === 'whatsapp' && '💬'}
                          {campaign.type === 'social' && '📱'}
                          {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-semibold">£{campaign.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spent</p>
                      <p className="font-semibold">£{campaign.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="font-semibold">{campaign.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="font-semibold">{campaign.clicks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conversions</p>
                      <p className="font-semibold">{campaign.conversions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Leads</p>
                      <p className="font-semibold text-primary">{campaign.leads}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Budget Usage</span>
                      <span className="text-sm font-medium">
                        {Math.round((campaign.spent / campaign.budget) * 100)}%
                      </span>
                    </div>
                    <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="aviation-card">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Lead progression through sales stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnelData.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center space-x-4">
                    <div className="w-24 text-sm font-medium">{stage.stage}</div>
                    <div className="flex-1">
                      <Progress value={stage.percentage} className="h-6" />
                    </div>
                    <div className="w-16 text-right">
                      <div className="font-semibold">{stage.count}</div>
                      <div className="text-xs text-muted-foreground">{stage.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <Card className="aviation-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Lead Scoring Insights
              </CardTitle>
              <CardDescription>Automated lead quality assessment and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-accent rounded-lg border border-primary/20">
                  <h4 className="font-medium text-accent-foreground mb-2">High-Priority Leads</h4>
                  <p className="text-sm text-accent-foreground mb-3">
                    5 leads scored above 90 points and should be contacted immediately:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• David Wilson (95 pts) - ATPL candidate with £40K budget</li>
                    <li>• Sarah Connor (92 pts) - Military background, serious about CPL</li>
                    <li>• James Mitchell (87 pts) - Well-funded PPL prospect</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Trending Insights</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 📈 Referral leads show 23% higher conversion rate</li>
                    <li>• 🎯 London-based leads have highest budget allocation</li>
                    <li>• ⚡ Weekend inquiry response time critical for PPL prospects</li>
                    <li>• 💼 Military background leads 3x more likely to pursue CPL</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-medium mb-2">Scoring Factors</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Budget vs Course Cost:</span>
                          <span className="font-medium">35%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location Accessibility:</span>
                          <span className="font-medium">25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Response Speed:</span>
                          <span className="font-medium">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Goal Clarity:</span>
                          <span className="font-medium">20%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-medium mb-2">Recommendations</h5>
                      <div className="space-y-2 text-sm">
                        <p>• Focus weekend availability messaging for PPL leads</p>
                        <p>• Highlight career progression for military backgrounds</p>
                        <p>• Create location-specific pricing packages</p>
                        <p>• Implement 2-hour response SLA for high-score leads</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}