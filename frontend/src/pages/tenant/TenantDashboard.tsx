import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { bookingsAPI, paymentsAPI, maintenanceAPI, visitsAPI } from "@/lib/api";
import { Booking, Payment, MaintenanceTicket, VisitRequest } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Wrench, Users, ArrowRight, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TenantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalPayments: 0,
    pendingMaintenance: 0,
    pendingVisits: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.id) return;

        const [bookingsRes, paymentsRes, ticketsRes, visitsRes] = await Promise.all([
          bookingsAPI.getByGuest(user.id),
          paymentsAPI.getByGuest(user.id),
          maintenanceAPI.getByUser(user.id),
          visitsAPI.getMyVisits(user.id),
        ]);

        const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.bookings || [];
        const paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : paymentsRes.data.payments || [];
        const ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : ticketsRes.data.tickets || [];
        const visitsData = Array.isArray(visitsRes.data) ? visitsRes.data : visitsRes.data.visits || [];

        setBookings(bookingsData);
        setPayments(paymentsData);
        setTickets(ticketsData);
        setVisits(visitsData);

        const activeBookings = bookingsData.filter((b: Booking) => b.status === "active").length;
        const pendingMaintenance = ticketsData.filter((t: MaintenanceTicket) => t.status === "open" || t.status === "in_progress").length;
        const pendingVisits = visitsData.filter((v: VisitRequest) => v.status === "pending").length;

        setStats({
          activeBookings,
          totalPayments: paymentsData.length,
          pendingMaintenance,
          pendingVisits,
        });
      } catch (err: any) {
        toast({
          title: "Failed to load dashboard",
          description: err.response?.data?.message || "Could not fetch dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchDashboardData();
  }, [user?.id, toast]);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Welcome to your tenant dashboard">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome to your tenant dashboard">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Bookings</p>
              <p className="font-display text-2xl font-bold">{stats.activeBookings}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payments Made</p>
              <p className="font-display text-2xl font-bold">{stats.totalPayments}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Maintenance</p>
              <p className="font-display text-2xl font-bold">{stats.pendingMaintenance}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Visits</p>
              <p className="font-display text-2xl font-bold">{stats.pendingVisits}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Your Bookings</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/tenant/bookings" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">No bookings yet</p>
                <Button asChild size="sm">
                  <Link to="/properties" className="gap-1">
                    <Plus className="h-3 w-3" /> Browse Properties
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Booking #{booking.id}</p>
                      <p className="text-xs text-muted-foreground">Room {booking.roomId}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(booking.startDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={booking.status === "active" ? "default" : "outline"}>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Payment History</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/tenant/payments" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No payments yet</p>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Payment #{payment.id}</p>
                      <p className="text-xs text-muted-foreground">{payment.paymentMethod}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                    </div>
                    <p className="font-semibold text-sm">XAF {payment.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Maintenance Requests</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/tenant/maintenance" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No maintenance requests</p>
            ) : (
              <div className="space-y-3">
                {tickets.slice(0, 3).map((ticket) => (
                  <div key={ticket.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">Room {ticket.roomId}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={ticket.priority === "urgent" ? "destructive" : "outline"}>
                      {ticket.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visit Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Visit Requests</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/tenant/visits" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {visits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No visit requests</p>
            ) : (
              <div className="space-y-3">
                {visits.slice(0, 3).map((visit) => (
                  <div key={visit.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Visit Request #{visit.id}</p>
                      <p className="text-xs text-muted-foreground">Property {visit.propertyId}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(visit.requestedDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={visit.status === "confirmed" ? "default" : "outline"}>
                      {visit.status}
                    </Badge>
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