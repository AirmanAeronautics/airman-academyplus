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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-4 w-4" />
          Regulatory Export
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-3">
          <div className="text-4xl">{userAuthorityConfig.flag}</div>
          <div>
            <h3 className="font-bold text-lg">{userAuthorityConfig.code}</h3>
            <p className="text-xs text-muted-foreground">{userAuthorityConfig.name}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {userAuthorityConfig.format}
          </Badge>
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => handleExport(userAuthorityConfig.code)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Download className="h-3 w-3 mr-2 animate-pulse" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-3 w-3 mr-2" />
                Export Records
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
