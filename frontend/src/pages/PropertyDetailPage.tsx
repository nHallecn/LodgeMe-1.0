import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { propertiesAPI, bookingsAPI, visitsAPI } from "@/lib/api";
import { Property, Room } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Star, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ── Book This Room modal ────────────────────────────────────────────────────
interface BookRoomModalProps {
  room: Room;
  propertyTitle: string;
  open: boolean;
  onClose: () => void;
}

const BookRoomModal = ({ room, propertyTitle, open, onClose }: BookRoomModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!startDate) {
      toast({ title: "Please select a move-in date", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // FIX: use numeric id (room.id || room._id) — the /rooms endpoint returns
      // numeric ids from MySQL, not MongoDB-style _id strings.
      const roomId = Number(room.id ?? room._id);
      await bookingsAPI.create({
        roomId,
        startDate,
        endDate: endDate || null,
      });
      toast({
        title: "Booking request sent!",
        description: "Your booking has been submitted. The landlord will confirm shortly.",
      });
      onClose();
      navigate("/tenant/bookings");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: "Booking failed",
        description: error.response?.data?.message || "Could not submit booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Book Room {room.roomNumber}</DialogTitle>
          <DialogDescription>{propertyTitle}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-secondary p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground capitalize">{room.type} room</p>
              <p className="font-display text-lg font-bold text-primary">
                XAF {room.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/month</span>
              </p>
            </div>
            <Badge>Room {room.roomNumber}</Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Move-in Date <span className="text-destructive">*</span></Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">
              Move-out Date <span className="text-xs text-muted-foreground">(optional — leave blank for open-ended)</span>
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              min={startDate || new Date().toISOString().split("T")[0]}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Request a Visit modal ───────────────────────────────────────────────────
interface VisitModalProps {
  propertyId: string;
  propertyTitle: string;
  open: boolean;
  onClose: () => void;
}

const VisitModal = ({ propertyId, propertyTitle, open, onClose }: VisitModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date || !time) {
      toast({ title: "Please select a date and time for your visit", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await visitsAPI.create({
        propertyId: Number(propertyId),   // backend expects integer FK
        requestedDate: date,
        requestedTime: time,
        notes,
      });
      toast({
        title: "Visit request sent!",
        description: "The landlord will review your request and get back to you.",
      });
      onClose();
      navigate("/tenant/visits");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: "Failed to send visit request",
        description: error.response?.data?.message || "Could not submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Request a Visit</DialogTitle>
          <DialogDescription>{propertyTitle}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="visitDate">Preferred Date <span className="text-destructive">*</span></Label>
            <Input
              id="visitDate"
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visitTime">Preferred Time <span className="text-destructive">*</span></Label>
            <Input
              id="visitTime"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visitNotes">
              Additional Notes <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="visitNotes"
              placeholder="e.g. I'm interested in a 2-room unit, coming with my family..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Main page ───────────────────────────────────────────────────────────────
const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const propRes = await propertiesAPI.getById(id!);
        const prop: Property = propRes.data;
        setProperty(prop);

        // FIX: prefer rooms already embedded in the property response (they have
        // correct numeric ids). Only call getRooms as a fallback.
        if (prop.rooms && prop.rooms.length > 0) {
          setRooms(prop.rooms);
        } else {
          const roomsRes = await propertiesAPI.getRooms(id!);
          setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : roomsRes.data.rooms || []);
        }
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
          <Button asChild className="mt-4"><Link to="/properties">Back to Properties</Link></Button>
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
                {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-secondary" />}
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
                  {rooms.map((room) => {
                    // FIX: rooms from the embedded property.rooms array carry a
                    // numeric `id` field. Normalise to a stable key.
                    const roomKey = String(room.id ?? room._id);
                    return (
                      <Card key={roomKey} className={!room.isAvailable ? "opacity-60" : ""}>
                        <CardContent className="p-5">
                          {/* Room image thumbnail */}
                          {room.images?.[0] && (
                            <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-muted">
                              <img src={room.images[0]} alt={`Room ${room.roomNumber}`} className="h-full w-full object-cover" />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-display font-semibold">Room {room.roomNumber}</span>
                            <Badge variant={room.isAvailable ? "default" : "secondary"}>
                              {room.isAvailable ? "Available" : "Occupied"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize mb-2">{room.type}</p>
                          {room.capacity && (
                            <p className="text-xs text-muted-foreground mb-1">Capacity: {room.capacity} person{room.capacity !== 1 ? "s" : ""}</p>
                          )}
                          <p className="font-display text-xl font-bold text-primary">
                            XAF {room.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/month</span>
                          </p>
                          {room.cautionDeposit && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Caution: XAF {Number(room.cautionDeposit).toLocaleString()}
                            </p>
                          )}
                          {room.isAvailable && isAuthenticated && user?.role === "tenant" && (
                            <Button
                              size="sm"
                              className="mt-3 w-full"
                              onClick={() => { setSelectedRoom(room); setBookModalOpen(true); }}
                            >
                              Book This Room
                            </Button>
                          )}
                          {room.isAvailable && !isAuthenticated && (
                            <Button size="sm" variant="outline" className="mt-3 w-full" asChild>
                              <Link to="/login">Sign in to Book</Link>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
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
                  user?.role === "tenant" ? (
                    <>
                      <Button className="w-full" onClick={() => setVisitModalOpen(true)}>
                        Request a Visit
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Or book a specific room directly above
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Only tenants can book rooms or request visits.
                    </p>
                  )
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Sign in to book a room or request a visit.</p>
                    <Button className="w-full" asChild><Link to="/login">Sign In</Link></Button>
                    <Button variant="outline" className="w-full" asChild><Link to="/register">Create Account</Link></Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {selectedRoom && (
        <BookRoomModal
          room={selectedRoom}
          propertyTitle={property.title}
          open={bookModalOpen}
          onClose={() => { setBookModalOpen(false); setSelectedRoom(null); }}
        />
      )}

      {/* Visit request modal */}
      <VisitModal
        propertyId={String(property._id || property.id)}
        propertyTitle={property.title}
        open={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default PropertyDetailPage;
