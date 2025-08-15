import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
