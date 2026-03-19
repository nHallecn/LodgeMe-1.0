import { useState, useEffect } from "react";
import { visitsAPI } from "@/lib/api";
import { VisitRequest } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const TenantVisits = () => {
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await visitsAPI.getMyVisits();
        setVisits(Array.isArray(data) ? data : data.visits || []);
      } catch { setVisits([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout title="Visit Requests" subtitle="Track your property visit requests">
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : visits.length > 0 ? (
        <div className="space-y-4">
          {visits.map((v) => (
            <Card key={v._id}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-display font-semibold">Visit #{v._id.slice(-6)}</p>
                  <p className="text-sm text-muted-foreground">
                    Preferred: {new Date(v.preferredDate).toLocaleDateString()}
                  </p>
                  {v.message && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{v.message}</p>}
                </div>
                <Badge className={statusColors[v.status] || ""}>{v.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No visit requests yet.</CardContent></Card>
      )}
    </DashboardLayout>
  );
};

export default TenantVisits;
