import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listingsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@/types";

const formatMoney = (amount: number) => `XAF ${amount.toLocaleString()}`;

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [moveIn, setMoveIn] = useState("");
  const [durationMonths, setDurationMonths] = useState("12");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    listingsAPI.getById(id)
      .then(({ data }) => setListing((data as { listing?: Property }).listing || null))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  const price = listing?.monthlyRent || listing?.price || listing?.rooms?.[0]?.price || 0;
  const location = listing ? `${listing.neighbourhood || listing.neighborhood || listing.address}, ${listing.city}` : "";
  const whatsappHref = useMemo(() => {
    if (!listing?.landlordPhone) return "";
    const phone = listing.landlordPhone.replace(/\D/g, "");
    const text = encodeURIComponent(`Hello, I saw "${listing.title}" on LodgMe and I am interested.`);
    return `https://wa.me/${phone}?text=${text}`;
  }, [listing]);

  const submitInquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!listing?.id && !listing?._id) return;
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    if (user?.role !== "tenant") {
      toast({ title: "Tenant account required", description: "Only tenant profiles can send inquiries.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await listingsAPI.createInquiry(String(listing.id || listing._id), {
        message,
        desiredMoveIn: moveIn || null,
        durationMonths: durationMonths ? Number(durationMonths) : null,
      });
      toast({ title: "Inquiry sent", description: "The landlord or agent can reply from their inbox." });
      setMessage("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast({ title: "Could not send inquiry", description: err.response?.data?.error?.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Listing not found</h1>
          <Button asChild className="mt-5"><Link to="/listings">Back to listings</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            {listing.images?.[0] ? (
              <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#dbeafe,#f9fafb,#dcfce7)]">
                <span className="font-display text-2xl font-bold text-muted-foreground">LodgMe</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(listing.images || []).slice(1, 5).map((image) => (
              <div key={image} className="aspect-square overflow-hidden rounded-lg bg-muted">
                <img src={image} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge>{listing.propertyType || listing.type}</Badge>
                <Badge variant="secondary">{listing.furnished?.replace("_", " ") || "unfurnished"}</Badge>
                {listing.status === "available" && <Badge className="bg-success">Available</Badge>}
                {listing.landlordName && <Badge variant="outline"><ShieldCheck className="mr-1 h-3.5 w-3.5" /> {listing.landlordName}</Badge>}
              </div>
              <h1 className="font-display text-3xl font-bold">{listing.title}</h1>
              <p className="mt-2 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {location}
              </p>
              <p className="mt-4 font-display text-2xl font-bold text-primary">
                {formatMoney(price)} <span className="text-sm font-normal text-muted-foreground">/ month</span>
              </p>
            </div>

            <Card>
              <CardContent className="grid gap-4 p-5 sm:grid-cols-4">
                <Stat label="Bedrooms" value={listing.bedrooms || 1} />
                <Stat label="Bathrooms" value={listing.bathrooms || "-"} />
                <Stat label="Advance" value={`${listing.advanceMonths || 3} mo`} />
                <Stat label="Caution" value={`${listing.cautionMonths || 1} mo`} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-semibold">Description</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {listing.description || "No description provided."}
                </p>
              </CardContent>
            </Card>

            {(listing.amenities?.length || listing.utilities?.length) ? (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-xl font-semibold">Amenities and utilities</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[...(listing.amenities || []), ...(listing.utilities || [])].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" /> {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </section>

          <aside>
            <Card className="sticky top-24">
              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="font-display text-xl font-semibold">Send inquiry</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Ask about availability, visit timing, or payment terms.</p>
                </div>

                <form onSubmit={submitInquiry} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="moveIn">Desired move-in</Label>
                    <Input id="moveIn" type="date" value={moveIn} onChange={(event) => setMoveIn(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration months</Label>
                    <Input id="duration" value={durationMonths} onChange={(event) => setDurationMonths(event.target.value)} inputMode="numeric" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} rows={4} placeholder="I would like to visit this property..." />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                    Send inquiry
                  </Button>
                </form>

                {whatsappHref && (
                  <Button variant="outline" asChild className="w-full gap-2">
                    <a href={whatsappHref} target="_blank" rel="noreferrer">
                      <Phone className="h-4 w-4" /> WhatsApp landlord
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 font-display text-lg font-semibold">{value}</p>
  </div>
);

export default PropertyDetailPage;
