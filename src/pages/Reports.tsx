import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportGenerator } from '@/components/reports/ReportGenerator';
import { RegulatoryExportPanel } from '@/components/reports/RegulatoryExportPanel';
import { useReports, ReportHistoryItem } from '@/hooks/useReports';
import { 
  FileText, 
  Clock, 
  Users, 
  Shield, 
  DollarSign, 
  Plane,
  Calendar,
  Download,
  Plus,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Reports() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('flight_hours');
  const [selectedReportName, setSelectedReportName] = useState('Custom Report');
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [scheduledReports, setScheduledReports] = useState<any[]>([]);

  const { getReportHistory, getScheduledReports, generateReport } = useReports();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const historyData = await getReportHistory(5);
    setHistory(historyData);

    const scheduledData = await getScheduledReports();
    setScheduledReports(scheduledData);
  };

  const handleQuickExport = async (reportType: string, reportName: string) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    await generateReport({
      reportType,
      reportName,
      dateRangeStart: startDate.toISOString().split('T')[0],
      dateRangeEnd: endDate.toISOString().split('T')[0],
      format: 'csv'
    });

    loadData();
  };

  const handleConfigureReport = (reportType: string, reportName: string) => {
    setSelectedReportType(reportType);
    setSelectedReportName(reportName);
    setShowGenerator(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Data that does the work
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadData()}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowGenerator(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Quick Reports Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Quick Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReportCard
              icon={<Clock className="h-5 w-5" />}
              title="Flight Hours"
              description="Hours by student, instructor, or aircraft"
              onExport={() => handleQuickExport('flight_hours', 'Flight Hours Report')}
              onConfigure={() => handleConfigureReport('flight_hours', 'Flight Hours Report')}
            />

            <ReportCard
              icon={<Users className="h-5 w-5" />}
              title="Attendance"
              description="Session attendance and renewals"
              onExport={() => handleQuickExport('attendance', 'Attendance Report')}
              onConfigure={() => handleConfigureReport('attendance', 'Attendance Report')}
            />

            <ReportCard
              icon={<Shield className="h-5 w-5" />}
              title="Compliance"
              description="Document expiry and status"
              onExport={() => handleQuickExport('compliance', 'Compliance Report')}
              onConfigure={() => handleConfigureReport('compliance', 'Compliance Report')}
            />

            <ReportCard
              icon={<DollarSign className="h-5 w-5" />}
              title="Financial"
              description="Revenue and payment tracking"
              onExport={() => handleQuickExport('financial', 'Financial Summary')}
              onConfigure={() => handleConfigureReport('financial', 'Financial Summary')}
            />

            <ReportCard
              icon={<Plane className="h-5 w-5" />}
              title="Operations"
              description="Aircraft utilization and maintenance"
              onExport={() => handleQuickExport('operations', 'Operations Report')}
              onConfigure={() => handleConfigureReport('operations', 'Operations Report')}
            />

            <ReportCard
              icon={<FileText className="h-5 w-5" />}
              title="Custom Report"
              description="Build your own report"
              onExport={() => setShowGenerator(true)}
              onConfigure={() => setShowGenerator(true)}
            />
          </div>
        </div>

        <Separator />

        {/* Regulatory Exports */}
        <RegulatoryExportPanel />

        <Separator />

        {/* Recent Reports */}
        <Card className="aviation-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription>
              Your recently generated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No reports generated yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowGenerator(true)}
                >
                  Generate Your First Report
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((report) => (
                  <Card key={report.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{report.report_name}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {formatDistanceToNow(new Date(report.generated_at), { addSuffix: true })}
                            </Badge>
                            {report.row_count && (
                              <Badge variant="outline" className="text-xs">
                                {report.row_count} rows
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs uppercase">
                              {report.file_format || 'CSV'}
                            </Badge>
                            {report.file_size_kb && (
                              <Badge variant="outline" className="text-xs">
                                {report.file_size_kb} KB
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        {scheduledReports.length > 0 && (
          <Card className="aviation-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduled Reports
              </CardTitle>
              <CardDescription>
                Automated report generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledReports.map((schedule) => (
                  <Card key={schedule.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{schedule.schedule_name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Next run: {schedule.next_run_at ? 
                              formatDistanceToNow(new Date(schedule.next_run_at), { addSuffix: true }) : 
                              'Not scheduled'
                            }
                          </p>
                          {schedule.recipients && schedule.recipients.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Recipients: {schedule.recipients.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="ghost">Pause</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ReportGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
        defaultReportType={selectedReportType}
        defaultReportName={selectedReportName}
      />
    </AppLayout>
  );
}
