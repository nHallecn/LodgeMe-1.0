import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  Clock3,
  Home,
  Landmark,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listingsAPI } from "@/lib/api";
import type { Property } from "@/types";
import heroBg from "@/assets/hero-bg.jpg";

const cities = ["Douala", "Yaounde", "Buea", "Limbe", "Kribi"];

const cityCards = [
  { city: "Douala", note: "Business districts, studios, family apartments", avg: "185k XAF", accent: "bg-primary" },
  { city: "Yaounde", note: "Bastos, Odza, Mvan, student and diplomatic areas", avg: "160k XAF", accent: "bg-success" },
  { city: "Buea", note: "Molyko, bonduma, student rooms, hillside studios", avg: "95k XAF", accent: "bg-warning" },
];

const trustItems = [
  "Verified listing queue",
  "Direct landlord contact",
  "Cameroon phone OTP",
  "Advance and caution terms",
  "Agent-ready dashboards",
  "WhatsApp inquiries",
  "Admin review flow",
  "PostGIS location-ready",
];

const steps = [
  {
    icon: Search,
    title: "Search the right city",
    body: "Filter by neighbourhood, price, furnished state, and local rental terms.",
  },
  {
    icon: ShieldCheck,
    title: "Trust the listing",
    body: "Listings move through review before tenants see them publicly.",
  },
  {
    icon: MessageCircle,
    title: "Talk to the owner",
    body: "Send a clean inquiry or open WhatsApp with the listing already referenced.",
  },
];

const ownerFeatures = [
  "Submit listings for verification",
  "Track pending, approved, and rejected properties",
  "Manage tenant inquiries from one inbox",
  "Prepare for digital leases and mobile money payments",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const Index = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Douala");
  const [listings, setListings] = useState<Property[]>([]);

  useEffect(() => {
    listingsAPI.getAll({ limit: "6" })
      .then(({ data }) => setListings((data as { listings?: Property[] }).listings || []))
      .catch(() => setListings([]));
  }, []);

  const displayListings = useMemo(() => listings.slice(0, 6), [listings]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-slate-950">
        <img src={heroBg} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-[0.72] motion-safe:animate-hero-kenburns" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,6,23,0.96)_0%,rgba(15,23,42,0.88)_45%,rgba(26,111,168,0.46)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)] motion-safe:animate-shimmer-line" />

        <div className="relative container mx-auto grid min-h-[720px] gap-10 px-4 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
              <Badge className="mb-5 bg-white/[0.12] text-white hover:bg-white/[0.16]">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Cameroon rentals, made irresistible
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="font-display text-5xl font-extrabold leading-[1.01] text-white md:text-7xl"
            >
              LodgMe
            </motion.h1>
            <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              A sharper way to find your next room, studio, apartment, villa, or commercial space. Verified listings, clean inquiries, and local rental terms that actually match Cameroon.
            </motion.p>

            <motion.form
              variants={fadeUp}
              transition={{ duration: 0.62 }}
              onSubmit={submitSearch}
              className="mt-8 grid max-w-2xl gap-3 rounded-lg bg-white p-2 shadow-[0_28px_80px_rgba(0,0,0,0.35)] sm:grid-cols-[1fr_150px_auto]"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Neighbourhood, city, or address"
                  className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
                />
              </div>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm"
              >
                {cities.map((item) => <option key={item}>{item}</option>)}
              </select>
              <Button type="submit" className="h-11 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                Search <ArrowRight className="h-4 w-4 motion-safe:animate-nudge-x" />
              </Button>
            </motion.form>

            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="mt-8 grid max-w-xl grid-cols-3 gap-4 text-white">
              <HeroMetric value="90d" label="listing renewal" />
              <HeroMetric value="3+" label="photos per home" />
              <HeroMetric value="24h" label="visit follow-up" />
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth/register"><UserPlus className="h-4 w-4" /> Create free account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/[0.08] text-white hover:bg-white/[0.14]">
                <Link to="/landlord/listings/new">List a property</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="hidden lg:block"
          >
            <HeroShowcase />
          </motion.div>
        </div>
      </section>

      <section className="overflow-hidden border-b bg-white">
        <div className="flex w-max gap-3 px-4 py-5 motion-safe:animate-marquee">
          {[...trustItems, ...trustItems].map((item, index) => (
            <div key={`${item}-${index}`} className="flex min-w-max items-center gap-2 rounded-md border bg-background px-4 py-3 text-sm shadow-sm">
              <BadgeCheck className="h-4 w-4 text-primary" /> {item}
            </div>
          ))}
        </div>
      </section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="container mx-auto px-4 py-16"
      >
        <motion.div variants={fadeUp} className="mb-8 max-w-2xl">
          <Badge variant="secondary" className="mb-3">City guide</Badge>
          <h2 className="font-display text-3xl font-bold md:text-4xl">Start in the neighbourhoods that matter.</h2>
          <p className="mt-3 text-muted-foreground">LodgMe is shaped around local rental language, city habits, and the practical details people ask before visiting.</p>
        </motion.div>
        <div className="grid gap-5 md:grid-cols-3">
          {cityCards.map((item) => (
            <motion.div key={item.city} variants={fadeUp} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
              <Card className="group overflow-hidden transition-shadow hover:shadow-xl">
                <CardContent className="p-0">
                  <div className={`h-2 ${item.accent} motion-safe:animate-shimmer-line`} />
                  <div className="p-6">
                    <MapPin className="mb-4 h-6 w-6 text-primary transition-transform group-hover:-translate-y-1" />
                    <h3 className="font-display text-2xl font-semibold">{item.city}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">{item.note}</p>
                    <div className="mt-5 rounded-md bg-secondary px-4 py-3">
                      <p className="text-xs uppercase text-muted-foreground">Typical monthly rent</p>
                      <p className="font-display text-xl font-bold">{item.avg}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="relative overflow-hidden bg-slate-950 py-16 text-white">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative container mx-auto px-4">
          <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge className="mb-3 bg-white/[0.12] text-white hover:bg-white/[0.16]">Simple flow</Badge>
              <h2 className="font-display text-3xl font-bold md:text-4xl">A smoother path from search to visit.</h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-white/[0.64]">
              Classic real-estate cues meet a lightweight digital workflow: fewer surprises, clearer follow-up, and a cleaner path from search to inquiry.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                whileHover={{ y: -8, backgroundColor: "rgba(255,255,255,0.12)" }}
                className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-6"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-slate-950">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-3xl font-bold text-white/[0.18]">0{index + 1}</span>
                </div>
                <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/[0.65]">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="mb-3">
              <Sparkles className="mr-2 h-3.5 w-3.5" /> Fresh listings
            </Badge>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Available now</h2>
            <p className="mt-2 text-muted-foreground">Public listings appear here after verification.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/listings">View all listings</Link>
          </Button>
        </div>

        {displayListings.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayListings.map((listing, index) => (
              <motion.div
                key={listing.id || listing._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: index * 0.06 }}
              >
                <PropertyCard
                  id={String(listing.id || listing._id)}
                  title={listing.title}
                  location={`${listing.neighbourhood || listing.neighborhood || listing.address}, ${listing.city}`}
                  price={listing.monthlyRent || listing.price || listing.rooms?.[0]?.price || 0}
                  type={listing.propertyType || listing.type}
                  imageUrl={listing.images?.[0]}
                  rooms={listing.bedrooms}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-lg border bg-card p-10 text-center shadow-sm"
          >
            <Building2 className="mx-auto mb-3 h-10 w-10 text-primary" />
            <p className="font-medium">No verified listings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create a landlord account and submit the first LodgMe listing.</p>
            <Button asChild className="mt-5 gap-2">
              <Link to="/auth/register">Start now <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </motion.div>
        )}
      </section>

      <section className="border-y bg-white">
        <div className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Badge variant="secondary" className="mb-3">For owners and agents</Badge>
            <h2 className="font-display text-3xl font-bold md:text-4xl">A lively desk for managing rental supply.</h2>
            <p className="mt-3 text-muted-foreground">
              Publish properties, follow review status, and respond to tenants without losing context across phone calls and scattered messages.
            </p>
            <Button asChild className="mt-6 gap-2">
              <Link to="/landlord/listings/new">Submit a listing <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ownerFeatures.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: index * 0.08 }}
                className="group flex items-start gap-3 rounded-md border bg-background p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-success transition-transform group-hover:scale-110" />
                <p className="text-sm font-medium">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-5 md:grid-cols-4">
          <ClassicPillar icon={Home} title="Residential" body="Rooms, studios, apartments, and villas with local rental terms." />
          <ClassicPillar icon={Landmark} title="Commercial" body="Spaces for shops, offices, and service businesses." />
          <ClassicPillar icon={Banknote} title="Transparent" body="Advance, caution, monthly rent, and agent fee fields stay visible." />
          <ClassicPillar icon={Clock3} title="Prepared" body="Built for future leases, receipts, and mobile money payments." />
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(120deg,transparent_0%,rgba(255,255,255,.42)_50%,transparent_100%)] motion-safe:animate-sweep" />
        <div className="relative container mx-auto flex flex-col justify-between gap-6 px-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide opacity-80">LodgMe Cameroon</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Make your next rental move feel obvious.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" asChild>
              <Link to="/listings">Browse listings</Link>
            </Button>
            <Button className="bg-white text-foreground shadow-lg hover:bg-white/90" asChild>
              <Link to="/auth/register">Create account</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const HeroShowcase = () => (
  <div className="relative h-[560px]">
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      className="absolute right-0 top-8 w-[430px] rounded-lg border border-white/[0.18] bg-white/[0.12] p-4 shadow-2xl backdrop-blur-md"
    >
      <div className="rounded-md bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Featured neighbourhood</p>
            <h2 className="font-display text-2xl font-bold">Bonamoussadi Studio</h2>
          </div>
          <Badge className="bg-success">Verified</Badge>
        </div>
        <div className="mt-4 aspect-[4/3] overflow-hidden rounded-md">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <MiniStat label="Rent" value="185k" />
          <MiniStat label="Advance" value="3 mo" />
          <MiniStat label="Caution" value="1 mo" />
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1 gap-2"><MessageCircle className="h-4 w-4" /> Inquire</Button>
          <Button variant="outline" className="gap-2"><Phone className="h-4 w-4" /> WhatsApp</Button>
        </div>
      </div>
    </motion.div>

    <motion.div
      animate={{ x: [0, 12, 0], y: [0, 10, 0] }}
      transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
      className="absolute bottom-24 left-4 w-64 rounded-lg border border-white/20 bg-slate-950/[0.78] p-4 text-white shadow-xl backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Inquiry sent</p>
          <p className="text-xs text-white/[0.62]">Tenant profile attached</p>
        </div>
      </div>
    </motion.div>

    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
      className="absolute left-16 top-16 w-56 rounded-lg border border-white/[0.16] bg-white p-4 shadow-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">Douala</span>
        <MapPin className="h-4 w-4 text-primary" />
      </div>
      <div className="relative h-28 overflow-hidden rounded-md bg-[linear-gradient(135deg,#dbeafe,#f8fafc,#dcfce7)]">
        <span className="absolute left-5 top-5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20 motion-safe:animate-ping-soft" />
        <span className="absolute right-8 top-12 h-3 w-3 rounded-full bg-success ring-4 ring-success/20 motion-safe:animate-ping-soft" />
        <span className="absolute bottom-6 left-20 h-3 w-3 rounded-full bg-warning ring-4 ring-warning/20 motion-safe:animate-ping-soft" />
      </div>
    </motion.div>
  </div>
);

const HeroMetric = ({ value, label }: { value: string; label: string }) => (
  <motion.div whileHover={{ y: -5 }} className="rounded-md border border-white/[0.14] bg-white/10 p-3 backdrop-blur">
    <p className="font-display text-2xl font-bold">{value}</p>
    <p className="text-xs text-white/[0.62]">{label}</p>
  </motion.div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md bg-secondary p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-display text-lg font-bold">{value}</p>
  </div>
);

const ClassicPillar = ({ icon: Icon, title, body }: { icon: typeof Home; title: string; body: string }) => (
  <motion.div whileHover={{ y: -7 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
    <Card className="h-full transition-shadow hover:shadow-lg">
      <CardContent className="p-5">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default Index;
