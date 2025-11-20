import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CSVExporter } from '@/lib/exports';
import { REPORT_TEMPLATES } from '@/lib/reportTemplates';

export type RegulatoryAuthority = 'DGCA' | 'FAA' | 'EASA' | 'CAA' | 'CASA';

export interface DateRange {
  start: string;
  end: string;
}

export interface ExportOptions {
  studentId?: string;
  instructorId?: string;
  aircraftId?: string;
}

export const useRegulatoryExport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const exportToAuthority = async (
    authority: RegulatoryAuthority,
    dateRange: DateRange,
    options?: ExportOptions
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Get template for authority
      const templateKey = `${authority}_FLIGHT_LOG`;
      const template = REPORT_TEMPLATES[templateKey];

      if (!template) {
        throw new Error(`Template not found for ${authority}`);
      }

      // Mock data for demo - in production, this would fetch from the database
      const mockFlightData = [
        {
          'Date': '14/08/2024',
          'Aircraft Type': 'C172',
          'Registration': 'G-AIRM',
          'Pilot': 'Sarah Mitchell',
          'Instructor': 'Capt. James Wilson',
          'Departure': 'EGKB',
          'Arrival': 'EGKB',
          'Takeoff': '09:15',
          'Landing': '10:45',
          'Total': '1.5',
          'PIC': '0.0',
          'Dual': '1.5',
          'Instrument': '0.0',
          'Night': '0.0',
          'XC': 'No',
          'Landings': '3',
          'Remarks': 'General handling practice, satisfactory progress'
        }
      ];

      // Format according to authority requirements
      const formattedData = formatForAuthority(mockFlightData, authority);

      // Generate filename
      const filename = `${authority}_Flight_Log_${dateRange.start}_to_${dateRange.end}.csv`;

      // Export CSV
      CSVExporter.downloadCSV(formattedData, filename, template.columns);

      toast({
        title: 'Export Successful',
        description: `${authority} flight log exported in compliant format`
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export regulatory report',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const validateExportData = (data: any[], authority: RegulatoryAuthority): boolean => {
    const templateKey = `${authority}_FLIGHT_LOG`;
    const template = REPORT_TEMPLATES[templateKey];

    if (!template || !template.requiredFields) return false;

    // Check if all required fields are present
    for (const field of template.requiredFields) {
      if (!data.every(row => field in row)) {
        return false;
      }
    }

    return true;
  };

  const formatForAuthority = (data: any[], authority: RegulatoryAuthority): any[] => {
    // Authority-specific formatting rules
    switch (authority) {
      case 'DGCA':
        return data.map(row => ({
          ...row,
          // DGCA specific: Date format DD/MM/YYYY, 24-hour time
          Date: formatDate(row.Date, 'DD/MM/YYYY'),
          'Cross Country': row.XC === 'Yes' ? 'X' : ''
        }));
      
      case 'FAA':
        return data.map(row => ({
          ...row,
          // FAA specific: Date format MM/DD/YYYY, decimal hours
          Date: formatDate(row.Date, 'MM/DD/YYYY'),
          Duration: parseFloat(row.Total).toFixed(1),
          'Day Ldg': row.Landings || '0',
          'Night Ldg': '0'
        }));
      
      case 'EASA':
        return data.map(row => ({
          ...row,
          // EASA specific: Part-FCL format requirements
          'SE': row.Total, // Single engine time
          'ME': '0.0', // Multi engine time
          'Landings': row.Landings
        }));
      
      case 'CAA':
        return data.map(row => ({
          ...row,
          // CAA UK specific: ANO format
          'Hours': parseFloat(row.Total).toFixed(2)
        }));
      
      case 'CASA':
        return data.map(row => ({
          ...row,
          // CASA Australia specific: CASR format
          'Rego': row.Registration,
          'Day/Night': 'Day',
          'IFR/VFR': 'VFR',
          'Command': row.PIC > 0 ? 'Yes' : 'No'
        }));
      
      default:
        return data;
    }
  };

  const formatDate = (dateStr: string, format: string): string => {
    // Simple date formatter - in production, use a library like date-fns
    try {
      const parts = dateStr.split('/');
      if (format === 'DD/MM/YYYY') {
        return dateStr;
      } else if (format === 'MM/DD/YYYY') {
        return `${parts[1]}/${parts[0]}/${parts[2]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const supportedAuthorities: RegulatoryAuthority[] = ['DGCA', 'FAA', 'EASA', 'CAA', 'CASA'];

  return {
    exportToAuthority,
    validateExportData,
    supportedAuthorities,
    isLoading
  };
};
