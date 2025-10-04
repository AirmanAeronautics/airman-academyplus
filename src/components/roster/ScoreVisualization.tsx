import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScoreResult } from '@/hooks/useRosterScoring';
import { 
  Cloud, 
  Users, 
  MapPin, 
  Plane, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';

interface ScoreVisualizationProps {
  score: ScoreResult;
  showDetails?: boolean;
}

export const ScoreVisualization = ({ score, showDetails = true }: ScoreVisualizationProps) => {
  const dimensionIcons = {
    weather_fit: Cloud,
    instructor_balance: Users,
    travel_min: MapPin,
    aircraft_utilization: Plane,
    student_continuity: TrendingUp,
    cancellation_risk: AlertTriangle,
  };

  const dimensionLabels = {
    weather_fit: 'Weather Fit',
    instructor_balance: 'Instructor Balance',
    travel_min: 'Travel Distance',
    aircraft_utilization: 'Aircraft Utilization',
    student_continuity: 'Student Continuity',
    cancellation_risk: 'Cancellation Risk',
  };

  const getScoreColor = (value: number) => {
    if (value >= 0.8) return 'text-green-600';
    if (value >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (value: number): 'default' | 'secondary' | 'destructive' => {
    if (value >= 0.8) return 'default';
    if (value >= 0.6) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assignment Score</CardTitle>
          <Badge variant={getScoreBadgeVariant(score.total_score)} className="text-lg">
            {(score.total_score * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showDetails && (
          <div className="space-y-3">
            {Object.entries(score.breakdown).map(([key, value]) => {
              const Icon = dimensionIcons[key as keyof typeof dimensionIcons];
              const label = dimensionLabels[key as keyof typeof dimensionLabels];
              
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                    <span className={getScoreColor(value)}>
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={value * 100} className="h-2" />
                </div>
              );
            })}
          </div>
        )}
        
        <div className="pt-2 border-t text-xs text-muted-foreground">
          Computed {new Date(score.computed_at).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};
