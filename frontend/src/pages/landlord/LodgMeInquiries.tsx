import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inquiriesAPI } from "@/lib/api";
import type { Inquiry } from "@/types";

const LodgMeInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const load = () => {
    inquiriesAPI.getByLandlord()
      .then(({ data }) => setInquiries((data as { inquiries?: Inquiry[] }).inquiries || []))
      .catch(() => setInquiries([]));
  };

  useEffect(load, []);

  const markRead = async (id: string) => {
    await inquiriesAPI.update(id, { status: "read" });
    load();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Inquiry inbox</h1>
        <div className="mt-6 grid gap-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="font-display text-lg">{inquiry.listingTitle || "Listing inquiry"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{inquiry.tenantName || inquiry.tenantPhone}</p>
                </div>
                <Badge variant="secondary">{inquiry.status.replace("_", " ")}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{inquiry.message || "No message provided."}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => markRead(inquiry.id)}>Mark read</Button>
                  {inquiry.tenantPhone && (
                    <Button size="sm" asChild>
                      <a href={`https://wa.me/${inquiry.tenantPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp tenant</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {!inquiries.length && (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No inquiries yet.</CardContent></Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LodgMeInquiries;
