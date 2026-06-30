import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { propertiesAPI } from "@/lib/api";
import { Property } from "@/types";
import {
  Search, Shield, Headphones, Eye, Smartphone, Users,
  Building2, CheckCircle, ArrowRight, Star, ChevronRight,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const testimonials = [
  { id: 1, name: "Alice M.", role: "Tenant", quote: "LodgeMe made finding my new apartment incredibly easy and stress-free. The listings were accurate, and connecting with landlords was seamless!" },
  { id: 2, name: "John K.", role: "Landlord", quote: "Managing my properties has never been simpler. LodgeMe's tools for invoicing and tracking payments are a game-changer for landlords in Cameroon." },
  { id: 3, name: "Sophie L.", role: "Tenant", quote: "No more fake agents! LodgeMe is a trustworthy platform that truly helps you find genuine rentals. Highly recommended!" },
];

const features = [
  { icon: Shield,      title: "Verified Listings",    desc: "Every property and landlord is thoroughly vetted for your peace of mind." },
  { icon: Headphones,  title: "24/7 Support",          desc: "Our team is always ready to assist you, from search to move-in." },
  { icon: Eye,         title: "Transparent Pricing",   desc: "No hidden fees, no surprises. What you see is what you pay." },
  { icon: Smartphone,  title: "Digital Management",    desc: "Manage invoices, payments, and maintenance tickets all in one place." },
  { icon: Users,       title: "Community Focused",     desc: "Building a trusted community for renters and property owners." },
  { icon: CheckCircle, title: "Easy Booking",          desc: "Book a visit or reserve a room in just a few clicks." },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const PropertyCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-[4/3] w-full" />
    <CardContent className="p-4 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-5 w-1/3 mt-2" />
    </CardContent>
  </Card>
);

const Index = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setFetchError("");
        // No limit param — fetch all then slice in JS to avoid any query issues
        const { data } = await propertiesAPI.getAll();
        const list: Property[] = Array.isArray(data) ? data : data.properties || [];
        // Show newest 6
        setFeaturedProperties(list.slice(0, 6));
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }, message?: string };
        const msg = e.response?.data?.message || e.message || "Failed to load properties";
        setFetchError(msg);
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const propertyCount = featuredProperties.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <motion.div className="max-w-2xl" initial="hidden" animate="visible" variants={stagger}>
            <motion.h1 variants={fadeUp} className="font-display text-4xl font-bold leading-tight text-background md:text-6xl">
              Your Next Home <br /><span className="text-primary">Awaits</span> in Cameroon
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-lg text-background/70 leading-relaxed max-w-lg">
              Discover trusted apartments, rooms, and minicités. Seamlessly connect with verified landlords across the country.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild className="gap-2 text-base">
                <Link to="/properties"><Search className="h-4 w-4" /> Browse Properties</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 text-base border-background/30 text-foreground hover:bg-background/10">
                <Link to="/register">List Your Property <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: propertyCount > 0 ? `${propertyCount}+` : "0", label: "Properties Listed" },
              { value: "2,000+", label: "Happy Tenants" },
              { value: "100+",   label: "Verified Landlords" },
              { value: "10+",    label: "Cities Covered" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <motion.div className="mb-12 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Badge variant="secondary" className="mb-3">Featured</Badge>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Discover Our Top Listings</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">Hand-picked properties offering the best value and comfort across Cameroon.</p>
          </motion.div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : fetchError ? (
            <div className="text-center py-12">
              <p className="text-sm text-destructive mb-2">Could not load properties: {fetchError}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : featuredProperties.length > 0 ? (
            <>
              <motion.div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              >
                {featuredProperties.map((property) => (
                  <motion.div key={property._id || property.id} variants={fadeUp}>
                    <PropertyCard
                      id={String(property._id || property.id)}
                      title={property.title || property.name || ""}
                      location={`${property.neighborhood || property.address || ""}, ${property.city}`}
                      price={property.rooms?.[0]?.price ?? 0}
                      type={property.type}
                      imageUrl={property.images?.[0]}
                      rooms={property.rooms?.length}
                    />
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-10 text-center">
                <Button variant="outline" size="lg" asChild className="gap-2">
                  <Link to="/properties">View All Properties <ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">No listings yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Be the first to list your property on LodgeMe!</p>
              <Button asChild className="mt-6"><Link to="/register">List a Property</Link></Button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div className="mb-12 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Badge variant="secondary" className="mb-3">Why LodgeMe?</Badge>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">A New Standard in Rentals</h2>
          </motion.div>
          <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="h-full border-border transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <motion.div className="mb-12 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Badge variant="secondary" className="mb-3">Testimonials</Badge>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">What Our Users Say</h2>
          </motion.div>
          <motion.div className="grid gap-6 md:grid-cols-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {testimonials.map((t) => (
              <motion.div key={t.id} variants={fadeUp}>
                <Card className="h-full border-border">
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground italic">"{t.quote}"</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to Find Your Perfect Place?
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-primary-foreground/80 max-w-lg mx-auto">
              Join LodgeMe today and experience the future of property rental in Cameroon.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="gap-2 text-base">
                <Link to="/properties"><Search className="h-4 w-4" /> Find a Rental</Link>
              </Button>
              <Button size="lg" asChild className="gap-2 text-base bg-background text-foreground hover:bg-background/90">
                <Link to="/register"><Building2 className="h-4 w-4" /> List Your Property</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
