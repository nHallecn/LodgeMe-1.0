
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
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name}`}>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name}`}>
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
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
