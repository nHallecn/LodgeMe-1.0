import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listingsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const LodgMeListingForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    propertyType: "studio",
    city: "Douala",
    neighbourhood: "",
    addressRaw: "",
    monthlyRent: "",
    bedrooms: "1",
    bathrooms: "1",
    furnished: "unfurnished",
    advanceMonths: "3",
    cautionMonths: "1",
    description: "",
    amenities: "security, water, electricity",
    utilities: "water, electricity",
    images: "",
    latitude: "",
    longitude: "",
  });

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const images = form.images.split("\n").map((url) => url.trim()).filter(Boolean);
      await listingsAPI.create({
        ...form,
        monthlyRent: Number(form.monthlyRent),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        advanceMonths: Number(form.advanceMonths),
        cautionMonths: Number(form.cautionMonths),
        amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
        utilities: form.utilities.split(",").map((item) => item.trim()).filter(Boolean),
        images,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      });
      toast({ title: "Listing submitted", description: "It will appear publicly after admin verification." });
      navigate("/landlord/dashboard");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast({ title: "Could not submit listing", description: err.response?.data?.error?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold">Submit listing</h1>
          <p className="mt-1 text-muted-foreground">New LodgMe listings enter the admin verification queue.</p>
        </div>

        <form onSubmit={submit}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Listing details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field label="Title" value={form.title} onChange={(value) => update("title", value)} required />
              <div className="space-y-2">
                <Label>Property type</Label>
                <select value={form.propertyType} onChange={(event) => update("propertyType", event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {["chambre", "studio", "apartment", "villa", "commercial", "land"].map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <Field label="City" value={form.city} onChange={(value) => update("city", value)} required />
              <Field label="Neighbourhood" value={form.neighbourhood} onChange={(value) => update("neighbourhood", value)} />
              <Field label="Address" value={form.addressRaw} onChange={(value) => update("addressRaw", value)} required />
              <Field label="Monthly rent XAF" value={form.monthlyRent} onChange={(value) => update("monthlyRent", value)} required inputMode="numeric" />
              <Field label="Bedrooms" value={form.bedrooms} onChange={(value) => update("bedrooms", value)} inputMode="numeric" />
              <Field label="Bathrooms" value={form.bathrooms} onChange={(value) => update("bathrooms", value)} inputMode="numeric" />
              <div className="space-y-2">
                <Label>Furnished</Label>
                <select value={form.furnished} onChange={(event) => update("furnished", event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="unfurnished">unfurnished</option>
                  <option value="semi_furnished">semi furnished</option>
                  <option value="furnished">furnished</option>
                </select>
              </div>
              <Field label="Advance months" value={form.advanceMonths} onChange={(value) => update("advanceMonths", value)} inputMode="numeric" />
              <Field label="Caution months" value={form.cautionMonths} onChange={(value) => update("cautionMonths", value)} inputMode="numeric" />
              <Field label="Latitude" value={form.latitude} onChange={(value) => update("latitude", value)} />
              <Field label="Longitude" value={form.longitude} onChange={(value) => update("longitude", value)} />
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(event) => update("description", event.target.value)} rows={5} />
              </div>
              <Field label="Amenities" value={form.amenities} onChange={(value) => update("amenities", value)} />
              <Field label="Utilities" value={form.utilities} onChange={(value) => update("utilities", value)} />
              <div className="space-y-2 md:col-span-2">
                <Label>Image URLs</Label>
                <Textarea value={form.images} onChange={(event) => update("images", event.target.value)} rows={4} placeholder="One image URL per line" />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="gap-2" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit for verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
      <Footer />
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  required,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input value={value} onChange={(event) => onChange(event.target.value)} required={required} inputMode={inputMode} />
  </div>
);

export default LodgMeListingForm;
