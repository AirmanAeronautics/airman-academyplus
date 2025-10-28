// Report Template Definitions for AIRMAN Academy+

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  reportType: string;
  columns: string[];
  filters?: string[];
  aggregations?: string[];
  regulatoryAuthority?: string;
  requiredFields?: string[];
  dateFormat?: string;
  timeFormat?: string;
}

export const REPORT_TEMPLATES: Record<string, ReportTemplate> = {
  FLIGHT_HOURS_STUDENT: {
    id: 'flight_hours_student',
    name: 'Flight Hours by Student',
    description: 'Detailed breakdown of flight hours per student',
    reportType: 'flight_hours',
    columns: [
      'Student Name',
      'Total Hours',
      'Solo Hours',
      'Dual Hours',
      'Cross Country Hours',
      'Night Hours',
      'Instrument Hours',
      'Course',
      'Status'
    ],
    filters: ['dateRange', 'course', 'status', 'instructor'],
    aggregations: ['sum', 'average', 'count']
  },
  
  FLIGHT_HOURS_INSTRUCTOR: {
    id: 'flight_hours_instructor',
    name: 'Flight Hours by Instructor',
    description: 'Instructor workload and teaching hours',
    reportType: 'flight_hours',
    columns: [
      'Instructor Name',
      'Total Hours',
      'Number of Students',
      'Average Hours per Student',
      'Most Common Aircraft',
      'Utilization Rate'
    ],
    filters: ['dateRange', 'status'],
    aggregations: ['sum', 'average', 'count']
  },

  FLIGHT_HOURS_AIRCRAFT: {
    id: 'flight_hours_aircraft',
    name: 'Aircraft Utilization Report',
    description: 'Aircraft usage and maintenance tracking',
    reportType: 'operations',
    columns: [
      'Aircraft Registration',
      'Type',
      'Total Hours',
      'Flight Count',
      'Average Duration',
      'Utilization %',
      'Maintenance Due',
      'Status'
    ],
    filters: ['dateRange', 'aircraftType', 'status'],
    aggregations: ['sum', 'average', 'count']
  },

  ATTENDANCE_TRACKING: {
    id: 'attendance_tracking',
    name: 'Attendance & Renewals',
    description: 'Student/instructor attendance and compliance tracking',
    reportType: 'attendance',
    columns: [
      'Name',
      'Role',
      'Last Flight',
      'Medical Expiry',
      'License Expiry',
      'Currency Status',
      'Missed Sessions',
      'Attendance Rate %'
    ],
    filters: ['dateRange', 'role', 'status']
  },

  COMPLIANCE_SCORECARD: {
    id: 'compliance_scorecard',
    name: 'Compliance Status Report',
    description: 'Overview of all compliance requirements',
    reportType: 'compliance',
    columns: [
      'Person',
      'Role',
      'Medical Status',
      'License Status',
      'Endorsements',
      'Expiring Soon',
      'Overdue Items',
      'Compliance Score %'
    ],
    filters: ['role', 'status']
  },

  FINANCIAL_SUMMARY: {
    id: 'financial_summary',
    name: 'Financial Summary Report',
    description: 'Revenue, invoices, and payment tracking',
    reportType: 'financial',
    columns: [
      'Student',
      'Course',
      'Total Billed',
      'Total Paid',
      'Outstanding',
      'Last Payment',
      'Payment Status',
      'Days Overdue'
    ],
    filters: ['dateRange', 'status', 'course']
  },

  DGCA_FLIGHT_LOG: {
    id: 'dgca_flight_log',
    name: 'DGCA Flight Log Export',
    description: 'CAR-compliant flight log for DGCA India',
    reportType: 'regulatory',
    regulatoryAuthority: 'DGCA',
    requiredFields: [
      'Date',
      'Aircraft Type',
      'Aircraft Registration',
      'Pilot Name',
      'Co-Pilot/Instructor',
      'Departure',
      'Arrival',
      'Takeoff Time',
      'Landing Time',
      'Total Time',
      'PIC Time',
      'Co-Pilot Time',
      'Dual Time',
      'Instrument Time',
      'Night Time',
      'Cross Country',
      'Landings Day',
      'Landings Night',
      'Remarks'
    ],
    columns: [
      'Date',
      'Aircraft Type',
      'Registration',
      'Pilot',
      'Instructor',
      'Departure',
      'Arrival',
      'Takeoff',
      'Landing',
      'Total',
      'PIC',
      'Dual',
      'Instrument',
      'Night',
      'XC',
      'Landings',
      'Remarks'
    ],
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24hr'
  },

  FAA_FLIGHT_LOG: {
    id: 'faa_flight_log',
    name: 'FAA Flight Log Export',
    description: 'AC 61-65H compliant logbook for FAA USA',
    reportType: 'regulatory',
    regulatoryAuthority: 'FAA',
    requiredFields: [
      'Date',
      'Aircraft Make/Model',
      'Aircraft ID',
      'Route (From-To)',
      'Total Duration',
      'Airplane SEL',
      'Cross Country',
      'Night',
      'Actual Instrument',
      'Simulated Instrument',
      'PIC',
      'Solo',
      'Dual Received',
      'Day Landings',
      'Night Landings',
      'Instructor Name',
      'Remarks/Endorsements'
    ],
    columns: [
      'Date',
      'Make/Model',
      'Aircraft ID',
      'Route',
      'Duration',
      'SEL',
      'XC',
      'Night',
      'Actual Inst',
      'Sim Inst',
      'PIC',
      'Solo',
      'Dual',
      'Day Ldg',
      'Night Ldg',
      'Instructor',
      'Remarks'
    ],
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12hr'
  },

  EASA_FLIGHT_LOG: {
    id: 'easa_flight_log',
    name: 'EASA Flight Log Export',
    description: 'Part-FCL compliant logbook for EASA Europe',
    reportType: 'regulatory',
    regulatoryAuthority: 'EASA',
    requiredFields: [
      'Date',
      'Type',
      'Registration',
      'PIC Name',
      'Departure',
      'Arrival',
      'Departure Time',
      'Arrival Time',
      'SE Time',
      'ME Time',
      'MCC Time',
      'Total Time',
      'PIC Name',
      'Landings',
      'Operational Condition Time',
      'Pilot Function Time',
      'Synthetic Training Devices',
      'Remarks and Endorsements'
    ],
    columns: [
      'Date',
      'Type',
      'Reg',
      'PIC',
      'From',
      'To',
      'Dep Time',
      'Arr Time',
      'SE',
      'ME',
      'Total',
      'Landings',
      'PIC Time',
      'Co-Pilot',
      'Dual',
      'Instructor',
      'Remarks'
    ],
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24hr'
  },

  CAA_FLIGHT_LOG: {
    id: 'caa_flight_log',
    name: 'CAA Flight Log Export',
    description: 'ANO-compliant logbook for CAA UK',
    reportType: 'regulatory',
    regulatoryAuthority: 'CAA',
    requiredFields: [
      'Date',
      'Aircraft Type',
      'Aircraft Registration',
      'Pilot Name',
      'Captain Name',
      'Place of Departure',
      'Place of Arrival',
      'Time of Departure',
      'Time of Arrival',
      'Hours Flown',
      'Landings',
      'Remarks'
    ],
    columns: [
      'Date',
      'Type',
      'Registration',
      'Pilot',
      'Captain',
      'From',
      'To',
      'Dep',
      'Arr',
      'Hours',
      'Landings',
      'Remarks'
    ],
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24hr'
  },

  CASA_FLIGHT_LOG: {
    id: 'casa_flight_log',
    name: 'CASA Flight Log Export',
    description: 'CASR-compliant logbook for CASA Australia',
    reportType: 'regulatory',
    regulatoryAuthority: 'CASA',
    requiredFields: [
      'Date',
      'Aircraft Type',
      'Aircraft Registration',
      'Flight Crew',
      'Departure Point',
      'Arrival Point',
      'Departure Time',
      'Arrival Time',
      'Flight Time',
      'PIC',
      'Co-Pilot',
      'Dual',
      'Instructor',
      'Command',
      'Day/Night',
      'IFR/VFR',
      'Remarks'
    ],
    columns: [
      'Date',
      'Type',
      'Rego',
      'Crew',
      'From',
      'To',
      'Dep',
      'Arr',
      'Time',
      'PIC',
      'Co-Pilot',
      'Dual',
      'Command',
      'Day/Night',
      'IFR/VFR',
      'Remarks'
    ],
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24hr'
  }
};

export const getTemplateById = (id: string): ReportTemplate | undefined => {
  return REPORT_TEMPLATES[id];
};

export const getTemplatesByType = (reportType: string): ReportTemplate[] => {
  return Object.values(REPORT_TEMPLATES).filter(
    template => template.reportType === reportType
  );
};

export const getRegulatoryTemplates = (): ReportTemplate[] => {
  return Object.values(REPORT_TEMPLATES).filter(
    template => template.reportType === 'regulatory'
  );
};
