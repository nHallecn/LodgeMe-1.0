import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import DashboardPage from "./pages/DashboardPage";
import LodgMeLandlordDashboard from "./pages/landlord/LodgMeLandlordDashboard";
import LodgMeListingForm from "./pages/landlord/LodgMeListingForm";
import LodgMeInquiries from "./pages/landlord/LodgMeInquiries";
import AdminListingQueue from "./pages/admin/AdminListingQueue";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/listings" element={<PropertiesPage />} />
    <Route path="/listings/:id" element={<PropertyDetailPage />} />
    <Route path="/properties" element={<PropertiesPage />} />
    <Route path="/properties/:id" element={<PropertyDetailPage />} />

    <Route path="/auth/login" element={<LoginPage />} />
    <Route path="/auth/register" element={<RegisterPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/tenant/dashboard" element={<DashboardPage />} />
    <Route path="/landlord/dashboard" element={<LodgMeLandlordDashboard />} />
    <Route path="/landlord/listings/new" element={<LodgMeListingForm />} />
    <Route path="/landlord/properties/new" element={<LodgMeListingForm />} />
    <Route path="/landlord/inquiries" element={<LodgMeInquiries />} />

    <Route path="/admin" element={<AdminListingQueue />} />
    <Route path="/admin/listings/queue" element={<AdminListingQueue />} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
