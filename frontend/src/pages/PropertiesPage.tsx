import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Map, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listingsAPI } from "@/lib/api";
import type { Property } from "@/types";

const propertyTypes = ["chambre", "studio", "apartment", "villa", "commercial"];

const PropertiesPage = () => {
  const [params, setParams] = useSearchParams();
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("search") || "");
  const [city, setCity] = useState(params.get("city") || "");
  const [propertyType, setPropertyType] = useState(params.get("propertyType") || "");
  const [maxRent, setMaxRent] = useState(params.get("maxRent") || "");

  const query = useMemo(() => {
    const next: Record<string, string> = {};
    if (search) next.search = search;
    if (city) next.city = city;
    if (propertyType) next.propertyType = propertyType;
    if (maxRent) next.maxRent = maxRent;
    return next;
  }, [search, city, propertyType, maxRent]);

  useEffect(() => {
    setLoading(true);
    listingsAPI.getAll(query)
      .then(({ data }) => setListings((data as { listings?: Property[] }).listings || []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));

    const next = new URLSearchParams(query);
    setParams(next, { replace: true });
  }, [query, setParams]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold">Search rentals</h1>
              <p className="mt-1 text-muted-foreground">Filter verified listings by city, property type, and monthly rent.</p>
            </div>
            <Button asChild>
              <Link to="/landlord/listings/new">Submit listing</Link>
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_150px_170px_150px_auto]">
            <Input placeholder="Search neighbourhood or description" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Input placeholder="City" value={city} onChange={(event) => setCity(event.target.value)} />
            <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Any type</option>
              {propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <Input placeholder="Max XAF" value={maxRent} onChange={(event) => setMaxRent(event.target.value)} inputMode="numeric" />
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <Badge variant="secondary">{listings.length} listings</Badge>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
              <p className="font-medium">No matching listings</p>
              <p className="mt-1 text-sm text-muted-foreground">Try another city, price range, or property type.</p>
            </div>
          )}
        </div>

        <aside className="hidden rounded-lg border bg-white p-4 lg:block">
          <div className="mb-3 flex items-center gap-2 font-medium">
            <Map className="h-4 w-4 text-primary" /> Map area
          </div>
          <div className="aspect-[4/5] rounded-md bg-[linear-gradient(135deg,#dbeafe_0%,#f9fafb_45%,#dcfce7_100%)] p-4">
            <div className="relative h-full rounded-md border border-white/80 bg-white/55 p-4 text-sm text-muted-foreground backdrop-blur">
              <span className="absolute left-8 top-10 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">Bonamoussadi</span>
              <span className="absolute right-8 top-28 rounded-full bg-success px-3 py-1 text-xs font-medium text-white">Bastos</span>
              <span className="absolute bottom-20 left-12 rounded-full bg-warning px-3 py-1 text-xs font-medium text-white">Molyko</span>
              <span className="absolute bottom-8 right-10 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">Akwa</span>
            </div>
          </div>
        </aside>
      </section>

      <Footer />
    </div>
  );
};

export default PropertiesPage;
