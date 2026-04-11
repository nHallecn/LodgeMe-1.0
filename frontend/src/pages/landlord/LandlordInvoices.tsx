import { useState, useEffect } from "react";
import { invoicesAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: number;
  bookingId: number;
  landlordId: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  createdAt: string;
}

const statusColor: Record<string, string> = {
  paid:      "bg-green-100 text-green-800",
  pending:   "bg-yellow-100 text-yellow-800",
  overdue:   "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const LandlordInvoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data } = await invoicesAPI.getByLandlord();
        setInvoices(Array.isArray(data) ? data : data.invoices || []);
      } catch {
        toast({ title: "Failed to load invoices", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [toast]);

  const handleMarkPaid = async (invoice: Invoice) => {
    setUpdating(invoice.id);
    try {
      const today = new Date().toISOString().split("T")[0];
      await invoicesAPI.updateStatus(String(invoice.id), "paid", today);
      setInvoices((prev) =>
        prev.map((inv) => inv.id === invoice.id ? { ...inv, status: "paid", paidDate: today } : inv)
      );
      toast({ title: "Invoice marked as paid" });
    } catch {
      toast({ title: "Failed to update invoice", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const total    = invoices.reduce((s, i) => s + Number(i.amount), 0);
  const pending  = invoices.filter((i) => i.status === "pending").length;
  const overdue  = invoices.filter((i) => i.status === "overdue").length;
  const paid     = invoices.filter((i) => i.status === "paid").length;

  if (loading) {
    return (
      <DashboardLayout title="Invoices" subtitle="Manage tenant invoices">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Invoices" subtitle="Manage tenant invoices">
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[
          { label: "Total Amount", value: `XAF ${total.toLocaleString()}`, icon: FileText,     bg: "bg-blue-100",   color: "text-blue-600" },
          { label: "Pending",      value: pending,                          icon: AlertCircle,  bg: "bg-yellow-100", color: "text-yellow-600" },
          { label: "Overdue",      value: overdue,                          icon: AlertCircle,  bg: "bg-red-100",    color: "text-red-600" },
          { label: "Paid",         value: paid,                             icon: FileText,     bg: "bg-green-100",  color: "text-green-600" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-display text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display">Invoice History</CardTitle></CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invoices yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Booking</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Due Date</th>
                    <th className="text-left py-3 px-4">Paid Date</th>
                    <th className="text-left py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-muted-foreground">#{inv.bookingId}</td>
                      <td className="py-3 px-4 font-semibold">XAF {Number(inv.amount).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge className={statusColor[inv.status] || ""} variant="outline">{inv.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {inv.paidDate ? new Date(inv.paidDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {inv.status === "pending" || inv.status === "overdue" ? (
                          <Button size="sm" variant="outline"
                            disabled={updating === inv.id}
                            onClick={() => handleMarkPaid(inv)}
                          >
                            {updating === inv.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark Paid"}
                          </Button>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default LandlordInvoices;
