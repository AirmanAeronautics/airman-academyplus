import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  Shield, 
  Settings, 
  Wrench, 
  FileCheck, 
  Calculator, 
  MessageSquare, 
  Headphones 
} from 'lucide-react';

interface RoleSelectionProps {
  value: string;
  onChange: (role: string) => void;
  onNext: () => void;
}

const roles = [
  {
    id: 'admin',
    title: 'Super Administrator',
    description: 'Full system access, user management, and organizational oversight',
    icon: Shield,
    color: 'bg-purple-500/10 text-purple-700 border-purple-200',
    features: ['Full system access', 'User management', 'Analytics & reports']
  },
  {
    id: 'ops_manager',
    title: 'Operations Manager',
    description: 'Managing daily operations, scheduling, and resource allocation',
    icon: Settings,
    color: 'bg-orange-500/10 text-orange-700 border-orange-200',
    features: ['Operations oversight', 'Resource management', 'Schedule coordination']
  },
  {
    id: 'maintenance_officer',
    title: 'Maintenance Officer',
    description: 'Aircraft maintenance, safety inspections, and compliance tracking',
    icon: Wrench,
    color: 'bg-red-500/10 text-red-700 border-red-200',
    features: ['Maintenance scheduling', 'Safety inspections', 'Compliance tracking']
  },
  {
    id: 'compliance_officer',
    title: 'Compliance Officer',
    description: 'Regulatory compliance, documentation, and audit management',
    icon: FileCheck,
    color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
    features: ['Regulatory compliance', 'Document management', 'Audit coordination']
  },
  {
    id: 'accounts_officer',
    title: 'Accounts Officer',
    description: 'Financial management, billing, and payment processing',
    icon: Calculator,
    color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    features: ['Financial management', 'Billing & payments', 'Financial reporting']
  },
  {
    id: 'marketing_crm',
    title: 'Marketing & CRM',
    description: 'Lead management, marketing campaigns, and customer relations',
    icon: MessageSquare,
    color: 'bg-pink-500/10 text-pink-700 border-pink-200',
    features: ['Lead management', 'Marketing campaigns', 'Customer relations']
  },
  {
    id: 'support',
    title: 'Support Staff',
    description: 'Customer support, helpdesk, and user assistance',
    icon: Headphones,
    color: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
    features: ['Customer support', 'Issue resolution', 'User assistance']
  }
];

export function RoleSelection({ value, onChange, onNext }: RoleSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">What's your role?</h3>
        <p className="text-muted-foreground">Choose the role that best describes your position</p>
      </div>

      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = value === role.id;
          
          return (
            <Card 
              key={role.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:bg-muted/50'
              }`}
              onClick={() => onChange(role.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${role.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{role.title}</h4>
                      {isSelected && <Badge variant="default">Selected</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {role.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
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