import { useState, useEffect } from "react";
import { bookingsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar } from "lucide-react";

const statusVariant: Record<string, "default"|"secondary"|"destructive"|"outline"> = {
  pending:   "secondary",
  active:    "default",
  confirmed: "default",
  completed: "outline",
  cancelled: "destructive",
};

const TenantBookings = () => {
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    bookingsAPI.getByGuest()
      .then(({ data }) => setBookings(Array.isArray(data) ? data : data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Bookings" subtitle="View and manage your room bookings">
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No bookings yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Browse properties and book a room to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const id        = String(b.id ?? b._id ?? "");
            const status    = String(b.status ?? "pending");
            const startDate = String(b.startDate ?? b.checkIn ?? "").split("T")[0];
            const endDate   = String(b.endDate   ?? b.checkOut ?? "").split("T")[0];
            const roomId    = String(b.roomId ?? b.room ?? "");

            return (
              <Card key={id}>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-semibold">Booking #{id}</p>
                    <p className="text-sm text-muted-foreground mt-1">Room #{roomId}</p>
                    <p className="text-sm text-muted-foreground">
                      {startDate || "—"}{endDate && endDate !== "undefined" ? ` → ${endDate}` : ""}
                    </p>
                  </div>
                  <Badge variant={statusVariant[status] ?? "outline"} className="capitalize">
                    {status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TenantBookings;