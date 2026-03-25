/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { bookingsAPI } from "@/lib/api";
import { Booking } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LandlordBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBookings = async () => {
      if (!user?.id) return;
      try {
        const response = await bookingsAPI.getByLandlord(user.id);
        const data = Array.isArray(response.data) 
          ? response.data 
          : response.data?.bookings || [];
        
        if (isMounted) setBookings(data);
      } catch (err: any) {
        if (isMounted) {
          toast({
            title: "Failed to load bookings",
            description: err.response?.data?.message || "Could not fetch bookings",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBookings();
    return () => { isMounted = false; };
  }, [user?.id, toast]);

  const handleStatusUpdate = async (bookingId: number | string, newStatus: string) => {
    setUpdating(bookingId);
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      setBookings((prev) => 
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus as any } : b))
      );
      toast({ title: `Booking updated to ${newStatus}` });
    } catch (err: any) {
      toast({
        title: "Failed to update booking",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status.toLowerCase()] || "bg-slate-100 text-slate-800 border-slate-200";
  };

  if (loading) {
    return (
      <DashboardLayout title="Bookings" subtitle="View and manage tenant bookings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Bookings" subtitle="View and manage tenant bookings">
      {bookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium">No bookings yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-2 bg-slate-100 rounded-full">
                        <Users className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="font-semibold text-sm">Booking #{booking.id}</span>
                      <Badge variant="outline" className={getStatusStyles(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(booking.startDate).toLocaleDateString()}
                        {booking.endDate && ` — ${new Date(booking.endDate).toLocaleDateString()}`}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Room ID:</span> {booking.roomId}
                      {booking.guest?.name && (
                        <>
                          <span className="mx-2">|</span>
                          <span className="font-medium text-foreground">Guest:</span> {booking.guest.name}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 sm:flex-none gap-1"
                          onClick={() => handleStatusUpdate(booking.id, "active")}
                          disabled={updating === booking.id}
                        >
                          {updating === booking.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 sm:flex-none gap-1"
                          onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                          disabled={updating === booking.id}
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {booking.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none gap-1"
                        onClick={() => handleStatusUpdate(booking.id, "completed")}
                        disabled={updating === booking.id}
                      >
                        {updating === booking.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LandlordBookings;