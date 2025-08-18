import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { NotificationCenter } from "@/components/ui/notification-center";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { profile, signOut } = useAuth();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-muted/20">
        <AppSidebar currentUser={profile} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 aviation-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8" />
            </div>
            
            <div className="flex items-center gap-3">
              <NotificationCenter />
              {profile && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {profile.name || profile.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
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