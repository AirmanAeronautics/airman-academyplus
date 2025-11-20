import { useState } from "react"
import { Download, FileText, Table } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FlightSession } from "@/data/schedule"
import { useToast } from "@/hooks/use-toast"
import { eventBus } from "@/lib/eventBus"
import { useAuthBackend } from "@/hooks/useAuthBackend"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flights: FlightSession[]
  dateRange: string
}

type ExportFormat = "csv" | "pdf"
type ExportType = "schedule" | "compliance" | "operations"

export function ExportDialog({ open, onOpenChange, flights, dateRange }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("csv")
  const [exportType, setExportType] = useState<ExportType>("schedule")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuthBackend()

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (format === "csv") {
        await exportToCSV()
      } else {
        await exportToPDF()
      }

      // Log export action to event bus
      eventBus.push('schedule_exported', {
        format,
        exportType,
        dateRange,
        flightCount: flights.length
      }, user?.id, user?.role)

      toast({
        title: "Export Complete",
        description: `${exportType} report exported as ${format.toUpperCase()}`,
      })
      
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export the schedule. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = async () => {
    const headers = getHeadersForType(exportType)
    const rows = flights.map(flight => getRowDataForType(flight, exportType))
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${exportType}_${dateRange.replace(/\\s/g, '_')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToPDF = async () => {
    // For demo purposes, we'll create a simple HTML-to-PDF conversion
    const htmlContent = generatePDFContent()
    
    // In a real implementation, you'd use a PDF library like jsPDF or html2pdf
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${exportType}_${dateRange.replace(/\\s/g, '_')}.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getHeadersForType = (type: ExportType): string[] => {
    switch (type) {
      case "schedule":
        return ["Date", "Time", "Student", "Instructor", "Aircraft", "Type", "Status", "Location"]
      case "compliance":
        return ["Date", "Time", "Student", "Instructor", "Aircraft", "Type", "Compliance Status", "Notes"]
      case "operations":
        return ["Date", "Time", "Aircraft", "Hours", "Status", "Instructor", "Student", "Type", "Defects"]
      default:
        return []
    }
  }

  const getRowDataForType = (flight: FlightSession, type: ExportType): string[] => {
    const baseData = [
      new Date().toLocaleDateString(), // Using current date for demo
      flight.time,
      flight.student,
      flight.instructor,
      flight.aircraft,
      flight.type,
    ]

    switch (type) {
      case "schedule":
        return [...baseData, flight.status, flight.location || "N/A"]
      case "compliance":
        return [...baseData, flight.status === "completed" ? "Compliant" : "Pending", flight.notes || ""]
      case "operations":
        return [
          new Date().toLocaleDateString(),
          flight.time,
          flight.aircraft,
          "2.0", // Demo flight hours
          flight.status,
          flight.instructor,
          flight.student,
          flight.type,
          flight.conflicts?.join("; ") || "None"
        ]
      default:
        return baseData
    }
  }

  const generatePDFContent = (): string => {
    const headers = getHeadersForType(exportType)
    const rows = flights.map(flight => getRowDataForType(flight, exportType))
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${exportType.toUpperCase()} Report - ${dateRange}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>AIRMAN Academy+ ${exportType.toUpperCase()} Report</h1>
          <h2>${dateRange}</h2>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
          <div class="footer">
            Generated on ${new Date().toLocaleString()} • AIRMAN Academy+ Staff Console
          </div>
        </body>
      </html>
    `
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Schedule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Type</Label>
            <Select value={exportType} onValueChange={(value: ExportType) => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="schedule">Schedule Report</SelectItem>
                <SelectItem value="compliance">Compliance Report</SelectItem>
                <SelectItem value="operations">Operations Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    CSV (Excel)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Document
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <div className="font-medium mb-1">Export Details:</div>
            <div>Date Range: {dateRange}</div>
            <div>Flights: {flights.length} sessions</div>
            <div>Format: {format.toUpperCase()}</div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting} className="gap-2">
              {isExporting ? (
                <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}