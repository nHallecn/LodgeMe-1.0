import { useState, useEffect } from "react";
import { bookingsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: number;
  _id?: string;
  guestId: number;
  roomId: number;
  startDate: string;
  endDate?: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

const LandlordBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await bookingsAPI.getByLandlord();
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      } catch {
        toast({ title: "Failed to load bookings", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [toast]);

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await bookingsAPI.updateStatus(id, status);
      setBookings((prev) =>
        prev.map((b) => (String(b.id) === id || b._id === id ? { ...b, status } : b))
      );
      toast({ title: `Booking ${status}` });
    } catch {
      toast({ title: "Failed to update booking", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const pending = bookings.filter((b) => b.status === "pending");
  const others = bookings.filter((b) => b.status !== "pending");

  if (loading) {
    return (
      <DashboardLayout title="Bookings" subtitle="Manage tenant booking requests">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const BookingRow = ({ b }: { b: Booking }) => {
    const id = String(b.id || b._id);
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm">Booking #{id.slice(-6)}</p>
            <Badge className={statusColors[b.status] || ""}>{b.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Room {b.roomId} · Guest #{b.guestId} · Move-in: {new Date(b.startDate).toLocaleDateString()}
            {b.endDate ? ` · Move-out: ${new Date(b.endDate).toLocaleDateString()}` : " · Open-ended"}
          </p>
        </div>
        {b.status === "pending" && (
          <div className="flex gap-2 ml-4">
            <Button
              size="sm" variant="outline"
              className="gap-1 text-green-700 border-green-300 hover:bg-green-50"
              disabled={updating === id}
              onClick={() => handleStatus(id, "active")}
            >
              {updating === id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
              Approve
            </Button>
            <Button
              size="sm" variant="outline"
              className="gap-1 text-red-700 border-red-300 hover:bg-red-50"
              disabled={updating === id}
              onClick={() => handleStatus(id, "cancelled")}
            >
              <XCircle className="h-3 w-3" /> Reject
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout title="Bookings" subtitle="Manage tenant booking requests">
      {pending.length > 0 && (
        <Card className="mb-6 border-yellow-200">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              Pending Requests ({pending.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.map((b) => <BookingRow key={b.id || b._id} b={b} />)}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-display">All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {others.map((b) => <BookingRow key={b.id || b._id} b={b} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default LandlordBookings;
