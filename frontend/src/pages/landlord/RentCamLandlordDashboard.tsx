import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Eye, MessageCircle, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inquiriesAPI, listingsAPI } from "@/lib/api";
import type { Inquiry, Property } from "@/types";

const RentCamLandlordDashboard = () => {
  const [listings, setListings] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    listingsAPI.getMine()
      .then(({ data }) => setListings((data as { listings?: Property[] }).listings || []))
      .catch(() => setListings([]));
    inquiriesAPI.getByLandlord()
      .then(({ data }) => setInquiries((data as { inquiries?: Inquiry[] }).inquiries || []))
      .catch(() => setInquiries([]));
  }, []);

  const pending = useMemo(() => listings.filter((item) => item.status === "pending_review").length, [listings]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold">Landlord workspace</h1>
            <p className="mt-1 text-muted-foreground">Manage listings, verification status, and tenant inquiries.</p>
          </div>
          <Button asChild className="gap-2"><Link to="/landlord/listings/new"><Plus className="h-4 w-4" /> New listing</Link></Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric icon={Building2} label="Listings" value={listings.length} />
          <Metric icon={Eye} label="Pending review" value={pending} />
          <Metric icon={MessageCircle} label="Inquiries" value={inquiries.length} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Your listings</CardTitle>
            </CardHeader>
            <CardContent>
              {listings.length ? (
                <div className="divide-y">
                  {listings.map((listing) => (
                    <div key={String(listing.id || listing._id)} className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">{listing.city} · XAF {(listing.monthlyRent || 0).toLocaleString()}</p>
                      </div>
                      <Badge variant={listing.status === "available" ? "default" : "secondary"}>{listing.status?.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No listings submitted yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Inquiry inbox</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiries.length ? (
                <div className="space-y-4">
                  {inquiries.slice(0, 6).map((inquiry) => (
                    <div key={inquiry.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{inquiry.tenantName || inquiry.tenantPhone}</p>
                        <Badge variant="secondary">{inquiry.status.replace("_", " ")}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{inquiry.message || inquiry.listingTitle}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">Tenant inquiries will appear here.</p>
              )}
              <Button variant="outline" asChild className="mt-5 w-full">
                <Link to="/landlord/inquiries">Open inbox</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: number }) => (
  <Card>
    <CardContent className="flex items-center justify-between p-5">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-display text-3xl font-bold">{value}</p>
      </div>
      <div className="rounded-md bg-primary/10 p-3 text-primary">
        <Icon className="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
);

export default RentCamLandlordDashboard;
