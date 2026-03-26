import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { bookingsAPI, paymentsAPI, maintenanceAPI, visitsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Wrench, Users, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Booking, Payment, MaintenanceTicket, VisitRequest } from "@/types";

const TenantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [payments,  setPayments]  = useState<Payment[]>([]);
  const [tickets,   setTickets]   = useState<MaintenanceTicket[]>([]);
  const [visits,    setVisits]    = useState<VisitRequest[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, pRes, tRes, vRes] = await Promise.all([
          bookingsAPI.getByGuest().catch(() => ({ data: [] })),
          paymentsAPI.getByGuest().catch(() => ({ data: [] })),
          maintenanceAPI.getByUser().catch(() => ({ data: [] })),
          visitsAPI.getMyVisits().catch(() => ({ data: [] })),
        ]);
        setBookings(Array.isArray(bRes.data) ? bRes.data : bRes.data.bookings || []);
        setPayments(Array.isArray(pRes.data) ? pRes.data : pRes.data.payments || []);
        setTickets(Array.isArray(tRes.data)  ? tRes.data  : tRes.data.tickets  || []);
        setVisits(Array.isArray(vRes.data)   ? vRes.data   : vRes.data.visits   || []);
      } catch {
        toast({ title: "Failed to load dashboard", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user?.id, toast]);

  const activeBooking   = bookings.find((b) => b.status === "active" || b.status === "confirmed");
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const openTickets     = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const pendingVisits   = visits.filter((v) => v.status === "pending");

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name || "Tenant"}`}>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name || "Tenant"}`}>
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[
          { label: "Active Rental",    value: bookings.filter((b) => b.status === "active" || b.status === "confirmed").length, icon: Calendar, bg: "bg-blue-100",   color: "text-blue-600"   },
          { label: "Pending Payments", value: pendingPayments.length,  icon: CreditCard, bg: "bg-yellow-100", color: "text-yellow-600" },
          { label: "Open Requests",    value: openTickets.length,      icon: Wrench,     bg: "bg-orange-100", color: "text-orange-600" },
          { label: "Visit Requests",   value: pendingVisits.length,    icon: Users,      bg: "bg-purple-100", color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-display text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeBooking && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="font-display">Current Rental</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-semibold">{typeof activeBooking.room === "string" ? activeBooking.room : activeBooking.room?.roomNumber}</p>
                </div>
                <Badge>{activeBooking.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Move-in</p>
                  <p className="font-semibold">{new Date(activeBooking.checkIn).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Move-out</p>
                  <p className="font-semibold">{activeBooking.checkOut ? new Date(activeBooking.checkOut).toLocaleDateString() : "Open-ended"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="font-display text-xl font-bold">XAF {activeBooking.totalPrice?.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingPayments.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" /> Payments Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">You have {pendingPayments.length} pending payment(s).</p>
            <Button asChild><Link to="/tenant/payments">View Payments</Link></Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Recent Bookings</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/tenant/bookings">View All</Link></Button>
          </CardHeader>
          <CardContent>
            {bookings.length === 0
              ? <p className="text-sm text-muted-foreground py-4">No bookings yet</p>
              : <div className="space-y-3">
                  {bookings.slice(0, 3).map((b) => (
                    <div key={b._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold text-sm">Booking #{String(b._id).slice(-6)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(b.checkIn).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline">{b.status}</Badge>
                    </div>
                  ))}
                </div>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Maintenance Requests</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/tenant/maintenance">View All</Link></Button>
          </CardHeader>
          <CardContent>
            {tickets.length === 0
              ? <p className="text-sm text-muted-foreground py-4">No requests yet</p>
              : <div className="space-y-3">
                  {tickets.slice(0, 3).map((t) => (
                    <div key={t._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold text-sm line-clamp-1">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{t.status.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
            }
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TenantDashboard;
