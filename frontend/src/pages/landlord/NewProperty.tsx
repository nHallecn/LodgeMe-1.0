import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { propertiesAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NewProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", address: "", city: "", region: "", type: "apartment", amenities: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await propertiesAPI.create({
        ...form,
        amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      });
      toast({ title: "Property created successfully" });
      navigate("/landlord/properties");
    } catch {
      toast({ title: "Failed to create property", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <DashboardLayout title="Add New Property" subtitle="List a new property on LodgeMe">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="font-display">Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. Modern Apartment in Douala" value={form.title} onChange={(e) => update("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe your property..." value={form.description} onChange={(e) => update("description", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="e.g. Douala" value={form.city} onChange={(e) => update("city", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Input placeholder="e.g. Littoral" value={form.region} onChange={(e) => update("region", e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="Full address" value={form.address} onChange={(e) => update("address", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Property Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                <option value="apartment">Apartment</option>
                <option value="minicite">Minicité</option>
                <option value="studio">Studio</option>
                <option value="villa">Villa</option>
                <option value="house">House</option>
                <option value="room">Room</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Amenities (comma separated)</Label>
              <Input placeholder="e.g. WiFi, Parking, Security" value={form.amenities} onChange={(e) => update("amenities", e.target.value)} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Property
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default NewProperty;
