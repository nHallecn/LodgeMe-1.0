import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

const TenantPayments = () => {
  return (
    <DashboardLayout title="Payments" subtitle="View your payment history">
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Payment history will appear here once connected to the backend.
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TenantPayments;
