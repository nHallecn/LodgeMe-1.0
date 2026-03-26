import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { propertiesAPI, paymentsAPI, invoicesAPI, bookingsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CreditCard, FileText, ClipboardList, Loader2 } from "lucide-react";

const LandlordDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ properties: 0, payments: 0, invoices: 0, bookings: 0 });
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [props, payments, invoices, bookings] = await Promise.all([
          propertiesAPI.getByLandlord(String(user?.id || "")).catch(() => ({ data: [] })),
          paymentsAPI.getByLandlord().catch(() => ({ data: [] })),
          invoicesAPI.getByLandlord().catch(() => ({ data: [] })),
          bookingsAPI.getByLandlord().catch(() => ({ data: [] })),
        ]);
        const propList  = Array.isArray(props.data)    ? props.data    : props.data.properties || [];
        const payList   = Array.isArray(payments.data)  ? payments.data  : [];
        const invList   = Array.isArray(invoices.data)  ? invoices.data  : [];
        const bookList  = Array.isArray(bookings.data)  ? bookings.data  : [];
        setStats({ properties: propList.length, payments: payList.length, invoices: invList.length, bookings: bookList.length });
        setPendingBookings(bookList.filter((b: any) => b.status === "pending").slice(0, 5));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchStats();
  }, [user]);

  const cards = [
    { title: "Properties", value: stats.properties, icon: Building2,    color: "text-primary",    bg: "bg-primary/10",  path: "/landlord/properties" },
    { title: "Bookings",   value: stats.bookings,   icon: ClipboardList, color: "text-blue-600",   bg: "bg-blue-100",    path: "/landlord/bookings"   },
    { title: "Payments",   value: stats.payments,   icon: CreditCard,    color: "text-green-600",  bg: "bg-green-100",   path: "/landlord/payments"   },
    { title: "Invoices",   value: stats.invoices,   icon: FileText,      color: "text-orange-600", bg: "bg-orange-100",  path: "/landlord/invoices"   },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name || "Landlord"}`}>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {cards.map((card) => (
              <div key={card.title} onClick={() => navigate(card.path)} className="cursor-pointer">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                      <p className="font-display text-2xl font-bold text-foreground">{card.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {pendingBookings.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 mb-6">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-yellow-600" />
                  {pendingBookings.length} Pending Booking Request{pendingBookings.length > 1 ? "s" : ""}
                </CardTitle>
                <button
                  onClick={() => navigate("/landlord/bookings")}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Review All
                </button>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingBookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Room {b.roomId} · Guest #{b.guestId}</span>
                    <Badge className="bg-yellow-100 text-yellow-800">pending</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="font-display">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/landlord/properties/new")}
                className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                + Add Property
              </button>
              <button
                onClick={() => navigate("/landlord/bookings")}
                className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                Review Bookings
              </button>
              <button
                onClick={() => navigate("/landlord/maintenance")}
                className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                Check Tickets
              </button>
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
};

export default LandlordDashboard;
