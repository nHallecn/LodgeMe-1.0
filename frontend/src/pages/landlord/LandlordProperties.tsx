/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { propertiesAPI } from "@/lib/api";
import { Property } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, MapPin, Trash2, Loader2, BedDouble, ImageOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LandlordProperties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertiesAPI.getByLandlord(String(user?.id || ""));
        const data = Array.isArray(response.data) ? response.data : response.data.properties || [];
        // Debug: log what images field looks like
        data.forEach((p: any) => console.log(`Property "${p.name || p.title}" images:`, p.images));
        setProperties(data);
      } catch {
        toast({ title: "Failed to load properties", variant: "destructive" });
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
      setProperties(properties.filter((p) => String(p._id || p.id) !== propertyId));
      toast({ title: "Property deleted successfully" });
    } catch (err: any) {
      toast({ title: "Failed to delete property", description: err.response?.data?.message, variant: "destructive" });
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
        <button
          onClick={() => navigate("/landlord/properties/new")}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No Properties Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start by adding your first rental property</p>
            <button
              onClick={() => navigate("/landlord/properties/new")}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Add Your First Property
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const pid = String(property._id || property.id);
            const coverImage = property.images?.[0];

            return (
              <Card key={pid} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image slot — always rendered so you can see if data is missing */}
                <div className="aspect-video overflow-hidden bg-muted relative">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={property.title || property.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // If image fails to load, show fallback
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ImageOff className="h-8 w-8" />
                      <span className="text-xs">No photo</span>
                    </div>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="font-display text-base line-clamp-2">
                        {property.title || property.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {property.neighborhood || property.address}, {property.city}
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{property.type}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Rooms</p>
                      <p className="font-semibold">{property.rooms?.length ?? property.totalRooms ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min Price</p>
                      <p className="font-semibold text-xs">
                        {property.rooms?.length
                          ? `XAF ${Math.min(...property.rooms.map((r: any) => r.price ?? r.monthlyRent ?? 0)).toLocaleString()}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/properties/${pid}`)}
                      className="flex-1 inline-flex justify-center items-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/landlord/properties/${pid}/rooms/new`)}
                      className="flex-1 inline-flex justify-center items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
                    >
                      <BedDouble className="h-3 w-3" /> Add Room
                    </button>
                    <button
                      onClick={() => handleDelete(pid)}
                      disabled={deleting === pid}
                      className="inline-flex justify-center items-center rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                    >
                      {deleting === pid ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
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
