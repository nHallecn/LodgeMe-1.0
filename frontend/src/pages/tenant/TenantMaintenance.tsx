import { useState, useEffect } from "react";
import { maintenanceAPI } from "@/lib/api";
import { MaintenanceTicket } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";

const priorityColors: Record<string, string> = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-warning text-warning-foreground",
  high: "bg-accent text-accent-foreground",
  urgent: "bg-destructive text-destructive-foreground",
};

const TenantMaintenance = () => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await maintenanceAPI.getByUser();
        setTickets(Array.isArray(data) ? data : data.tickets || []);
      } catch { setTickets([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout title="Maintenance Requests" subtitle="Submit and track maintenance tickets">
      <div className="mb-6 flex justify-end">
        <Button asChild className="gap-2">
          <Link to="/tenant/maintenance/new"><Plus className="h-4 w-4" /> New Request</Link>
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((t) => (
            <Card key={t._id}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-display font-semibold">{t.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{t.description}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge className={priorityColors[t.priority] || ""}>{t.priority}</Badge>
                    <Badge variant="outline">{t.status.replace("_", " ")}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No maintenance requests yet.</CardContent></Card>
      )}
    </DashboardLayout>
  );
};

export default TenantMaintenance;
