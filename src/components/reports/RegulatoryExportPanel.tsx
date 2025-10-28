import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { useRegulatoryExport, RegulatoryAuthority } from '@/hooks/useRegulatoryExport';
import { useAuth } from '@/hooks/useAuth';

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

// Map aviation regions to regulatory authorities
const REGION_TO_AUTHORITY: Record<string, RegulatoryAuthority> = {
  'faa': 'FAA',
  'easa': 'EASA',
  'uk_caa': 'CAA',
  'dgca_india': 'DGCA',
  'casa_australia': 'CASA',
};

export const RegulatoryExportPanel = () => {
  const { exportToAuthority, isLoading } = useRegulatoryExport();
  const { profile } = useAuth();
  const [exportingAuthority, setExportingAuthority] = useState<string | null>(null);
  
  // Get user's regulatory authority based on aviation region
  const userAuthority = profile?.aviation_region 
    ? REGION_TO_AUTHORITY[profile.aviation_region] || 'FAA'
    : 'FAA';
  
  // Find the user's authority configuration
  const userAuthorityConfig = AUTHORITIES.find(auth => auth.code === userAuthority);

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

  if (!userAuthorityConfig) {
    return (
      <Card className="aviation-card">
        <CardContent className="p-6">
          <p className="text-muted-foreground">No regulatory authority configured for your region.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="aviation-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Regulatory Export
        </CardTitle>
        <CardDescription>
          Export flight logs for {userAuthorityConfig.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">{userAuthorityConfig.flag}</div>
            <h3 className="font-bold text-2xl mb-2">{userAuthorityConfig.code}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {userAuthorityConfig.name}
            </p>
            <Badge variant="outline" className="mb-4">
              {userAuthorityConfig.format}
            </Badge>
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => handleExport(userAuthorityConfig.code)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-pulse" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Flight Records
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Exports last 12 months of flight data in {userAuthorityConfig.format} format as required by {userAuthorityConfig.name}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
