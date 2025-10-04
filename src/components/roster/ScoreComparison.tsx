import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreResult } from '@/hooks/useRosterScoring';
import { ArrowRight, Trophy } from 'lucide-react';

interface ScoreComparisonProps {
  scoreA: ScoreResult;
  scoreB: ScoreResult;
  labelA?: string;
  labelB?: string;
}

export const ScoreComparison = ({ 
  scoreA, 
  scoreB, 
  labelA = 'Option A', 
  labelB = 'Option B' 
}: ScoreComparisonProps) => {
  const winner = scoreA.total_score > scoreB.total_score ? 'a' : 
                 scoreB.total_score > scoreA.total_score ? 'b' : 'tie';
  
  const difference = Math.abs(scoreA.total_score - scoreB.total_score);

  const dimensionLabels = {
    weather_fit: 'Weather',
    instructor_balance: 'Instructor',
    travel_min: 'Travel',
    aircraft_utilization: 'Aircraft',
    student_continuity: 'Continuity',
    cancellation_risk: 'Risk',
  };

  const renderDiff = (a: number, b: number) => {
    const diff = a - b;
    if (Math.abs(diff) < 0.05) return '=';
    if (diff > 0) return `+${(diff * 100).toFixed(0)}%`;
    return `${(diff * 100).toFixed(0)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Score Comparison</span>
          {winner !== 'tie' && (
            <Badge variant="default" className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {winner === 'a' ? labelA : labelB} wins
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Scores */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="text-center flex-1">
            <div className="text-sm text-muted-foreground mb-1">{labelA}</div>
            <div className="text-2xl font-bold">
              {(scoreA.total_score * 100).toFixed(0)}%
            </div>
          </div>
          <ArrowRight className="mx-4 text-muted-foreground" />
          <div className="text-center flex-1">
            <div className="text-sm text-muted-foreground mb-1">{labelB}</div>
            <div className="text-2xl font-bold">
              {(scoreB.total_score * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium mb-2">Dimension Breakdown</div>
          {Object.entries(scoreA.breakdown).map(([key, valueA]) => {
            const valueB = scoreB.breakdown[key as keyof typeof scoreB.breakdown];
            const label = dimensionLabels[key as keyof typeof dimensionLabels];
            
            return (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <div className="flex items-center gap-3">
                  <span className={valueA >= valueB ? 'text-green-600' : 'text-muted-foreground'}>
                    {(valueA * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                    {renderDiff(valueA, valueB)}
                  </span>
                  <span className={valueB >= valueA ? 'text-green-600' : 'text-muted-foreground'}>
                    {(valueB * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground text-center">
          Overall difference: {(difference * 100).toFixed(1)}%
        </div>
      </CardContent>
    </Card>
  );
};
