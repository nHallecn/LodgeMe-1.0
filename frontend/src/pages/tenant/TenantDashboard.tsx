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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, paymentsRes, ticketsRes, visitsRes] = await Promise.all([
          bookingsAPI.getByGuest(user?.id || "").catch(() => ({ data: [] })),
          paymentsAPI.getByGuest(user?.id || "").catch(() => ({ data: [] })),
          maintenanceAPI.getByUser(user?.id || "").catch(() => ({ data: [] })),
          visitsAPI.getMyVisits(user?.id || "").catch(() => ({ data: [] })),
        ]);

        const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.bookings || [];
        const paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : paymentsRes.data.payments || [];
        const ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : ticketsRes.data.tickets || [];
        const visitsData = Array.isArray(visitsRes.data) ? visitsRes.data : visitsRes.data.visits || [];

        setBookings(bookingsData);
        setPayments(paymentsData);
        setTickets(ticketsData);
        setVisits(visitsData);
      } catch (err) {
        toast({
          title: "Failed to load dashboard",
          description: "Could not fetch your information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchData();
  }, [user?.id, toast]);

  const activeBooking = bookings.find((b) => b.status === "active" || b.status === "confirmed");
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const pendingVisits = visits.filter((v) => v.status === "pending");

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name || "Tenant"}`}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name || "Tenant"}`}>
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Rental</p>
              <p className="font-display text-2xl font-bold">{bookings.filter((b) => b.status === "active" || b.status === "confirmed").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <CreditCard className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
              <p className="font-display text-2xl font-bold">{pendingPayments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open Requests</p>
              <p className="font-display text-2xl font-bold">{openTickets.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visit Requests</p>
              <p className="font-display text-2xl font-bold">{pendingVisits.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Rental */}
      {activeBooking && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display">Current Rental</CardTitle>
          </CardHeader>
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
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-semibold">{new Date(activeBooking.checkIn).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-semibold">{activeBooking.checkOut ? new Date(activeBooking.checkOut).toLocaleDateString() : "Ongoing"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="font-display text-xl font-bold">XAF {activeBooking.totalPrice.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Payments Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">You have {pendingPayments.length} pending payment(s)</p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/tenant/payments">View Payments</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Recent Bookings</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/tenant/bookings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">{typeof booking.room === "string" ? booking.room : booking.room?.roomNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline">{booking.status}</Badge>
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
            <Button asChild variant="ghost" size="sm">
              <Link to="/tenant/maintenance">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No requests yet</p>
            ) : (
              <div className="space-y-3">
                {tickets.slice(0, 3).map((ticket) => (
                  <div key={ticket._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm line-clamp-1">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {ticket.status.replace("_", " ")}
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
