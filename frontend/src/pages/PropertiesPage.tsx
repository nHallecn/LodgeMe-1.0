import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { propertiesAPI } from "@/lib/api";
import { Property } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";

const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const cities = ["Douala", "Yaounde", "Buea", "Limbe", "Kribi", "Bamenda"];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (selectedCity) params.city = selectedCity;
        const { data } = await propertiesAPI.getAll(params);
        setProperties(Array.isArray(data) ? data : data.properties || []);
      } catch {
        // Use sample data if API is not available
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [search, selectedCity]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="border-b border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Browse Properties</h1>
          <p className="mt-2 text-muted-foreground">Find your perfect rental across Cameroon</p>

          {/* Search bar */}
          <div className="mt-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by title, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
          </div>

          {/* City filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant={selectedCity === "" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedCity("")}
            >
              All Cities
            </Badge>
            {cities.map((city) => (
              <Badge
                key={city}
                variant={selectedCity === city ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Property grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  id={property._id}
                  title={property.title}
                  location={`${property.city}, ${property.region}`}
                  price={property.rooms?.[0]?.price || 0}
                  type={property.type}
                  imageUrl={property.images?.[0]}
                  rooms={property.rooms?.length}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg font-medium text-foreground">No properties found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or check back later for new listings.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PropertiesPage;
