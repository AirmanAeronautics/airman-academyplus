import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthBackendProvider } from "@/hooks/useAuthBackend";
import { AuthProvider } from "@/context/AuthContext";
// Keep old import for reference during migration:
// import { AuthProvider } from "@/hooks/useAuth";
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
import VerifyOtp from "./pages/VerifyOtp";
import OnboardingStart from "./pages/OnboardingStart";
import OnboardingProfile from "./pages/OnboardingProfile";
import AdminSettings from "./pages/AdminSettings";
import EventLog from "./pages/EventLog";
import TrainingCalendar from "./pages/TrainingCalendar";
import People from "./pages/People";
import Fleet from "./pages/Fleet";
import Compliance from "./pages/Compliance";
import Finance from "./pages/Finance";
import Marketing from "./pages/Marketing";
import Support from "./pages/Support";
import Messages from "./pages/Messages";
import Reports from "./pages/Reports";
import DemoFlowPage from "./pages/DemoFlowPage";
import NotFound from "./pages/NotFound";
import AirmanRosterDemo from "./pages/AirmanRosterDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="airman-theme">
      <BrowserRouter>
        <AuthProvider>
          <AuthBackendProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <DevUserInfo />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/verify-otp" element={<VerifyOtp />} />
                <Route path="/onboarding/start" element={<OnboardingStart />} />
                <Route path="/onboarding/profile" element={<OnboardingProfile />} />
                <Route path="/roster-demo" element={<AirmanRosterDemo />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <NotificationManager />
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/admin/settings" element={<AdminSettings />} />
                        <Route path="/events" element={<EventLog />} />
                        <Route path="/calendar" element={<TrainingCalendar />} />
                        <Route path="/people" element={<People />} />
                        <Route path="/fleet" element={<Fleet />} />
                        <Route path="/compliance" element={<Compliance />} />
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/demo" element={<DemoFlowPage />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                } />
              </Routes>
            </TooltipProvider>
          </AuthBackendProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
