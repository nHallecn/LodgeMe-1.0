import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";

// Public pages
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import NotFound from "./pages/NotFound";

// Landlord pages
import LandlordDashboard from "./pages/landlord/LandlordDashboard";
import LandlordProperties from "./pages/landlord/LandlordProperties";
import NewPropertyForm from "./pages/landlord/NewPropertyForm";
import LandlordBookings from "./pages/landlord/LandlordBookings";
import LandlordMaintenance from "./pages/landlord/LandlordMaintenance";
import LandlordInvoices from "./pages/landlord/LandlordInvoices";
import LandlordPayments from "./pages/landlord/LandlordPayments";
import AddRoom from "./pages/landlord/AddRoom";

// Tenant pages
import TenantDashboard from "./pages/tenant/TenantDashboard";
import TenantBookings from "./pages/tenant/TenantBookings";
import TenantPayments from "./pages/tenant/TenantPayments";
import TenantMaintenance from "./pages/tenant/TenantMaintenance";
import NewMaintenanceTicket from "./pages/tenant/NewMaintenanceTicket";
import TenantVisits from "./pages/tenant/TenantVisits";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/properties" element={<PropertiesPage />} />
    <Route path="/properties/:id" element={<PropertyDetailPage />} />

    {/* Landlord */}
    <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
    <Route path="/landlord/properties" element={<LandlordProperties />} />
    <Route path="/landlord/properties/new" element={<NewPropertyForm />} />
    <Route path="/landlord/properties/:propertyId/rooms/new" element={<AddRoom />} />
    <Route path="/landlord/bookings" element={<LandlordBookings />} />
    <Route path="/landlord/maintenance" element={<LandlordMaintenance />} />
    <Route path="/landlord/invoices" element={<LandlordInvoices />} />
    <Route path="/landlord/payments" element={<LandlordPayments />} />

    {/* Tenant */}
    <Route path="/tenant/dashboard" element={<TenantDashboard />} />
    <Route path="/tenant/bookings" element={<TenantBookings />} />
    <Route path="/tenant/payments" element={<TenantPayments />} />
    <Route path="/tenant/maintenance" element={<TenantMaintenance />} />
    <Route path="/tenant/maintenance/new" element={<NewMaintenanceTicket />} />
    <Route path="/tenant/visits" element={<TenantVisits />} />

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
