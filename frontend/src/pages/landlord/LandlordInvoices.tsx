import { useState, useEffect } from "react";
import { invoicesAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Invoice } from "@/types";

const LandlordInvoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unpaid: 0, overdue: 0, paid: 0 });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await invoicesAPI.getByLandlord();
        const data = Array.isArray(response.data) ? response.data : response.data.invoices || [];
        setInvoices(data);

        // Calculate stats
        const total = data.reduce((sum: number, inv: Invoice) => sum + inv.amount, 0);
        const unpaid = data.filter((inv: Invoice) => inv.status === "unpaid").length;
        const overdue = data.filter((inv: Invoice) => inv.status === "overdue").length;
        const paid = data.filter((inv: Invoice) => inv.status === "paid").length;
        setStats({ total, unpaid, overdue, paid });
      } catch (err) {
        toast({
          title: "Failed to load invoices",
          description: "Could not fetch invoice records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [toast]);

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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Booking ID</th>
                    <th className="text-left py-3 px-4">Tenant</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Due Date</th>
                    <th className="text-left py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{typeof invoice.booking === "string" ? invoice.booking : invoice.booking?._id}</td>
                      <td className="py-3 px-4">{typeof invoice.tenant === "string" ? invoice.tenant : invoice.tenant?.name}</td>
                      <td className="py-3 px-4 font-semibold">XAF {invoice.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(invoice.status)} variant="outline">
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(invoice.createdAt).toLocaleDateString()}
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
