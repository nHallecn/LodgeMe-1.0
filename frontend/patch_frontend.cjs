/**
 * Run from your FRONTEND folder: node patch_frontend.js
 * Fixes api.ts and TenantDashboard.tsx
 */
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "src");

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("✅ wrote:", filePath.replace(src, "src"));
}

// ── api.ts ────────────────────────────────────────────────────────────────────
write(path.join(src, "lib/api.ts"), `
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
}, (error) => Promise.reject(error));

// Only redirect on 401 (expired/invalid token) — NOT on 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login:    (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post("/auth/register", data),
};

export const propertiesAPI = {
  getAll:        (params?: Record<string, string>) => api.get("/properties", { params }),
  getById:       (id: string) => api.get(\`/properties/\${id}\`),
  create:        (data: FormData | Record<string, unknown>) => api.post("/properties", data),
  update:        (id: string, data: FormData | Record<string, unknown>) => api.put(\`/properties/\${id}\`, data),
  delete:        (id: string) => api.delete(\`/properties/\${id}\`),
  getByLandlord: (landlordId: string) => api.get(\`/properties/landlord/\${landlordId}\`),
  getRooms:      (propertyId: string) => api.get(\`/properties/\${propertyId}/rooms\`),
  getRoomById:   (roomId: string) => api.get(\`/properties/rooms/\${roomId}\`),
  addRoom:       (propertyId: string, data: Record<string, unknown>) => api.post(\`/properties/\${propertyId}/rooms\`, data),
  updateRoom:    (roomId: string, data: Record<string, unknown>) => api.put(\`/properties/rooms/\${roomId}\`, data),
  deleteRoom:    (roomId: string) => api.delete(\`/properties/rooms/\${roomId}\`),
};

export const bookingsAPI = {
  create:        (data: Record<string, unknown>) => api.post("/bookings", data),
  getByGuest:    () => api.get("/bookings/guest"),
  getByLandlord: () => api.get("/bookings/landlord"),
  getById:       (id: string) => api.get(\`/bookings/\${id}\`),
  updateStatus:  (id: string, status: string) => api.patch(\`/bookings/\${id}/status\`, { status }),
  delete:        (id: string) => api.delete(\`/bookings/\${id}\`),
};

export const paymentsAPI = {
  record:        (data: Record<string, unknown>) => api.post("/payments", data),
  getByLandlord: () => api.get("/payments/landlord"),
  getByGuest:    () => api.get("/payments/guest"),
  getById:       (id: string) => api.get(\`/payments/\${id}\`),
};

export const invoicesAPI = {
  create:        (data: Record<string, unknown>) => api.post("/invoices", data),
  getByLandlord: () => api.get("/invoices/landlord"),
  getById:       (id: string) => api.get(\`/invoices/\${id}\`),
  updateStatus:  (id: string, status: string) => api.patch(\`/invoices/\${id}/status\`, { status }),
};

export const maintenanceAPI = {
  create:        (data: Record<string, unknown>) => api.post("/maintenance-tickets", data),
  getByGuest:    () => api.get("/maintenance-tickets/user"),
  getByUser:     () => api.get("/maintenance-tickets/user"),
  getByLandlord: () => api.get("/maintenance-tickets/landlord"),
  getByRoom:     (roomId: string) => api.get(\`/maintenance-tickets/room/\${roomId}\`),
  getById:       (id: string) => api.get(\`/maintenance-tickets/\${id}\`),
  update:        (id: string, data: Record<string, unknown>) => api.put(\`/maintenance-tickets/\${id}\`, data),
};

export const visitsAPI = {
  create:        (data: Record<string, unknown>) => api.post("/visits", data),
  getByGuest:    () => api.get("/visits/my-visits"),
  getMyVisits:   () => api.get("/visits/my-visits"),
  getByLandlord: () => api.get("/visits/landlord"),
  getById:       (id: string) => api.get(\`/visits/\${id}\`),
  updateStatus:  (id: string, status: string) => api.patch(\`/visits/\${id}/status\`, { status }),
};
`);

// ── TenantDashboard.tsx ───────────────────────────────────────────────────────
write(path.join(src, "pages/tenant/TenantDashboard.tsx"), `
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { bookingsAPI, paymentsAPI, maintenanceAPI, visitsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Wrench, Users, Loader2 } from "lucide-react";

const TenantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [tickets,  setTickets]  = useState<Record<string, unknown>[]>([]);
  const [visits,   setVisits]   = useState<Record<string, unknown>[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [bRes, pRes, tRes, vRes] = await Promise.allSettled([
        bookingsAPI.getByGuest(),
        paymentsAPI.getByGuest(),
        maintenanceAPI.getByGuest(),
        visitsAPI.getByGuest(),
      ]);

      if (bRes.status === "fulfilled") {
        const d = bRes.value.data;
        setBookings(Array.isArray(d) ? d : []);
      }
      if (pRes.status === "fulfilled") {
        const d = pRes.value.data;
        setPayments(Array.isArray(d) ? d : []);
      }
      if (tRes.status === "fulfilled") {
        const d = tRes.value.data;
        setTickets(Array.isArray(d) ? d : []);
      }
      if (vRes.status === "fulfilled") {
        const d = vRes.value.data;
        setVisits(Array.isArray(d) ? d : []);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const activeBooking   = bookings.find((b) => b.status === "active" || b.status === "confirmed");
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const openTickets     = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const pendingVisits   = visits.filter((v) => v.status === "pending");

  const stats = [
    { label: "Active Rental",    value: activeBooking ? 1 : 0,  icon: Calendar,   bg: "bg-blue-100",   color: "text-blue-600"   },
    { label: "Pending Payments", value: pendingPayments.length, icon: CreditCard,  bg: "bg-yellow-100", color: "text-yellow-600" },
    { label: "Open Requests",    value: openTickets.length,     icon: Wrench,      bg: "bg-orange-100", color: "text-orange-600" },
    { label: "Visit Requests",   value: pendingVisits.length,   icon: Users,       bg: "bg-purple-100", color: "text-purple-600" },
  ];

  if (loading) return (
    <DashboardLayout title="Dashboard" subtitle={\`Welcome back, \${user?.name}\`}>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Dashboard" subtitle={\`Welcome back, \${user?.name}\`}>
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={\`rounded-lg p-2 \${stat.bg}\`}>
                <stat.icon className={\`h-5 w-5 \${stat.color}\`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Recent Bookings</CardTitle>
            <button onClick={() => navigate("/tenant/bookings")}
              className="text-xs text-primary hover:underline">View All</button>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet</p>
            ) : (
              <div className="space-y-2">
                {bookings.slice(0, 3).map((b) => (
                  <div key={String(b.id)} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Booking #{String(b.id)}</span>
                    <Badge variant={
                      b.status === "active" || b.status === "confirmed" ? "default" :
                      b.status === "pending" ? "secondary" : "outline"
                    } className="capitalize text-xs">{String(b.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Maintenance Requests</CardTitle>
            <button onClick={() => navigate("/tenant/maintenance")}
              className="text-xs text-primary hover:underline">View All</button>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet</p>
            ) : (
              <div className="space-y-2">
                {tickets.slice(0, 3).map((t) => (
                  <div key={String(t.id)} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[150px]">{String(t.title)}</span>
                    <Badge variant="outline" className="capitalize text-xs">{String(t.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TenantDashboard;
`);

console.log("\n✅ Done! Now restart your frontend: npm run dev");
