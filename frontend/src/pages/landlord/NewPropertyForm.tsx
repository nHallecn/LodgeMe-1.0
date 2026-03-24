/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { paymentsAPI } from "@/lib/api";
import { Payment } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Loader2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LandlordPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, count: 0 });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        if (!user?.id) return;
        const response = await paymentsAPI.getByLandlord(user.id);
        const data = Array.isArray(response.data) ? response.data : response.data.payments || [];
        setPayments(data);

        // Calculate stats
        const total = data.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0);
        setStats({ total, count: data.length });
      } catch (err: any) {
        toast({
          title: "Failed to load payments",
          description: err.response?.data?.message || "Could not fetch payment records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchPayments();
  }, [user?.id, toast]);

  if (loading) {
    return (
      <DashboardLayout title="Payment Records" subtitle="View all tenant payments">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payment Records" subtitle="View all tenant payments">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Received</p>
              <p className="font-display text-2xl font-bold">XAF {stats.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Payments</p>
              <p className="font-display text-2xl font-bold">{stats.count}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Payment History</CardTitle>
          <Button asChild size="sm">
            <a href="/landlord/payments/record" className="gap-2">
              <Plus className="h-4 w-4" /> Record Payment
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <p className="font-semibold">Payment #{payment.id}</p>
                    <p className="text-sm text-muted-foreground">Booking: {payment.bookingId}</p>
                    <p className="text-sm text-muted-foreground">Method: {payment.paymentMethod}</p>
                    {payment.receiptNumber && (
                      <p className="text-sm text-muted-foreground">Receipt: {payment.receiptNumber}</p>
                    )}
                    {payment.notes && (
                      <p className="text-sm text-muted-foreground">Notes: {payment.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">XAF {payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default LandlordPayments;