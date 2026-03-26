import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import LandlordDashboard from "./pages/landlord/LandlordDashboard";
import LandlordProperties from "./pages/landlord/LandlordProperties";
import NewProperty from "./pages/landlord/NewPropertyForm";
import AddRoom from "./pages/landlord/AddRoom";
import LandlordPayments from "./pages/landlord/LandlordPayments";
import LandlordInvoices from "./pages/landlord/LandlordInvoices";
import LandlordMaintenance from "./pages/landlord/LandlordMaintenance";
import LandlordBookings from "./pages/landlord/LandlordBookings";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import TenantBookings from "./pages/tenant/TenantBookings";
import TenantPayments from "./pages/tenant/TenantPayments";
import TenantMaintenance from "./pages/tenant/TenantMaintenance";
import NewMaintenanceTicket from "./pages/tenant/NewMaintenanceTicket";
import TenantVisits from "./pages/tenant/TenantVisits";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// ── Route guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, role }: { children: ReactNode; role?: string }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role && user?.role !== "admin")
    return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />

            {/* Landlord */}
            <Route path="/landlord/dashboard" element={<ProtectedRoute role="landlord"><LandlordDashboard /></ProtectedRoute>} />
            <Route path="/landlord/properties" element={<ProtectedRoute role="landlord"><LandlordProperties /></ProtectedRoute>} />
            <Route path="/landlord/properties/new" element={<ProtectedRoute role="landlord"><NewProperty /></ProtectedRoute>} />
            <Route path="/landlord/properties/:propertyId/rooms/new" element={<ProtectedRoute role="landlord"><AddRoom /></ProtectedRoute>} />
            <Route path="/landlord/payments" element={<ProtectedRoute role="landlord"><LandlordPayments /></ProtectedRoute>} />
            <Route path="/landlord/invoices" element={<ProtectedRoute role="landlord"><LandlordInvoices /></ProtectedRoute>} />
            <Route path="/landlord/maintenance" element={<ProtectedRoute role="landlord"><LandlordMaintenance /></ProtectedRoute>} />
            <Route path="/landlord/bookings" element={<ProtectedRoute role="landlord"><LandlordBookings /></ProtectedRoute>} />

            {/* Tenant */}
            <Route path="/tenant/dashboard" element={<ProtectedRoute role="tenant"><TenantDashboard /></ProtectedRoute>} />
            <Route path="/tenant/bookings" element={<ProtectedRoute role="tenant"><TenantBookings /></ProtectedRoute>} />
            <Route path="/tenant/payments" element={<ProtectedRoute role="tenant"><TenantPayments /></ProtectedRoute>} />
            <Route path="/tenant/maintenance" element={<ProtectedRoute role="tenant"><TenantMaintenance /></ProtectedRoute>} />
            <Route path="/tenant/maintenance/new" element={<ProtectedRoute role="tenant"><NewMaintenanceTicket /></ProtectedRoute>} />
            <Route path="/tenant/visits" element={<ProtectedRoute role="tenant"><TenantVisits /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
