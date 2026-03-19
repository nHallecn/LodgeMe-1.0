import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { maintenanceAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NewMaintenanceTicket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", roomId: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await maintenanceAPI.create({ title: form.title, description: form.description, priority: form.priority, room: form.roomId });
      toast({ title: "Maintenance request submitted" });
      navigate("/tenant/maintenance");
    } catch {
      toast({ title: "Failed to submit request", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <DashboardLayout title="New Maintenance Request" subtitle="Submit a maintenance issue">
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="font-display">Issue Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. Broken faucet in bathroom" value={form.title} onChange={(e) => update("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the issue in detail..." value={form.description} onChange={(e) => update("description", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.priority} onChange={(e) => update("priority", e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Room ID</Label>
              <Input placeholder="Enter your room ID" value={form.roomId} onChange={(e) => update("roomId", e.target.value)} required />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Request
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default NewMaintenanceTicket;
