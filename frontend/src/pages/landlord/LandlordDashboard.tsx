import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { propertiesAPI, paymentsAPI, invoicesAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CreditCard, FileText, Users } from "lucide-react";

const LandlordDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ properties: 0, payments: 0, invoices: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [props, payments, invoices] = await Promise.all([
          propertiesAPI.getByLandlord(user?.id || "").catch(() => ({ data: [] })),
          paymentsAPI.getByLandlord().catch(() => ({ data: [] })),
          invoicesAPI.getByLandlord().catch(() => ({ data: [] })),
        ]);
        setStats({
          properties: (Array.isArray(props.data) ? props.data : props.data.properties || []).length,
          payments: (Array.isArray(payments.data) ? payments.data : []).length,
          invoices: (Array.isArray(invoices.data) ? invoices.data : []).length,
        });
      } catch { /* ignore */ }
    };
    fetchStats();
  }, [user]);

  const cards = [
    { title: "Properties", value: stats.properties, icon: Building2, color: "text-primary" },
    { title: "Payments", value: stats.payments, icon: CreditCard, color: "text-success" },
    { title: "Invoices", value: stats.invoices, icon: FileText, color: "text-warning" },
    { title: "Tenants", value: 0, icon: Users, color: "text-info" },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name || "Landlord"}`}>
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
          <CardTitle className="font-display">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your backend to see real-time activity. Your dashboard will display recent bookings, payments, and maintenance requests.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default LandlordDashboard;
