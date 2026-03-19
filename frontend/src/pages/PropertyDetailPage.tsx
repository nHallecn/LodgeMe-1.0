import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { propertiesAPI } from "@/lib/api";
import { Property, Room } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Star, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, roomsRes] = await Promise.all([
          propertiesAPI.getById(id!),
          propertiesAPI.getRooms(id!),
        ]);
        setProperty(propRes.data);
        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : roomsRes.data.rooms || []);
      } catch {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="font-display text-2xl font-bold">Property Not Found</h2>
          <Button asChild className="mt-4">
            <Link to="/properties">Back to Properties</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/properties" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>

        {/* Image gallery */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            {property.images?.[0] ? (
              <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <span className="font-display text-2xl font-bold text-muted-foreground">LodgeMe</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(property.images?.slice(1, 5) || [null, null, null, null]).map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl bg-muted">
                {img ? (
                  <img src={img} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-secondary" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Property info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge>{property.type}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-accent text-accent" /> 4.8
                </div>
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">{property.title}</h1>
              <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {property.address}, {property.city}, {property.region}
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-semibold mb-3">Description</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
              </CardContent>
            </Card>

            {property.amenities?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {property.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary" /> {a}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rooms */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">Available Rooms</h3>
              {rooms.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {rooms.map((room) => (
                    <Card key={room._id} className={!room.isAvailable ? "opacity-60" : ""}>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display font-semibold">Room {room.roomNumber}</span>
                          <Badge variant={room.isAvailable ? "default" : "secondary"}>
                            {room.isAvailable ? "Available" : "Occupied"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize mb-2">{room.type}</p>
                        <p className="font-display text-xl font-bold text-primary">
                          XAF {room.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/month</span>
                        </p>
                        {room.isAvailable && isAuthenticated && (
                          <Button size="sm" className="mt-3 w-full">Book This Room</Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No rooms listed yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold">Interested?</h3>
                {isAuthenticated ? (
                  <>
                    <Button className="w-full">Request a Visit</Button>
                    <Button variant="outline" className="w-full">Contact Landlord</Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Sign in to book a room or request a visit.</p>
                    <Button className="w-full" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/register">Create Account</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyDetailPage;
