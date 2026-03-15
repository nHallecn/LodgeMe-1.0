// Path: lodgeme-project/frontend/src/app/tenant/payments/page.tsx
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { FaMoneyBillWave, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";

interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  paymentDate: string;
  status: "pending" | "completed" | "failed";
  invoiceId: number;
  propertyName: string; // Assuming this comes with the payment details
  roomNumber: string; // Assuming this comes with the payment details
}

export default function TenantPaymentsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "user")) {
      router.push("/login");
      return;
    }

    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/payments/guest`);
        // In a real app, backend would ideally join this data
        const enhancedPayments = await Promise.all(response.data.map(async (payment: any) => {
          const bookingResponse = await api.get(`/bookings/${payment.bookingId}`);
          const booking = bookingResponse.data;
          const roomResponse = await api.get(`/properties/rooms/${booking.roomId}`);
          const room = roomResponse.data;
          const propertyResponse = await api.get(`/properties/${room.propertyId}`);
          const property = propertyResponse.data;
          return {
            ...payment,
            propertyName: property.name,
            roomNumber: room.roomNumber,
          };
        }));
        setPayments(enhancedPayments);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch payments.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "user") {
      fetchPayments();
    }
  }, [isAuthenticated, user, authLoading, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center text-xl text-gray-600">
          Loading payments...
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center text-xl text-red-500">
          Error: {error}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="section-heading">My Payments</h1>
        <p className="section-subheading">View your payment history and status.</p>

        {payments.length === 0 ? (
          <div className="bg-lightGreen p-8 rounded-xl shadow-lg text-center text-xl text-gray-700">
            You have no payment records yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white p-6 rounded-xl shadow-lg border border-lightGreen animate-slide-up">
                <h3 className="text-2xl font-bold text-darkGreen mb-2 flex items-center"><FaMoneyBillWave className="mr-2" /> XAF {payment.amount.toLocaleString()}</h3>
                <p className="text-gray-700 mb-1">For: {payment.propertyName} - Room {payment.roomNumber}</p>
                <p className="text-gray-600 mb-4 flex items-center"><FaCalendarAlt className="mr-2" /> {new Date(payment.paymentDate).toLocaleDateString()}</p>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                  {/* Link to invoice details if available */}
                  {payment.invoiceId && (
                    <Link href={`/tenant/invoices/${payment.invoiceId}`} className="flex items-center text-accent hover:text-darkGreen font-semibold">
                      <FaInfoCircle className="mr-2" /> View Invoice
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}