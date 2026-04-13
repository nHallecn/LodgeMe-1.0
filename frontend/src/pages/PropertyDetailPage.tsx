import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { propertiesAPI, bookingsAPI, visitsAPI } from "@/lib/api";
import { Property, Room } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Star, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

function safeJson(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val as string); } catch { return []; }
}

function normaliseRoom(r: Record<string, unknown>): Room {
  return {
    _id:           String(r.id ?? r._id ?? ""),
    id:            r.id ?? r._id,
    property:      String(r.propertyId ?? r.property ?? ""),
    roomNumber:    String(r.roomNumber ?? ""),
    type:          String(r.roomType ?? r.type ?? ""),
    roomType:      String(r.roomType ?? r.type ?? ""),
    capacity:      Number(r.capacity) || 0,
    price:         parseFloat(String(r.monthlyRent ?? r.price ?? 0)),
    monthlyRent:   parseFloat(String(r.monthlyRent ?? r.price ?? 0)),
    cautionDeposit:Number(r.cautionDeposit) || 0,
    isAvailable:   Boolean(r.isAvailable ?? true),
    description:   String(r.description ?? ""),
    amenities:     safeJson(r.amenities),
    images:        safeJson(r.images),
  };
}

// ── Book Room Modal ────────────────────────────────────────────────────────
const BookRoomModal = ({ room, propertyTitle, open, onClose }:
  { room: Room; propertyTitle: string; open: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const navigate  = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate,   setEndDate]   = useState("");
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!startDate) { toast({ title: "Please select a move-in date", variant: "destructive" }); return; }
    const roomId = room._id || String(room.id ?? "");
    if (!roomId) { toast({ title: "Invalid room, please try again", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await bookingsAPI.create({ roomId, startDate, endDate: endDate || null });
      toast({ title: "Booking request sent!", description: "The landlord will confirm shortly." });
      onClose();
      navigate("/tenant/bookings");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast({ title: "Booking failed", description: e.response?.data?.message ?? "Please try again.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Room {room.roomNumber}</DialogTitle>
          <DialogDescription>{propertyTitle}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-secondary p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground capitalize">{room.type}</p>
              <p className="text-lg font-bold text-primary">
                XAF {room.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/month</span>
              </p>
            </div>
            <Badge>Room {room.roomNumber}</Badge>
          </div>
          <div className="space-y-2">
            <Label>Move-in Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={startDate} min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Move-out Date <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input type="date" value={endDate} min={startDate}
              onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <button onClick={onClose} disabled={loading}
            className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Confirm Booking
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Visit Request Modal ────────────────────────────────────────────────────
const VisitModal = ({ propertyId, propertyTitle, open, onClose }:
  { propertyId: string; propertyTitle: string; open: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const navigate  = useNavigate();
  const [date,    setDate]    = useState("");
  const [time,    setTime]    = useState("");
  const [notes,   setNotes]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date || !time) { toast({ title: "Please select a date and time", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await visitsAPI.create({ propertyId, requestedDate: date, requestedTime: time, notes });
      toast({ title: "Visit request sent!", description: "The landlord will contact you to confirm." });
      onClose();
      navigate("/tenant/visits");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast({ title: "Failed to send request", description: e.response?.data?.message ?? "Please try again.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Visit</DialogTitle>
          <DialogDescription>{propertyTitle}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Preferred Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={date} min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Preferred Time <span className="text-destructive">*</span></Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Notes <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Textarea placeholder="e.g. Coming with my family, interested in ground floor..."
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <button onClick={onClose} disabled={loading}
            className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send Request
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const PropertyDetailPage = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [property,       setProperty]       = useState<Property | null>(null);
  const [rooms,          setRooms]          = useState<Room[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedRoom,   setSelectedRoom]   = useState<Room | null>(null);
  const [bookModalOpen,  setBookModalOpen]  = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const propRes = await propertiesAPI.getById(id);
        const prop = propRes.data;
        setProperty(prop);
        const embedded = (prop.rooms || []) as Record<string, unknown>[];
        if (embedded.length > 0) {
          setRooms(embedded.map(normaliseRoom));
        } else {
          try {
            const r = await propertiesAPI.getRooms(id);
            const raw = Array.isArray(r.data) ? r.data : r.data?.rooms || [];
            setRooms(raw.map(normaliseRoom));
          } catch { setRooms([]); }
        }
      } catch { setProperty(null); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const isTenant = isAuthenticated && user?.role === "tenant";
  const propTitle = property?.title || property?.name || "";
  const propId    = String(property?._id ?? property?.id ?? "");
  const images    = safeJson(property?.images);
  const amenities = safeJson(property?.amenities);

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );

  if (!property) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-bold">Property Not Found</h2>
        <button onClick={() => navigate("/properties")}
          className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Back to Properties
        </button>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate("/properties")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </button>

        {/* Images */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            {images[0]
              ? <img src={images[0]} alt={propTitle} className="h-full w-full object-cover" />
              : <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <span className="font-display text-2xl font-bold text-muted-foreground">LodgeMe</span>
                </div>
            }
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[images[1], images[2], images[3], images[4]].map((img: string | null | undefined, i: number) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl bg-muted">
                {img ? <img src={img} alt="" className="h-full w-full object-cover" />
                      : <div className="h-full bg-secondary" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge>{property.type}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-accent text-accent" /> 4.8
                </div>
              </div>
              <h1 className="font-display text-3xl font-bold">{propTitle}</h1>
              <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {property.neighborhood ?? property.address}, {property.city}
              </div>
            </div>

            <Card><CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold mb-3">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
            </CardContent></Card>

            {amenities.length > 0 && (
              <Card><CardContent className="p-6">
                <h3 className="font-display text-lg font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> {a}
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            )}

            {/* Rooms */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">Available Rooms</h3>
              {rooms.length === 0
                ? <p className="text-sm text-muted-foreground">No rooms listed yet.</p>
                : (
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
                            XAF {room.price.toLocaleString()}
                            <span className="text-xs font-normal text-muted-foreground">/month</span>
                          </p>
                          {room.isAvailable && isTenant && (
                            <button onClick={() => { setSelectedRoom(room); setBookModalOpen(true); }}
                              className="mt-3 w-full inline-flex justify-center items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                              Book This Room
                            </button>
                          )}
                          {room.isAvailable && !isAuthenticated && (
                            <button onClick={() => navigate("/login")}
                              className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
                              Sign in to Book
                            </button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-display text-lg font-semibold">Interested?</h3>
                {isTenant ? (
                  <>
                    <button onClick={() => setVisitModalOpen(true)}
                      className="w-full inline-flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                      Request a Visit
                    </button>
                    <p className="text-xs text-center text-muted-foreground">
                      Or pick a specific room above and click "Book This Room"
                    </p>
                  </>
                ) : isAuthenticated ? (
                  <p className="text-sm text-muted-foreground">
                    Only tenants can book or request visits. You are logged in as a {user?.role}.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Sign in as a tenant to book or visit.</p>
                    <button onClick={() => navigate("/login")}
                      className="w-full inline-flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                      Sign In
                    </button>
                    <button onClick={() => navigate("/register")}
                      className="w-full inline-flex justify-center items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
                      Create Account
                    </button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {selectedRoom && (
        <BookRoomModal room={selectedRoom} propertyTitle={propTitle}
          open={bookModalOpen} onClose={() => { setBookModalOpen(false); setSelectedRoom(null); }} />
      )}
      <VisitModal propertyId={propId} propertyTitle={propTitle}
        open={visitModalOpen} onClose={() => setVisitModalOpen(false)} />

      <Footer />
    </div>
  );
};

export default PropertyDetailPage;
