// AIRMAN Academy+ Export Utilities
// CSV and data export functions for compliance and finance

interface ExportableData {
  [key: string]: string | number | boolean | null | undefined;
}

export class CSVExporter {
  static toCSV(data: ExportableData[], columns?: string[]): string {
    if (data.length === 0) return "";
    
    // Use provided columns or infer from first row
    const headers = columns || Object.keys(data[0]);
    
    // Build CSV content
    const csvRows: string[] = [];
    
    // Header row
    csvRows.push(headers.map(h => this.escapeCSVField(h)).join(","));
    
    // Data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return this.escapeCSVField(String(value ?? ""));
      });
      csvRows.push(values.join(","));
    });
    
    return csvRows.join("\n");
  }
  
  static downloadCSV(data: ExportableData[], filename: string, columns?: string[]): void {
    const csv = this.toCSV(data, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  private static escapeCSVField(field: string): string {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}

// Specific export functions for different modules
export const exportComplianceReport = (docs: any[]) => {
  const exportData = docs.map(doc => ({
    Person: doc.person || "Unknown",
    Type: doc.type,
    Description: doc.description,
    "Expiry Date": doc.expiry_date || doc.expiryDate,
    Status: doc.status,
    "Days Until Expiry": doc.days_until_expiry || doc.daysUntilExpiry,
    Requirements: (doc.requirements || []).join("; ")
  }));
  
  CSVExporter.downloadCSV(
    exportData,
    `compliance-report-${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportFinanceReport = (invoices: any[]) => {
  const exportData = invoices.map(invoice => ({
    "Invoice ID": invoice.id,
    Student: invoice.student,
    Amount: invoice.amount,
    Date: invoice.date,
    "Due Date": invoice.due_date || invoice.dueDate,
    Status: invoice.status,
    Reference: invoice.reference || "",
    "Payment Method": invoice.payment_method || invoice.paymentMethod || ""
  }));
  
  CSVExporter.downloadCSV(
    exportData,
    `finance-report-${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportLeadsReport = (leads: any[]) => {
  const exportData = leads.map(lead => ({
    Name: lead.name,
    Email: lead.email,
    Phone: lead.phone || "",
    Status: lead.status,
    Source: lead.source,
    Goal: lead.goal,
    Budget: lead.budget,
    Value: lead.value,
    Location: lead.location,
    "AI Score": lead.ai_score || lead.aiScore,
    Segment: lead.segment || "",
    "Last Contact": lead.last_contact || lead.lastContact || ""
  }));
  
  CSVExporter.downloadCSV(
    exportData,
    `leads-report-${new Date().toISOString().split('T')[0]}.csv`
  );
};