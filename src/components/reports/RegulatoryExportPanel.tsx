import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { useRegulatoryExport, RegulatoryAuthority } from '@/hooks/useRegulatoryExport';

interface AuthorityConfig {
  code: RegulatoryAuthority;
  name: string;
  flag: string;
  format: string;
}

const AUTHORITIES: AuthorityConfig[] = [
  { code: 'DGCA', name: 'India', flag: '🇮🇳', format: 'CAR Compliant' },
  { code: 'FAA', name: 'USA', flag: '🇺🇸', format: 'AC 61-65H' },
  { code: 'EASA', name: 'Europe', flag: '🇪🇺', format: 'Part-FCL' },
  { code: 'CAA', name: 'UK', flag: '🇬🇧', format: 'ANO Format' },
  { code: 'CASA', name: 'Australia', flag: '🇦🇺', format: 'CASR' }
];

export const RegulatoryExportPanel = () => {
  const { exportToAuthority, isLoading } = useRegulatoryExport();
  const [exportingAuthority, setExportingAuthority] = useState<string | null>(null);

  const handleExport = async (authority: RegulatoryAuthority) => {
    setExportingAuthority(authority);
    
    // Get date range (last 12 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    await exportToAuthority(authority, {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });

    setExportingAuthority(null);
  };

  return (
    <Card className="aviation-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Regulatory Authority Exports
        </CardTitle>
        <CardDescription>
          One-click compliant reports for aviation authorities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {AUTHORITIES.map(authority => (
            <Card key={authority.code} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="text-5xl mb-3">{authority.flag}</div>
                <h3 className="font-bold text-lg mb-1">{authority.code}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {authority.name}
                </p>
                <Badge variant="outline" className="mb-3 text-xs">
                  {authority.format}
                </Badge>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleExport(authority.code)}
                  disabled={isLoading && exportingAuthority === authority.code}
                >
                  {isLoading && exportingAuthority === authority.code ? (
                    <>
                      <Download className="h-3 w-3 mr-1 animate-pulse" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Exports include the last 12 months of flight data formatted 
            according to each authority's specific requirements. For custom date ranges, use the 
            Report Generator above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
