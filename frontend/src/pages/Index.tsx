import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2, CheckCircle2, MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listingsAPI } from "@/lib/api";
import type { Property } from "@/types";
import heroBg from "@/assets/hero-bg.jpg";

const cities = ["Douala", "Yaounde", "Buea", "Limbe"];

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

      <section className="relative min-h-[620px] overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30" />
        <div className="relative container mx-auto flex min-h-[620px] flex-col justify-center px-4 py-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <Badge className="mb-5 bg-white/15 text-white hover:bg-white/20">
              <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Verified rentals for Cameroon
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-6xl">
              RentCam
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/78">
              Find verified rooms, studios, apartments, villas, and commercial spaces across Cameroon with direct landlord and agent contact.
            </p>

            <form onSubmit={submitSearch} className="mt-8 grid max-w-2xl gap-3 rounded-lg bg-white p-2 shadow-xl sm:grid-cols-[1fr_150px_auto]">
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
              <Button type="submit" className="h-11 gap-2">
                Search <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <section className="border-b bg-white">
        <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-3">
          {[
            ["Manual verification", "Admin-reviewed listings before they go live."],
            ["Phone-first access", "Cameroon number OTP flow for tenants, landlords, and agents."],
            ["Local rental terms", "Advance, caution, furnished state, and neighbourhood filters."],
          ].map(([title, body]) => (
            <div key={title} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="mb-3">
              <Sparkles className="mr-2 h-3.5 w-3.5" /> Fresh listings
            </Badge>
            <h2 className="font-display text-3xl font-bold">Available now</h2>
            <p className="mt-2 text-muted-foreground">Public listings only appear here after verification.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/listings">View all listings</Link>
          </Button>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <PropertyCard
                key={listing.id || listing._id}
                id={String(listing.id || listing._id)}
                title={listing.title}
                location={`${listing.neighbourhood || listing.neighborhood || listing.address}, ${listing.city}`}
                price={listing.monthlyRent || listing.price || listing.rooms?.[0]?.price || 0}
                type={listing.propertyType || listing.type}
                imageUrl={listing.images?.[0]}
                rooms={listing.bedrooms}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-10 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No verified listings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create a landlord account and submit the first RentCam listing.</p>
            <Button asChild className="mt-5">
              <Link to="/auth/register">List property</Link>
            </Button>
          </div>
        )}
      </section>

      <section className="bg-slate-950 py-12 text-white">
        <div className="container mx-auto grid gap-8 px-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold">Built for Douala, Yaounde, and the way rentals actually work.</h2>
            <p className="mt-3 text-white/70">
              RentCam tracks advance months, caution, verification state, inquiries, and local neighbourhood discovery from day one.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            {["PostgreSQL + PostGIS-ready", "French/English product model", "Campay payment phase prepared"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md bg-white/8 px-4 py-3">
                <MapPin className="h-4 w-4 text-primary" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
