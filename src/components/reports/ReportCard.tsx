import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Settings } from 'lucide-react';

interface ReportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  lastGenerated?: string;
  recordCount?: number;
  onExport: () => void;
  onConfigure?: () => void;
}

export const ReportCard = ({
  icon,
  title,
  description,
  lastGenerated,
  recordCount,
  onExport,
  onConfigure
}: ReportCardProps) => {
  return (
    <Card className="aviation-card hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>

        {(lastGenerated || recordCount) && (
          <div className="flex gap-2 mb-4">
            {lastGenerated && (
              <Badge variant="outline" className="text-xs">
                Last: {lastGenerated}
              </Badge>
            )}
            {recordCount && (
              <Badge variant="outline" className="text-xs">
                {recordCount} records
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={onExport} className="flex-1" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {onConfigure && (
            <Button onClick={onConfigure} variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
