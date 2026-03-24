/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { invoicesAPI } from "@/lib/api";
import { Invoice } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LandlordInvoices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unpaid: 0, overdue: 0, paid: 0 });
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        if (!user?.id) return;
        const response = await invoicesAPI.getByLandlord(user.id);
        const data = Array.isArray(response.data) ? response.data : response.data.invoices || [];
        setInvoices(data);

        // Calculate stats
        const total = data.reduce((sum: number, inv: Invoice) => sum + (inv.amount || 0), 0);
        const unpaid = data.filter((inv: Invoice) => inv.status === "unpaid").length;
        const overdue = data.filter((inv: Invoice) => inv.status === "overdue").length;
        const paid = data.filter((inv: Invoice) => inv.status === "paid").length;
        setStats({ total, unpaid, overdue, paid });
      } catch (err: any) {
        toast({
          title: "Failed to load invoices",
          description: err.response?.data?.message || "Could not fetch invoice records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchInvoices();
  }, [user?.id, toast]);

  const handleStatusUpdate = async (invoiceId: number, newStatus: string) => {
    setUpdating(invoiceId);
    try {
      await invoicesAPI.updateStatus(invoiceId, newStatus);
      setInvoices(invoices.map((i) => (i.id === invoiceId ? { ...i, status: newStatus as any } : i)));
      toast({ title: `Invoice marked as ${newStatus}` });
    } catch (err: any) {
      toast({
        title: "Failed to update invoice",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Invoices" subtitle="Manage tenant invoices">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Invoices" subtitle="Manage tenant invoices">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-display text-2xl font-bold">XAF {stats.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unpaid</p>
              <p className="font-display text-2xl font-bold">{stats.unpaid}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="font-display text-2xl font-bold">{stats.overdue}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="font-display text-2xl font-bold">{stats.paid}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Invoice History</CardTitle>
          <Button asChild size="sm">
            <a href="/landlord/invoices/new" className="gap-2">
              <Plus className="h-4 w-4" /> Create Invoice
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invoices created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <p className="font-semibold">Invoice #{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">Booking: {invoice.bookingId}</p>
                    <p className="text-sm text-muted-foreground">Tenant: {invoice.tenantId}</p>
                    <p className="text-sm text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">XAF {invoice.amount.toLocaleString()}</p>
                    <Badge className={getStatusColor(invoice.status)} variant="outline" className="mt-2">
                      {invoice.status}
                    </Badge>
                    <div className="mt-3 flex gap-2">
                      {invoice.status === "unpaid" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(invoice.id, "paid")}
                            disabled={updating === invoice.id}
                          >
                            {updating === invoice.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark Paid"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(invoice.id, "overdue")}
                            disabled={updating === invoice.id}
                          >
                            Overdue
                          </Button>
                        </>
                      )}
                      {invoice.status === "overdue" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(invoice.id, "paid")}
                          disabled={updating === invoice.id}
                        >
                          {updating === invoice.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark Paid"}
                        </Button>
                      )}
                    </div>
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

export default LandlordInvoices;