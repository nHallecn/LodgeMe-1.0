import { useState, useEffect } from "react";
import { paymentsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2 } from "lucide-react";

const TenantPayments = () => {
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    paymentsAPI.getByGuest()
      .then((r) => { const d = r.data; setPayments(Array.isArray(d) ? d : []); })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const total = payments.reduce((s, p) => s + parseFloat(String(p.amount || 0)), 0);

  return (
    <DashboardLayout title="My Payments" subtitle="History of rent payments recorded by your landlord">
      <div className="mb-6">
        <Card className="inline-block">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2"><CreditCard className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-xl font-bold">XAF {total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Paid</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : payments.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No payments recorded yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Once your landlord records a payment for your booking, it will appear here.
          </p>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Booking", "Amount (XAF)", "Date", "Method", "Receipt #", "Notes"].map(h => (
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
    </DashboardLayout>
  );
};

export default TenantPayments;
