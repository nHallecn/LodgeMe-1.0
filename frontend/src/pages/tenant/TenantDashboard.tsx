import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { bookingsAPI, maintenanceAPI, visitsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CreditCard, Wrench, Users } from "lucide-react";

const TenantDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ bookings: 0, maintenance: 0, visits: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookings, tickets, visits] = await Promise.all([
          bookingsAPI.getByGuest().catch(() => ({ data: [] })),
          maintenanceAPI.getByUser().catch(() => ({ data: [] })),
          visitsAPI.getMyVisits().catch(() => ({ data: [] })),
        ]);
        setStats({
          bookings: (Array.isArray(bookings.data) ? bookings.data : []).length,
          maintenance: (Array.isArray(tickets.data) ? tickets.data : []).length,
          visits: (Array.isArray(visits.data) ? visits.data : []).length,
        });
      } catch { /* ignore */ }
    };
    fetchStats();
  }, [user]);

  const cards = [
    { title: "Bookings", value: stats.bookings, icon: Calendar, color: "text-primary" },
    { title: "Payments", value: 0, icon: CreditCard, color: "text-success" },
    { title: "Maintenance", value: stats.maintenance, icon: Wrench, color: "text-warning" },
    { title: "Visit Requests", value: stats.visits, icon: Users, color: "text-info" },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name || "Tenant"}`}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="font-display text-2xl font-bold text-foreground">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-display">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your backend to see your bookings, payments, and maintenance requests here.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TenantDashboard;
