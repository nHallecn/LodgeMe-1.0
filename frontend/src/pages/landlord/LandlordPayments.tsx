import { useState, useEffect } from "react";
import { paymentsAPI, bookingsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const METHODS = ["cash", "mobile_money", "bank_transfer", "other"];

const LandlordPayments = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [open,     setOpen]     = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({
    bookingId: "", amount: "", paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash", receiptNumber: "", notes: "",
  });

  const load = async () => {
    setLoading(true);
    const [pRes, bRes] = await Promise.allSettled([
      paymentsAPI.getByLandlord(),
      bookingsAPI.getByLandlord(),
    ]);
    if (pRes.status === "fulfilled") {
      const d = pRes.value.data;
      setPayments(Array.isArray(d) ? d : []);
    }
    if (bRes.status === "fulfilled") {
      const d = bRes.value.data;
      // Only show active bookings for recording payments
      const list = Array.isArray(d) ? d : [];
      setBookings(list.filter((b: Record<string, unknown>) => b.status === "active" || b.status === "confirmed" || b.status === "pending"));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRecord = async () => {
    if (!form.bookingId || !form.amount || !form.paymentDate) {
      toast({ title: "Please fill in Booking, Amount and Date", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await paymentsAPI.record({
        bookingId:     form.bookingId,
        amount:        parseFloat(form.amount),
        paymentDate:   form.paymentDate,
        paymentMethod: form.paymentMethod,
        receiptNumber: form.receiptNumber || null,
        notes:         form.notes || null,
      });
      toast({ title: "Payment recorded successfully" });
      setOpen(false);
      setForm({ bookingId: "", amount: "", paymentDate: new Date().toISOString().split("T")[0], paymentMethod: "cash", receiptNumber: "", notes: "" });
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast({ title: "Failed to record payment", description: e.response?.data?.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const total = payments.reduce((s, p) => s + parseFloat(String(p.amount || 0)), 0);

  return (
    <DashboardLayout title="Payments" subtitle="Record and track rent payments">
      <div className="mb-6 flex items-center justify-between">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2"><CreditCard className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-xl font-bold">XAF {total.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Collected</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2"><CreditCard className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-xl font-bold">{payments.length}</p><p className="text-xs text-muted-foreground">Payments Recorded</p></div>
          </CardContent></Card>
        </div>
        <button onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Record Payment
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : payments.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No payments recorded yet</p>
          <p className="text-sm text-muted-foreground mt-1">Click "Record Payment" to log a tenant's rent payment</p>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Booking ID", "Amount (XAF)", "Date", "Method", "Receipt #", "Notes"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={String(p.id)} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                  <td className="px-4 py-3 font-medium">#{String(p.bookingId)}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">
                    {parseFloat(String(p.amount)).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{String(p.paymentDate || "").split("T")[0]}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {String(p.paymentMethod || "").replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{String(p.receiptNumber || "—")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{String(p.notes || "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}

      {/* Record Payment Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record a Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Booking <span className="text-destructive">*</span></Label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.bookingId}
                onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
              >
                <option value="">— Select a booking —</option>
                {bookings.map((b) => (
                  <option key={String(b.id)} value={String(b.id)}>
                    Booking #{String(b.id)} — Room {String(b.roomId)} ({String(b.status)})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount (XAF) <span className="text-destructive">*</span></Label>
                <Input type="number" placeholder="50000" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <Label>Payment Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Payment Method</Label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                {METHODS.map(m => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <Label>Receipt Number <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input placeholder="RCP-2025-001" value={form.receiptNumber}
                onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })} />
            </div>
            <div>
              <Label>Notes <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input placeholder="e.g. March 2025 rent" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setOpen(false)}
              className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
              Cancel
            </button>
            <button onClick={handleRecord} disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Payment
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default LandlordPayments;
