import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { propertiesAPI } from "@/lib/api";
import { Property } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LandlordProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProperties = async () => {
    try {
      const { data } = await propertiesAPI.getByLandlord(user?.id || "");
      setProperties(Array.isArray(data) ? data : data.properties || []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property?")) return;
    try {
      await propertiesAPI.delete(id);
      toast({ title: "Property deleted" });
      fetchProperties();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="My Properties" subtitle="Manage your property listings">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{properties.length} properties</p>
        <Button asChild className="gap-2">
          <Link to="/landlord/properties/new"><Plus className="h-4 w-4" /> Add Property</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : properties.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {properties.map((p) => (
            <Card key={p._id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-2">{p.type}</Badge>
                    <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {p.city}, {p.region}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{p.rooms?.length || 0} rooms</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/landlord/properties/${p._id}/edit`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <p className="text-muted-foreground">No properties yet.</p>
            <Button asChild className="mt-4 gap-2">
              <Link to="/landlord/properties/new"><Plus className="h-4 w-4" /> Add Your First Property</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default LandlordProperties;
