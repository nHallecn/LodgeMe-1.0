import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@/types";

const AdminListingQueue = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState<Property[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const load = () => {
    adminAPI.getListingQueue()
      .then(({ data }) => setListings((data as { listings?: Property[] }).listings || []))
      .catch(() => setListings([]));
  };

  useEffect(load, []);

  const verify = async (id: string, status: "available" | "rejected") => {
    await adminAPI.verifyListing(id, status, reasons[id]);
    toast({ title: status === "available" ? "Listing approved" : "Listing rejected" });
    load();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold">Admin verification queue</h1>
          <p className="mt-1 text-muted-foreground">Review pending listings before they become public.</p>
        </div>

        <div className="grid gap-4">
          {listings.map((listing) => {
            const id = String(listing.id || listing._id);
            return (
              <Card key={id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="font-display text-xl">{listing.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{listing.city} · {listing.neighbourhood || listing.neighborhood}</p>
                  </div>
                  <Badge variant="secondary">{listing.status?.replace("_", " ")}</Badge>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-[180px_1fr]">
                  <div className="aspect-[4/3] overflow-hidden rounded-md bg-muted">
                    {listing.images?.[0] ? <img src={listing.images[0]} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{listing.description || "No description."}</p>
                    <p className="mt-3 font-medium">XAF {(listing.monthlyRent || 0).toLocaleString()} / month</p>
                    <Textarea
                      className="mt-4"
                      placeholder="Rejection reason"
                      value={reasons[id] || ""}
                      onChange={(event) => setReasons((prev) => ({ ...prev, [id]: event.target.value }))}
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button onClick={() => verify(id, "available")}>Approve</Button>
                      <Button variant="destructive" onClick={() => verify(id, "rejected")}>Reject</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!listings.length && (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No pending listings.</CardContent></Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminListingQueue;
