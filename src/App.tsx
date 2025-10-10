import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationManager } from "@/components/NotificationManager";
import DevUserInfo from "@/components/DevUserInfo";
import { ThemeProvider } from "next-themes";

// Import admin bootstrap utilities in development
if (process.env.NODE_ENV === 'development') {
  import('@/utils/adminBootstrap');
}
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminSettings from "./pages/AdminSettings";
import PendingRequests from "./pages/PendingRequests";
import EventLog from "./pages/EventLog";
import TrainingCalendar from "./pages/TrainingCalendar";
import People from "./pages/People";
import Fleet from "./pages/Fleet";
import Compliance from "./pages/Compliance";
import Finance from "./pages/Finance";
import Marketing from "./pages/Marketing";
import Support from "./pages/Support";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="airman-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <DevUserInfo />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <NotificationManager />
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/admin/settings" element={<AdminSettings />} />
                      <Route path="/admin/pending-requests" element={<PendingRequests />} />
                      <Route path="/events" element={<EventLog />} />
                      <Route path="/calendar" element={<TrainingCalendar />} />
                      <Route path="/people" element={<People />} />
                      <Route path="/fleet" element={<Fleet />} />
                      <Route path="/compliance" element={<Compliance />} />
                      <Route path="/finance" element={<Finance />} />
                      <Route path="/marketing" element={<Marketing />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/messages" element={<Messages />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
