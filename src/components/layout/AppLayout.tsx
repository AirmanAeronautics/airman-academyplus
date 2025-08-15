import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { RoleSwitcher } from "./RoleSwitcher";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { users, currentUser as defaultUser, type User } from "@/data/users";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-muted/20">
        <AppSidebar currentUser={currentUser} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 aviation-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8" />
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <RoleSwitcher currentUser={currentUser} onUserChange={handleUserChange} />
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