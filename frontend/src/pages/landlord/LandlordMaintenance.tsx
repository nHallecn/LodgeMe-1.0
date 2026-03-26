import { useState, useEffect } from "react";
import { maintenanceAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MaintenanceTicket } from "@/types";

const priorityColor: Record<string, string> = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const statusColor: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const nextStatus: Record<string, string> = {
  open: "in_progress",
  in_progress: "resolved",
  resolved: "closed",
};

const LandlordMaintenance = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await maintenanceAPI.getByLandlord();
        setTickets(Array.isArray(data) ? data : data.tickets || []);
      } catch {
        toast({ title: "Failed to load maintenance tickets", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [toast]);

  const handleAdvance = async (ticket: MaintenanceTicket) => {
    const next = nextStatus[ticket.status];
    if (!next) return;
    const id = ticket._id;
    setUpdating(id);
    try {
      await maintenanceAPI.update(id, {
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: next,
      });
      setTickets((prev) => prev.map((t) => t._id === id ? { ...t, status: next as MaintenanceTicket["status"] } : t));
      toast({ title: `Ticket marked as ${next.replace("_", " ")}` });
    } catch {
      toast({ title: "Failed to update ticket", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  if (loading) {
    return (
      <DashboardLayout title="Maintenance Tickets" subtitle="Track maintenance requests from tenants">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Maintenance Tickets" subtitle="Track maintenance requests from tenants">
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[
          { label: "Total", value: stats.total, icon: Wrench, bg: "bg-blue-100", color: "text-blue-600" },
          { label: "Open", value: stats.open, icon: AlertCircle, bg: "bg-blue-100", color: "text-blue-600" },
          { label: "In Progress", value: stats.inProgress, icon: Wrench, bg: "bg-purple-100", color: "text-purple-600" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle, bg: "bg-green-100", color: "text-green-600" },
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

      <Card>
        <CardHeader><CardTitle className="font-display">All Maintenance Requests</CardTitle></CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No maintenance tickets yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="border rounded-lg p-4 hover:bg-muted/50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{ticket.title}</h4>
                        <Badge className={priorityColor[ticket.priority] || ""} variant="outline">
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{ticket.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={statusColor[ticket.status] || ""} variant="outline">
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      {nextStatus[ticket.status] && (
                        <Button
                          size="sm" variant="outline"
                          disabled={updating === ticket._id}
                          onClick={() => handleAdvance(ticket)}
                        >
                          {updating === ticket._id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : `Mark ${nextStatus[ticket.status].replace("_", " ")}`}
                        </Button>
                      )}
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
