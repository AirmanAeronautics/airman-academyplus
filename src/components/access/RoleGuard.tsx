import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserPermissions } from "@/lib/roleUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  requirePermission?: keyof ReturnType<typeof getUserPermissions>;
  fallback?: ReactNode;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  requirePermission,
  fallback
}: RoleGuardProps) {
  const { profile } = useAuth();
  const userRole = profile?.role;
  const permissions = getUserPermissions(userRole);

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return fallback || <AccessDenied />;
  }

  // Check permission-based access
  if (requirePermission && !permissions[requirePermission]) {
    return fallback || <AccessDenied />;
  }

  return <>{children}</>;
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            You don't have permission to access this content. This area contains 
            sensitive training information that is only available to authorized personnel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}