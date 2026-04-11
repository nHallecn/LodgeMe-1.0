import { useState, useEffect } from "react";
import { visitsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColor: Record<string, string> = {
  pending:  "secondary",
  approved: "default",
  rejected: "destructive",
};

const TenantVisits = () => {
  const { toast } = useToast();
  const [visits,  setVisits]  = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    visitsAPI.getByGuest()
      .then((r) => { const d = r.data; setVisits(Array.isArray(d) ? d : []); })
      .catch(() => setVisits([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Cancel this visit request?")) return;
    try {
      await visitsAPI.updateStatus(id, "rejected");
      toast({ title: "Visit request cancelled" });
      load();
    } catch {
      toast({ title: "Failed to cancel", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Visit Requests" subtitle="Track your property visit requests">
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : visits.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No visit requests yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Go to a property page and click "Request a Visit" to schedule a viewing.
          </p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {visits.map((v) => (
            <Card key={String(v.id)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Property #{String(v.propertyId)}</p>
                  <p className="text-sm text-muted-foreground">
                    {String(v.requestedDate || "").split("T")[0]}
                    {v.requestedTime ? ` at ${String(v.requestedTime)}` : ""}
                  </p>
                  {v.notes && <p className="text-sm text-muted-foreground mt-1">{String(v.notes)}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusColor[String(v.status)] as "default" | "secondary" | "destructive" | "outline"}>
                    {String(v.status)}
                  </Badge>
                  {v.status === "pending" && (
                    <button onClick={() => handleCancel(String(v.id))}
                      className="text-xs text-destructive hover:underline">
                      Cancel
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TenantVisits;
