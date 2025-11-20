import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { NotificationCenter } from "@/components/ui/notification-center";
import { useAuthBackend } from "@/hooks/useAuthBackend";
import { Button } from "@/components/ui/button";
import { LogOut, Zap, RotateCcw } from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, isDemoMode } = useAuthBackend();
  const { exitDemo, resetDemo } = useDemo();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-muted/20">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 aviation-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8" />
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationCenter />
              {user && (
                <div className="flex items-center gap-3">
                  {isDemoMode && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        <Zap className="h-3 w-3 mr-1" />
                        Demo Mode
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={resetDemo} title="Try Different Role">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={exitDemo} title="Exit Demo">
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {user.fullName || user.email}
                    {isDemoMode && (
                      <span className="ml-1 text-primary">
                        ({user.role?.replace(/_/g, ' ')})
                      </span>
                    )}
                  </span>
                  {!isDemoMode && (
                    <Button variant="ghost" size="sm" onClick={logout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}