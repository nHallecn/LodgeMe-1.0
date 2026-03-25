/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { propertiesAPI } from "@/lib/api";
import { Property } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, MapPin, Edit2, Trash2, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LandlordProperties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProperties = async () => {
      if (!user?.id) return;

      try {
        const response = await propertiesAPI.getByLandlord(user.id);
        // Handle cases where the API returns the array directly or wrapped in an object
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.properties || [];

        if (isMounted) {
          setProperties(data);
        }
      } catch (err: any) {
        if (isMounted) {
          toast({
            title: "Failed to load properties",
            description: err.response?.data?.message || "Could not fetch your properties",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProperties();

    return () => {
      isMounted = false;
    };
  }, [user?.id, toast]);

  const handleDelete = async (propertyId: number | string) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    setDeleting(propertyId);
    try {
      await propertiesAPI.delete(propertyId);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
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
          {properties.map((property) => {
            const displayImage = property.rooms?.[0]?.images?.[0];

            return (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {displayImage && (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={displayImage}
                      alt={property.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="font-display text-base line-clamp-2">
                        {property.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {property.city}, {property.neighborhood}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Rooms</p>
                      <p className="font-semibold">{property.totalRooms}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Occupied</p>
                      <p className="font-semibold">{property.occupiedRooms}</p>
                    </div>
                  </div>

                  {property.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {property.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link to={`/landlord/properties/${property.id}`} className="gap-1">
                        <Eye className="h-3 w-3" /> View
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link to={`/landlord/properties/${property.id}/edit`} className="gap-1">
                        <Edit2 className="h-3 w-3" /> Edit
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(property.id)}
                      disabled={deleting === property.id}
                    >
                      {deleting === property.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LandlordProperties;