import { useState } from "react"
import { Shield, AlertTriangle, FileCheck, Calendar, User, Plane, Bot, Download, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

const expiringDocuments = [
  {
    id: 1,
    type: "instructor",
    name: "Capt. James Miller",
    document: "Flight Instructor Certificate",
    expiryDate: "2024-02-15",
    daysRemaining: 31,
    status: "warning",
    authority: "CAA"
  },
  {
    id: 2,
    type: "aircraft",
    name: "G-ABCD",
    document: "Certificate of Airworthiness",
    expiryDate: "2024-01-28",
    daysRemaining: 13,
    status: "critical",
    authority: "CAA"
  },
  {
    id: 3,
    type: "instructor",
    name: "FI Emma Thompson",
    document: "Medical Certificate",
    expiryDate: "2024-03-10",
    daysRemaining: 55,
    status: "good",
    authority: "CAA AME"
  },
  {
    id: 4,
    type: "organization",
    name: "AIRMAN Academy+",
    document: "AOC Renewal",
    expiryDate: "2024-06-30",
    daysRemaining: 167,
    status: "good",
    authority: "CAA"
  }
]

const regulatoryReports = [
  {
    id: 1,
    title: "Monthly Flight Training Report",
    dueDate: "2024-01-31",
    status: "pending",
    completeness: 85,
    aiGenerated: true
  },
  {
    id: 2,
    title: "Instructor Currency Report",
    dueDate: "2024-02-05",
    status: "draft",
    completeness: 60,
    aiGenerated: false
  },
  {
    id: 3,
    title: "Fleet Maintenance Compliance",
    dueDate: "2024-01-25",
    status: "submitted",
    completeness: 100,
    aiGenerated: true
  }
]

const auditItems = [
  {
    id: 1,
    category: "Training Records",
    status: "compliant",
    lastChecked: "2024-01-10",
    findings: 0,
    aiScore: 98
  },
  {
    id: 2,
    category: "Instructor Qualifications",
    status: "attention",
    lastChecked: "2024-01-12",
    findings: 2,
    aiScore: 85
  },
  {
    id: 3,
    category: "Aircraft Documentation",
    status: "compliant",
    lastChecked: "2024-01-14",
    findings: 0,
    aiScore: 95
  },
  {
    id: 4,
    category: "Safety Management",
    status: "compliant",
    lastChecked: "2024-01-13",
    findings: 0,
    aiScore: 92
  }
]

export default function Compliance() {
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive'
      case 'warning': return 'outline'
      case 'good': return 'default'
      case 'compliant': return 'default'
      case 'attention': return 'outline'
      case 'submitted': return 'default'
      case 'pending': return 'outline'
      case 'draft': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'instructor': return User
      case 'aircraft': return Plane
      case 'organization': return Shield
      default: return FileCheck
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance & Reports</h1>
          <p className="text-muted-foreground mt-1">Monitor regulatory compliance and generate reports</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={showAIAssistant ? 'bg-primary text-primary-foreground' : ''}
          >
            <Bot className="h-4 w-4 mr-2" />
            Compliance Sentinel
          </Button>
          <Button className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* AI Assistant */}
      {showAIAssistant && (
        <Card className="aviation-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Compliance Sentinel AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm font-medium text-accent-foreground">Priority Alert</p>
              <p className="text-sm text-muted-foreground mt-1">
                G-ABCD Certificate of Airworthiness expires in 13 days. Auto-generated renewal forms are ready for review.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" className="bg-primary hover:bg-primary-dark">
                <FileCheck className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Renewal
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">Critical Items</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium">Expiring Soon</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Reports Due</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Compliance Score</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="expiring" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="expiring">Expiring Documents</TabsTrigger>
          <TabsTrigger value="reports">Regulatory Reports</TabsTrigger>
          <TabsTrigger value="audit">Audit Readiness</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="expiring" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Documents Requiring Attention</h3>
              <Button variant="outline" size="sm">
                <Bot className="h-4 w-4 mr-2" />
                Auto-Generate Renewals
              </Button>
            </div>
            
            <div className="space-y-3">
              {expiringDocuments.map((doc) => {
                const StatusIcon = getStatusIcon(doc.type)
                return (
                  <Card key={doc.id} className="aviation-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.document}</p>
                            <p className="text-xs text-muted-foreground">Authority: {doc.authority}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={getStatusColor(doc.status)}>
                            {doc.daysRemaining} days
                          </Badge>
                          <p className="text-sm text-muted-foreground">Exp: {doc.expiryDate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Regulatory Reports</h3>
              <Button variant="outline" size="sm">
                <Bot className="h-4 w-4 mr-2" />
                AI Generate All
              </Button>
            </div>
            
            <div className="space-y-3">
              {regulatoryReports.map((report) => (
                <Card key={report.id} className="aviation-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground">Due: {report.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.aiGenerated && (
                          <Badge variant="outline" className="text-primary border-primary">
                            <Bot className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                        <Badge variant={getStatusColor(report.status)} className="capitalize">
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Completeness:</span>
                        <span className="font-medium">{report.completeness}%</span>
                      </div>
                      <Progress value={report.completeness} className="h-2" />
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <FileCheck className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Audit Readiness Dashboard</h3>
              <Button variant="outline" size="sm">
                <Bot className="h-4 w-4 mr-2" />
                Run Full Audit Check
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditItems.map((item) => (
                <Card key={item.id} className="aviation-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{item.category}</h4>
                      <Badge variant={getStatusColor(item.status)} className="capitalize">
                        {item.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>AI Compliance Score:</span>
                        <span className="font-medium">{item.aiScore}%</span>
                      </div>
                      <Progress value={item.aiScore} className="h-2" />
                      
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Findings: {item.findings}</span>
                        <span>Last checked: {item.lastChecked}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Report Templates</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Monthly Training Report", description: "CAA required monthly training statistics", aiEnabled: true },
                { name: "Incident Report Form", description: "Standard aviation incident reporting", aiEnabled: false },
                { name: "Instructor Currency", description: "Instructor qualification tracking", aiEnabled: true },
                { name: "Maintenance Compliance", description: "Aircraft maintenance status report", aiEnabled: true },
                { name: "Safety Management", description: "SMS quarterly review", aiEnabled: true },
                { name: "Student Progress", description: "Individual student progress tracking", aiEnabled: false }
              ].map((template, idx) => (
                <Card key={idx} className="aviation-card hover:aviation-card-elevated cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{template.name}</h4>
                        {template.aiEnabled && (
                          <Badge variant="outline" className="text-primary border-primary">
                            <Bot className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <Button size="sm" className="w-full mt-2" variant="outline">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}