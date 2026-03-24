/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { maintenanceAPI } from "@/lib/api";
import { MaintenanceTicket } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LandlordMaintenance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        if (!user?.id) return;
        const response = await maintenanceAPI.getByUser(user.id);
        const data = Array.isArray(response.data) ? response.data : response.data.tickets || [];
        setTickets(data);

        // Calculate stats
        const total = data.length;
        const open = data.filter((t: MaintenanceTicket) => t.status === "open").length;
        const inProgress = data.filter((t: MaintenanceTicket) => t.status === "in_progress").length;
        const resolved = data.filter((t: MaintenanceTicket) => t.status === "resolved").length;
        setStats({ total, open, inProgress, resolved });
      } catch (err: any) {
        toast({
          title: "Failed to load maintenance tickets",
          description: err.response?.data?.message || "Could not fetch maintenance records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchTickets();
  }, [user?.id, toast]);

  const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
    setUpdating(ticketId);
    try {
      await maintenanceAPI.update(ticketId, { status: newStatus });
      setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus as any } : t)));
      toast({ title: `Ticket updated to ${newStatus}` });
    } catch (err: any) {
      toast({
        title: "Failed to update ticket",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Maintenance Tickets" subtitle="Track maintenance requests from tenants">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Maintenance Tickets" subtitle="Track maintenance requests from tenants">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-display text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="font-display text-2xl font-bold">{stats.open}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Wrench className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="font-display text-2xl font-bold">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="font-display text-2xl font-bold">{stats.resolved}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">All Maintenance Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No maintenance tickets yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-muted/50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{ticket.title}</h4>
                        <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Room: {ticket.roomId}</span>
                        <span>Reported by: User {ticket.userId}</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(ticket.status)} variant="outline">
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <div className="flex gap-1">
                        {ticket.status === "open" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(ticket.id, "in_progress")}
                            disabled={updating === ticket.id}
                          >
                            {updating === ticket.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Start"}
                          </Button>
                        )}
                        {ticket.status === "in_progress" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(ticket.id, "resolved")}
                            disabled={updating === ticket.id}
                          >
                            {updating === ticket.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Resolve"}
                          </Button>
                        )}
                        {ticket.status !== "closed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(ticket.id, "closed")}
                            disabled={updating === ticket.id}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default LandlordMaintenance;