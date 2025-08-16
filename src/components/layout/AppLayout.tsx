import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { RoleSwitcher } from "./RoleSwitcher";
import { NotificationCenter } from "@/components/ui/notification-center";
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
              <NotificationCenter />
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