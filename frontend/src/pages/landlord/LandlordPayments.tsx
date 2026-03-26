import { useState, useEffect } from "react";
import { paymentsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: number;
  bookingId: number;
  landlordId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

const methodLabel: Record<string, string> = {
  cash: "Cash",
  mobile_money: "Mobile Money",
  bank_transfer: "Bank Transfer",
  other: "Other",
};

const LandlordPayments = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await paymentsAPI.getByLandlord();
        setPayments(Array.isArray(data) ? data : data.payments || []);
      } catch {
        toast({ title: "Failed to load payments", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [toast]);

  const total = payments.reduce((s, p) => s + Number(p.amount), 0);

  if (loading) {
    return (
      <DashboardLayout title="Payment Records" subtitle="View all tenant payments">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payment Records" subtitle="View all tenant payments">
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Received</p>
              <p className="font-display text-2xl font-bold">XAF {total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="font-display text-2xl font-bold">{payments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Payment</p>
              <p className="font-display text-2xl font-bold">
                XAF {payments.length ? Math.round(total / payments.length).toLocaleString() : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display">Payment History</CardTitle></CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payments recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Booking</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Method</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Receipt</th>
                    <th className="text-left py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-muted-foreground">#{p.bookingId}</td>
                      <td className="py-3 px-4 font-semibold">XAF {Number(p.amount).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{methodLabel[p.paymentMethod] || p.paymentMethod}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{p.receiptNumber || "—"}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{p.notes || "—"}</td>
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

export default LandlordPayments;
