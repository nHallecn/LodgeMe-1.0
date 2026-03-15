// Path: lodgeme-project/frontend/src/app/tenant/bookings/page.tsx
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { FaCalendarAlt, FaHome, FaInfoCircle } from "react-icons/fa";

interface Booking {
  id: number;
  roomId: number;
  roomNumber: string; // Assuming this comes with the booking details
  propertyName: string; // Assuming this comes with the booking details
  startDate: string;
  endDate: string;
  status: "pending" | "active" | "completed" | "cancelled";
  monthlyRent: number; // Assuming this comes with the booking details
}

export default function TenantBookingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "user")) {
      router.push("/login");
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/bookings/guest`);
        // Enhance booking data with property/room details if needed
        const enhancedBookings = await Promise.all(response.data.map(async (booking: any) => {
          // In a real app, backend would ideally join this data
          const roomResponse = await api.get(`/properties/rooms/${booking.roomId}`);
          const room = roomResponse.data;
          const propertyResponse = await api.get(`/properties/${room.propertyId}`);
          const property = propertyResponse.data;
          return {
            ...booking,
            roomNumber: room.roomNumber,
            propertyName: property.name,
            monthlyRent: room.monthlyRent,
          };
        }));
        setBookings(enhancedBookings);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "user") {
      fetchBookings();
    }
  }, [isAuthenticated, user, authLoading, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
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
          Loading bookings...
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
        <h1 className="section-heading">My Bookings</h1>
        <p className="section-subheading">View and manage your current and past rental bookings.</p>

        {bookings.length === 0 ? (
          <div className="bg-lightGreen p-8 rounded-xl shadow-lg text-center text-xl text-gray-700">
            You have no bookings yet. <Link href="/properties" className="text-primary hover:underline">Start exploring properties!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-xl shadow-lg border border-lightGreen animate-slide-up">
                <h3 className="text-2xl font-bold text-darkGreen mb-2 flex items-center"><FaHome className="mr-2" /> {booking.propertyName}</h3>
                <p className="text-gray-700 mb-1">Room: {booking.roomNumber} ({booking.roomType})</p>
                <p className="text-gray-700 mb-1">Rent: <span className="font-semibold">XAF {booking.monthlyRent?.toLocaleString() || 'N/A'}/month</span></p>
                <p className="text-gray-600 mb-4 flex items-center"><FaCalendarAlt className="mr-2" /> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <Link href={`/tenant/bookings/${booking.id}`} className="flex items-center text-accent hover:text-darkGreen font-semibold">
                    <FaInfoCircle className="mr-2" /> Details
                  </Link>
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