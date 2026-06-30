import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Heart, MessageCircle, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inquiriesAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Inquiry } from "@/types";

const DashboardPage = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    inquiriesAPI.getMine()
      .then(({ data }) => setInquiries((data as { inquiries?: Inquiry[] }).inquiries || []))
      .catch(() => setInquiries([]));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold">Tenant dashboard</h1>
            <p className="mt-1 text-muted-foreground">Welcome back, {user?.name || user?.phone}.</p>
          </div>
          <Button asChild className="gap-2"><Link to="/listings"><Search className="h-4 w-4" /> Search rentals</Link></Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric icon={MessageCircle} label="Inquiries" value={inquiries.length} />
          <Metric icon={Heart} label="Saved listings" value={0} />
          <Metric icon={Building2} label="Active leases" value={0} />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-display">Recent inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {inquiries.length ? (
              <div className="divide-y">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{inquiry.listingTitle || `Listing ${inquiry.propertyId}`}</p>
                      <p className="text-sm text-muted-foreground">{inquiry.message || "No message"}</p>
                    </div>
                    <Badge variant="secondary">{inquiry.status.replace("_", " ")}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Your listing inquiries will appear here.</p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }: { icon: typeof Search; label: string; value: number }) => (
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

export default DashboardPage;
