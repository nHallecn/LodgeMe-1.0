import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { propertiesAPI, bookingsAPI, paymentsAPI, maintenanceAPI } from "@/lib/api";
import { Property, Booking, Payment, MaintenanceTicket } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, DollarSign, Wrench, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LandlordDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingMaintenance: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.id) return;

        const [propsRes, bookingsRes, paymentsRes, ticketsRes] = await Promise.all([
          propertiesAPI.getByLandlord(user.id),
          bookingsAPI.getByLandlord(user.id),
          paymentsAPI.getByLandlord(user.id),
          maintenanceAPI.getByUser(user.id),
        ]);

        const propsData = Array.isArray(propsRes.data) ? propsRes.data : propsRes.data.properties || [];
        const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.bookings || [];
        const paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : paymentsRes.data.payments || [];
        const ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : ticketsRes.data.tickets || [];

        setProperties(propsData);
        setBookings(bookingsData);
        setPayments(paymentsData);
        setTickets(ticketsData);

        const totalRooms = propsData.reduce((sum: number, p: Property) => sum + (p.totalRooms || 0), 0);
        const activeBookings = bookingsData.filter((b: Booking) => b.status === "active").length;
        const totalRevenue = paymentsData.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0);
        const pendingMaintenance = ticketsData.filter((t: MaintenanceTicket) => t.status === "open" || t.status === "in_progress").length;

        setStats({
          totalProperties: propsData.length,
          totalRooms,
          activeBookings,
          totalRevenue,
          pendingMaintenance,
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
      <DashboardLayout title="Dashboard" subtitle="Welcome back to your landlord dashboard">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back to your landlord dashboard">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Properties</p>
              <p className="font-display text-2xl font-bold">{stats.totalProperties}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Rooms</p>
              <p className="font-display text-2xl font-bold">{stats.totalRooms}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <Calendar className="h-6 w-6 text-green-600" />
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
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="font-display text-2xl font-bold">XAF {stats.totalRevenue.toLocaleString()}</p>
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Your Properties</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/landlord/properties" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No properties yet</p>
            ) : (
              <div className="space-y-3">
                {properties.slice(0, 3).map((property) => (
                  <div key={property.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{property.name}</p>
                      <p className="text-xs text-muted-foreground">{property.city}, {property.neighborhood}</p>
                      <p className="text-xs text-muted-foreground mt-1">{property.totalRooms} rooms • {property.occupiedRooms} occupied</p>
                    </div>
                    <Badge variant="outline">{property.totalRooms - property.occupiedRooms} available</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Recent Bookings</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/landlord/bookings" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No bookings yet</p>
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
            <CardTitle className="font-display">Recent Payments</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/landlord/payments" className="gap-1">
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
              <Link to="/landlord/maintenance" className="gap-1">
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
      </div>
    </DashboardLayout>
  );
};

export default LandlordDashboard;