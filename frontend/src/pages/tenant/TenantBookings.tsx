import { useState, useEffect } from "react";
import { bookingsAPI } from "@/lib/api";
import { Booking } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  confirmed: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
  completed: "bg-primary text-primary-foreground",
};

const TenantBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await bookingsAPI.getByGuest();
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      } catch { setBookings([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout title="My Bookings" subtitle="View and manage your room bookings">
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => (
            <Card key={b._id}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-display font-semibold">Booking #{b._id.slice(-6)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium text-primary mt-1">XAF {b.totalPrice?.toLocaleString()}</p>
                </div>
                <Badge className={statusColors[b.status] || ""}>{b.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No bookings yet.</CardContent></Card>
      )}
    </DashboardLayout>
  );
};

export default TenantBookings;
