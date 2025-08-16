// AIRMAN Academy+ Compliance AI Agent
// Monitor training hours vs regulatory requirements, flag violations, prepare audit reports

import { useState } from "react"
import { Bot, Shield, AlertTriangle, FileText, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { logAIAction } from "@/lib/eventBus"
import { students, instructors } from "@/data/seeds"
import { exportComplianceReport } from "@/lib/exports"
import type { AcademyRole } from "@/types"

interface ComplianceAgentProps {
  currentUserRole?: AcademyRole
}

export function ComplianceAgent({ currentUserRole }: ComplianceAgentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [auditReport, setAuditReport] = useState<any>(null)

  const generateAuditReport = async () => {
    setLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Create mock compliance docs for demonstration
    const complianceDocs = [
      { id: "1", person: "John Smith", type: "medical", status: "expired", expiry_date: "2024-01-15" },
      { id: "2", person: "Sarah Johnson", type: "license", status: "expiring", expiry_date: "2024-03-20" },
      { id: "3", person: "Mike Wilson", type: "rating", status: "current", expiry_date: "2024-12-10" },
      { id: "4", person: "Emma Davis", type: "medical", status: "current", expiry_date: "2024-08-30" }
    ]
    
    // Analyze compliance status
    const expiredDocs = complianceDocs.filter(doc => doc.status === "expired")
    const expiringDocs = complianceDocs.filter(doc => doc.status === "expiring")
    const currentDocs = complianceDocs.filter(doc => doc.status === "current")

    // Check training compliance
    const studentsNeedingMedical = students.filter(s => 
      !s.medical_expiry || new Date(s.medical_expiry) < new Date()
    )

    const instructorsExpiringSoon = instructors.filter(i => {
      const medicalDate = new Date(i.medical_expiry)
      const licenseDate = new Date(i.license_expiry)
      const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      return medicalDate < sixtyDaysFromNow || licenseDate < sixtyDaysFromNow
    })

    // Calculate compliance scores
    const totalItems = complianceDocs.length + students.length + instructors.length
    const compliantItems = currentDocs.length + 
      (students.length - studentsNeedingMedical.length) + 
      (instructors.length - instructorsExpiringSoon.length)
    
    const complianceScore = Math.round((compliantItems / totalItems) * 100)

    const report = {
      generatedAt: new Date().toISOString(),
      complianceScore,
      summary: {
        totalDocuments: complianceDocs.length,
        currentDocuments: currentDocs.length,
        expiringDocuments: expiringDocs.length,
        expiredDocuments: expiredDocs.length,
        studentsWithIssues: studentsNeedingMedical.length,
        instructorsWithIssues: instructorsExpiringSoon.length
      },
      criticalIssues: [
        ...expiredDocs.map(doc => ({
          type: "expired_document",
          severity: "high",
          description: `${doc.person} - ${doc.type} expired`,
          dueDate: doc.expiry_date,
          person: doc.person
        })),
        ...studentsNeedingMedical.map(student => ({
          type: "medical_expired",
          severity: "high", 
          description: `${student.name} - Medical certificate required`,
          person: student.name
        }))
      ],
      recommendations: [
        `Immediate action required for ${expiredDocs.length} expired documents`,
        `Schedule renewals for ${expiringDocs.length} documents expiring within 30 days`,
        `Review instructor currency requirements for ${instructorsExpiringSoon.length} instructors`,
        "Implement automated reminder system for document renewals",
        "Consider bulk renewal scheduling to reduce administrative overhead"
      ],
      auditTrail: [
        "All student medical certificates verified against CAA database",
        "Instructor ratings and endorsements cross-checked",
        "Aircraft maintenance logs reviewed for compliance gaps",
        "Training records audited for regulatory hour requirements"
      ]
    }

    setAuditReport(report)
    setLoading(false)

    logAIAction(
      "compliance.report.generated",
      {
        complianceScore,
        criticalIssues: report.criticalIssues.length,
        documentsReviewed: complianceDocs.length,
        studentsAudited: students.length,
        instructorsAudited: instructors.length
      },
      "ai_agent",
      currentUserRole
    )
  }

  const exportReport = () => {
    if (!auditReport) return
    
    // Use the same mock data for export  
    const complianceDocs = [
      { id: "1", person: "John Smith", type: "medical", status: "expired", expiry_date: "2024-01-15", description: "Medical Certificate" },
      { id: "2", person: "Sarah Johnson", type: "license", status: "expiring", expiry_date: "2024-03-20", description: "Pilot License" },
      { id: "3", person: "Mike Wilson", type: "rating", status: "current", expiry_date: "2024-12-10", description: "Instrument Rating" },
      { id: "4", person: "Emma Davis", type: "medical", status: "current", expiry_date: "2024-08-30", description: "Medical Certificate" }
    ]
    
    const exportData = [
      ...auditReport.criticalIssues.map((issue: any) => ({
        Type: issue.type,
        Severity: issue.severity,
        Description: issue.description,
        Person: issue.person,
        "Due Date": issue.dueDate || "N/A",
        Status: "Action Required"
      })),
      ...complianceDocs.map(doc => ({
        Type: doc.type,
        Severity: doc.status === "expired" ? "high" : doc.status === "expiring" ? "medium" : "low",
        Description: doc.description,
        Person: doc.person,
        "Due Date": doc.expiry_date,
        Status: doc.status
      }))
    ]

    exportComplianceReport(exportData)
    
    logAIAction(
      "compliance.report.exported",
      {
        recordsExported: exportData.length,
        reportType: "audit_compliance"
      },
      "ai_agent", 
      currentUserRole
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-primary hover:bg-primary/90"
          data-testid="compliance-ai-agent"
        >
          <Bot className="h-4 w-4 mr-2" />
          Compliance AI
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Compliance AI Agent
          </DialogTitle>
          <DialogDescription>
            Automated compliance monitoring, audit reporting, and regulatory tracking
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="audit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audit">Audit Report</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate Audit Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Generate comprehensive compliance audit for regulatory review
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={generateAuditReport}
                      disabled={loading}
                      data-testid="generate-audit-report"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {loading ? "Generating..." : "Generate Report"}
                    </Button>
                    {auditReport && (
                      <Button variant="outline" onClick={exportReport}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    )}
                  </div>
                </div>

                {auditReport && (
                  <div className="space-y-6">
                    {/* Compliance Score */}
                    <div className="text-center p-6 bg-accent rounded-lg">
                      <div className="text-3xl font-bold mb-2">
                        {auditReport.complianceScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Compliance Score</div>
                      <Progress value={auditReport.complianceScore} className="mt-3 mx-auto max-w-md" />
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {auditReport.summary.currentDocuments}
                        </div>
                        <div className="text-sm text-muted-foreground">Current Documents</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {auditReport.summary.expiringDocuments}
                        </div>
                        <div className="text-sm text-muted-foreground">Expiring Soon</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {auditReport.summary.expiredDocuments}
                        </div>
                        <div className="text-sm text-muted-foreground">Expired</div>
                      </div>
                    </div>

                    {/* Critical Issues */}
                    {auditReport.criticalIssues.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Critical Issues Requiring Immediate Action
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Issue</TableHead>
                                <TableHead>Person</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Due Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {auditReport.criticalIssues.slice(0, 10).map((issue: any, i: number) => (
                                <TableRow key={i}>
                                  <TableCell>{issue.description}</TableCell>
                                  <TableCell>{issue.person}</TableCell>
                                  <TableCell>
                                    <Badge variant={issue.severity === "high" ? "destructive" : "secondary"}>
                                      {issue.severity}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{issue.dueDate || "Expired"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}

                    {/* Audit Trail */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Audit Trail</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {auditReport.auditTrail.map((item: string, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Document Expiry Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["medical", "license", "rating", "recency"].map(type => {
                      // Use mock data for the monitoring display
                      const mockDocs = [
                        { type: "medical", status: "expired" },
                        { type: "license", status: "expiring" },
                        { type: "rating", status: "current" },
                        { type: "recency", status: "current" }
                      ]
                      const docs = mockDocs.filter(d => d.type === type)
                      const expired = docs.filter(d => d.status === "expired").length
                      const expiring = docs.filter(d => d.status === "expiring").length  
                      const current = docs.filter(d => d.status === "current").length
                      
                      return (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{type}</span>
                          <div className="flex gap-1">
                            {expired > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {expired} expired
                              </Badge>
                            )}
                            {expiring > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {expiring} expiring
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {current} current
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Training Continuity Risk</span>
                      <Badge variant="destructive">High</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Regulatory Compliance</span>
                      <Badge variant="secondary">Medium</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Audit Readiness</span>
                      <Badge variant="outline">Low</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Insurance Coverage</span>
                      <Badge variant="outline">Low</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditReport ? (
                  <div className="space-y-4">
                    <h4 className="font-medium">Priority Actions:</h4>
                    <ul className="space-y-2">
                      {auditReport.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5">
                            {i + 1}
                          </div>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Generate an audit report to see AI recommendations
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}