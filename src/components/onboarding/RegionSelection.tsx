import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag, Globe, MapPin } from 'lucide-react';

interface RegionSelectionProps {
  value: string;
  onChange: (region: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const regions = [
  {
    id: 'faa',
    title: 'FAA (United States)',
    description: 'Federal Aviation Administration - United States regulations',
    icon: Flag,
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    countries: ['United States', 'US Territories'],
    certifications: ['Private Pilot License (PPL)', 'Commercial Pilot License (CPL)', 'Airline Transport Pilot License (ATPL)']
  },
  {
    id: 'easa',
    title: 'EASA (Europe)',
    description: 'European Union Aviation Safety Agency regulations',
    icon: Globe,
    color: 'bg-green-500/10 text-green-700 border-green-200',
    countries: ['All EU Member States', 'Norway', 'Iceland', 'Switzerland', 'Liechtenstein'],
    certifications: ['LAPL', 'PPL(A)', 'CPL(A)', 'ATPL(A)', 'MPL']
  },
  {
    id: 'uk_caa',
    title: 'UK CAA (United Kingdom)',
    description: 'United Kingdom Civil Aviation Authority regulations',
    icon: MapPin,
    color: 'bg-red-500/10 text-red-700 border-red-200',
    countries: ['United Kingdom', 'Crown Dependencies'],
    certifications: ['LAPL', 'PPL', 'CPL', 'ATPL', 'MPL']
  },
  {
    id: 'dgca_india',
    title: 'DGCA (India)',
    description: 'Directorate General of Civil Aviation - India regulations',
    icon: Flag,
    color: 'bg-orange-500/10 text-orange-700 border-orange-200',
    countries: ['India'],
    certifications: ['Student Pilot License (SPL)', 'Private Pilot License (PPL)', 'Commercial Pilot License (CPL)', 'Airline Transport Pilot License (ATPL)']
  }
];

export function RegionSelection({ value, onChange, onNext, onBack }: RegionSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Select your aviation region</h3>
        <p className="text-muted-foreground">Choose the regulatory authority that governs your training</p>
      </div>

      <div className="grid gap-4">
        {regions.map((region) => {
          const Icon = region.icon;
          const isSelected = value === region.id;
          
          return (
            <Card 
              key={region.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:bg-muted/50'
              }`}
              onClick={() => onChange(region.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${region.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">{region.title}</h4>
                      {isSelected && <Badge variant="default">Selected</Badge>}
                    </div>
                    <p className="text-muted-foreground">{region.description}</p>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Coverage:</p>
                        <div className="flex flex-wrap gap-1">
                          {region.countries.map((country, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {country}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Certifications:</p>
                        <div className="flex flex-wrap gap-1">
                          {region.certifications.slice(0, 3).map((cert, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                          {region.certifications.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{region.certifications.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!value}
          className="min-w-24"
        >
          Next
        </Button>
      </div>
    </div>
  );
}