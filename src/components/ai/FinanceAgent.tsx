// AIRMAN Academy+ Finance AI Agent  
// Cashflow predictions, overdue invoice alerts, fee reconciliation

import { useState } from "react"
import { Bot, DollarSign, TrendingUp, AlertCircle, Receipt, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { logAIAction, publish } from "@/lib/eventBus"
import { invoices, scheduleEvents, students } from "@/data/seeds"
import { exportFinanceReport } from "@/lib/exports"
import type { AcademyRole, Invoice } from "@/types"

interface FinanceAgentProps {
  currentUserRole?: AcademyRole
  onInvoiceUpdate?: (invoices: Invoice[]) => void
}

export function FinanceAgent({ currentUserRole, onInvoiceUpdate }: FinanceAgentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [generatedInvoices, setGeneratedInvoices] = useState<Invoice[]>([])

  const generateFinanceAnalysis = async () => {
    setLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Calculate financial metrics
    const totalRevenue = invoices
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.amount, 0)

    const pendingRevenue = invoices
      .filter(inv => inv.status === "sent" || inv.status === "draft")
      .reduce((sum, inv) => sum + inv.amount, 0)

    const overdueInvoices = invoices.filter(inv => {
      const dueDate = new Date(inv.due_date)
      return inv.status !== "paid" && dueDate < new Date()
    })

    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0)

    // Monthly projections
    const currentMonth = new Date().getMonth()
    const monthlyRevenue = invoices
      .filter(inv => {
        const invDate = new Date(inv.date)
        return invDate.getMonth() === currentMonth && inv.status === "paid"
      })
      .reduce((sum, inv) => sum + inv.amount, 0)

    // Flight activity analysis for billing
    const recentFlights = scheduleEvents.filter(event => {
      const eventDate = new Date(event.start_time)
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      return eventDate >= threeDaysAgo && event.status === "completed"
    })

    // Cash flow prediction
    const projectedIncome = pendingRevenue * 0.85 // 85% collection rate
    const cashFlowHealth = (totalRevenue + projectedIncome) / (totalRevenue + pendingRevenue + overdueAmount)

    const analysisData = {
      totalRevenue,
      pendingRevenue,
      overdueAmount,
      overdueCount: overdueInvoices.length,
      monthlyRevenue,
      recentFlights: recentFlights.length,
      cashFlowHealth: Math.round(cashFlowHealth * 100),
      projectedIncome,
      collectionRate: 85,
      averageInvoiceValue: Math.round(totalRevenue / invoices.filter(i => i.status === "paid").length),
      daysToCollection: 14,
      riskAlerts: [
        ...(overdueAmount > 5000 ? ["High overdue amount requires immediate action"] : []),
        ...(overdueInvoices.length > 5 ? ["Multiple overdue invoices affecting cash flow"] : []),
        ...(pendingRevenue < monthlyRevenue * 0.5 ? ["Low pending revenue for upcoming month"] : [])
      ]
    }

    setAnalysis(analysisData)
    setLoading(false)

    logAIAction(
      "finance.analysis.generated",
      {
        totalRevenue,
        overdueAmount,
        pendingRevenue,
        cashFlowScore: analysisData.cashFlowHealth
      },
      "ai_agent",
      currentUserRole
    )
  }

  const generateInvoicesFromFlights = async () => {
    const unbilledFlights = scheduleEvents.filter(event => {
      const eventDate = new Date(event.start_time)
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      return eventDate >= threeDaysAgo && 
             event.status === "completed" &&
             !invoices.some(inv => inv.reference?.includes(event.id))
    })

    const newInvoices: Invoice[] = unbilledFlights.map((flight, index) => {
      const student = students.find(s => s.id === flight.student_id)
      const flightDuration = 1.5 // hours
      const hourlyRate = 180 // £/hour
      const flightCost = flightDuration * hourlyRate
      const examinerFee = flight.lesson_type.includes("test") ? 150 : 0
      const landingFee = 25
      
      return {
        id: `inv_${Date.now()}_${index}`,
        org_id: "org_airman_academy",
        campus_id: "campus_main", 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        student_id: flight.student_id,
        amount: flightCost + examinerFee + landingFee,
        date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "draft" as const,
        items: [
          {
            description: `${flight.lesson_type} - ${flightDuration}h`,
            quantity: flightDuration,
            rate: hourlyRate,
            amount: flightCost
          },
          ...(examinerFee > 0 ? [{
            description: "Examiner Fee",
            quantity: 1,
            rate: examinerFee,
            amount: examinerFee
          }] : []),
          {
            description: "Landing Fee", 
            quantity: 1,
            rate: landingFee,
            amount: landingFee
          }
        ],
        reference: `Flight-${flight.id}`,
        payment_method: "bank_transfer"
      }
    })

    setGeneratedInvoices(newInvoices)

    logAIAction(
      "finance.invoices.generated",
      {
        invoiceCount: newInvoices.length,
        totalAmount: newInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        flightsCovered: unbilledFlights.length
      },
      "ai_agent",
      currentUserRole
    )

    // Publish categorized notification
    await publish({
      type: "Finance Invoice Generation",
      message: `AI generated ${newInvoices.length} invoices totaling £${newInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}`,
      metadata: { invoiceCount: newInvoices.length, totalAmount: newInvoices.reduce((sum, inv) => sum + inv.amount, 0) },
      org_id: "org_airman_academy",
      category: "finance"
    })
  }

  const applyGeneratedInvoices = () => {
    if (generatedInvoices.length === 0) return

    const updatedInvoices = [...invoices, ...generatedInvoices]
    onInvoiceUpdate?.(updatedInvoices)
    setGeneratedInvoices([])

    logAIAction(
      "finance.invoices.applied",
      {
        invoicesCreated: generatedInvoices.length,
        totalValue: generatedInvoices.reduce((sum, inv) => sum + inv.amount, 0)
      },
      "ai_agent", 
      currentUserRole
    )
  }

  const exportAnalysis = () => {
    if (!analysis) return

    const exportData = [
      {
        Metric: "Total Revenue",
        Value: analysis.totalRevenue,
        Type: "Revenue",
        Status: "Collected"
      },
      {
        Metric: "Pending Revenue", 
        Value: analysis.pendingRevenue,
        Type: "Revenue",
        Status: "Outstanding"
      },
      {
        Metric: "Overdue Amount",
        Value: analysis.overdueAmount, 
        Type: "Revenue",
        Status: "Overdue"
      },
      ...invoices.map(inv => ({
        Metric: `Invoice ${inv.id}`,
        Value: inv.amount,
        Type: "Invoice",
        Status: inv.status,
        "Due Date": inv.due_date,
        Student: students.find(s => s.id === inv.student_id)?.name || "Unknown"
      }))
    ]

    exportFinanceReport(exportData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-primary hover:bg-primary/90"
          data-testid="finance-ai-agent"
        >
          <Bot className="h-4 w-4 mr-2" />
          Finance AI
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Finance AI Agent
          </DialogTitle>
          <DialogDescription>
            Automated financial analysis, invoice generation, and cash flow management
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Financial Analysis</TabsTrigger>
            <TabsTrigger value="invoicing">Auto Invoicing</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Financial Health Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Analyze current financial position and cash flow health
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={generateFinanceAnalysis}
                      disabled={loading}
                      data-testid="generate-finance-analysis"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {loading ? "Analyzing..." : "Generate Analysis"}
                    </Button>
                    {analysis && (
                      <Button variant="outline" onClick={exportAnalysis}>
                        Export Report
                      </Button>
                    )}
                  </div>
                </div>

                {analysis && (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          £{analysis.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">Total Revenue</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          £{analysis.pendingRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600">Pending</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          £{analysis.overdueAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-red-600">Overdue</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {analysis.cashFlowHealth}%
                        </div>
                        <div className="text-sm text-purple-600">Health Score</div>
                      </div>
                    </div>

                    {/* Cash Flow Health */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Cash Flow Health</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Progress value={analysis.cashFlowHealth} className="h-3" />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Collection Rate:</span>
                              <span className="ml-2 font-medium">{analysis.collectionRate}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Avg Days to Collection:</span>
                              <span className="ml-2 font-medium">{analysis.daysToCollection} days</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Avg Invoice Value:</span>
                              <span className="ml-2 font-medium">£{analysis.averageInvoiceValue}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Projected Income:</span>
                              <span className="ml-2 font-medium">£{analysis.projectedIncome.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Risk Alerts */}
                    {analysis.riskAlerts.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-orange-600">
                            <AlertCircle className="h-5 w-5" />
                            Risk Alerts
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysis.riskAlerts.map((alert: string, i: number) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                {alert}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoicing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Automated Invoice Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Generate invoices from completed flights in the last 3 days
                  </p>
                  <Button 
                    onClick={generateInvoicesFromFlights}
                    data-testid="generate-invoices"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Generate Invoices
                  </Button>
                </div>

                {generatedInvoices.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        Generated {generatedInvoices.length} invoices 
                        (£{generatedInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()})
                      </h4>
                      <Button onClick={applyGeneratedInvoices}>
                        Apply All Invoices
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Due Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedInvoices.slice(0, 5).map(invoice => {
                          const student = students.find(s => s.id === invoice.student_id)
                          return (
                            <TableRow key={invoice.id}>
                              <TableCell>{student?.name || "Unknown"}</TableCell>
                              <TableCell>
                                {invoice.items.map(item => item.description).join(", ")}
                              </TableCell>
                              <TableCell>£{invoice.amount}</TableCell>
                              <TableCell>{invoice.due_date}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>30-Day Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Expected Collections</span>
                        <span className="font-medium">£{analysis.projectedIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Overdue Recovery</span>
                        <span className="font-medium">£{Math.round(analysis.overdueAmount * 0.6).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">New Flight Revenue</span>
                        <span className="font-medium">£{(analysis.recentFlights * 270).toLocaleString()}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-medium">
                        <span>Total Projected</span>
                        <span>£{(analysis.projectedIncome + analysis.overdueAmount * 0.6 + analysis.recentFlights * 270).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Generate analysis to see cash flow projections
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collection Priorities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoices
                      .filter(inv => inv.status !== "paid")
                      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                      .slice(0, 5)
                      .map(invoice => {
                        const isOverdue = new Date(invoice.due_date) < new Date()
                        const student = students.find(s => s.id === invoice.student_id)
                        
                        return (
                          <div key={invoice.id} className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-medium">{student?.name || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">
                                Due: {invoice.due_date}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">£{invoice.amount}</div>
                              <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-xs">
                                {isOverdue ? "Overdue" : "Due"}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}