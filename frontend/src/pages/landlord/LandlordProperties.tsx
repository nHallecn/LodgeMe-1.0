import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { propertiesAPI } from "@/lib/api";
import { Property } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, MapPin, Edit2, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LandlordProperties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertiesAPI.getByLandlord(user?.id || "");
        const data = Array.isArray(response.data) ? response.data : response.data.properties || [];
        setProperties(data);
      } catch (err) {
        toast({
          title: "Failed to load properties",
          description: "Could not fetch your properties",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchProperties();
  }, [user?.id, toast]);

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    setDeleting(propertyId);
    try {
      await propertiesAPI.delete(propertyId);
      setProperties(properties.filter((p) => p._id !== propertyId));
      toast({ title: "Property deleted successfully" });
    } catch (err: any) {
      toast({
        title: "Failed to delete property",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Properties" subtitle="Manage your rental properties">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Properties" subtitle="Manage your rental properties">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{properties.length} properties listed</p>
        <Button asChild>
          <Link to="/landlord/properties/new" className="gap-2">
            <Plus className="h-4 w-4" /> Add Property
          </Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No Properties Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start by adding your first rental property</p>
            <Button asChild>
              <Link to="/landlord/properties/new">Add Your First Property</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {property.images?.[0] && (
                <div className="aspect-video overflow-hidden bg-muted">
                  <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="font-display text-base line-clamp-2">{property.title}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {property.city}, {property.region}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {property.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rooms</p>
                    <p className="font-semibold">{property.rooms?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price Range</p>
                    <p className="font-semibold text-xs">
                      {property.rooms?.length
                        ? `XAF ${Math.min(...property.rooms.map((r) => r.price)).toLocaleString()}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link to={`/landlord/properties/${property._id}`}>View</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link to={`/landlord/properties/${property._id}/edit`} className="gap-1">
                      <Edit2 className="h-3 w-3" /> Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(property._id)}
                    disabled={deleting === property._id}
                  >
                    {deleting === property._id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LandlordProperties;
