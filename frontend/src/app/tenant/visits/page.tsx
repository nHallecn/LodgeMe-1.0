/* eslint-disable @typescript-eslint/no-explicit-any */
// Path: lodgeme-project/frontend/src/app/tenant/visits/page.tsx
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { FaCalendarCheck, FaHome, FaInfoCircle } from "react-icons/fa";
import Link from "next/dist/client/link";

interface VisitRequest {
  id: number;
  propertyId: number;
  propertyName: string; // Assuming this comes with the visit details
  requestedDate: string;
  requestedTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string;
}

export default function TenantVisitsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "tenant")) {
      router.push("/login");
      return;
    }

    const fetchVisitRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/visits/my-visits`);
        // Enhance visit request data with property details if needed
        const enhancedVisits = await Promise.all(response.data.map(async (visit: any) => {
          const propertyResponse = await api.get(`/properties/${visit.propertyId}`);
          const property = propertyResponse.data;
          return {
            ...visit,
            propertyName: property.name,
          };
        }));
        setVisitRequests(enhancedVisits);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch visit requests.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "tenant") {
      fetchVisitRequests();
    }
  }, [isAuthenticated, user, authLoading, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center text-xl text-gray-600">
          Loading visit requests...
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
        <h1 className="section-heading">My Visit Requests</h1>
        <p className="section-subheading">View the status of your property visit requests.</p>

        {visitRequests.length === 0 ? (
          <div className="bg-lightGreen p-8 rounded-xl shadow-lg text-center text-xl text-gray-700">
            You have no visit requests yet. <Link href="/properties" className="text-primary hover:underline">Explore properties to request a visit!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visitRequests.map((visit) => (
              <div key={visit.id} className="bg-white p-6 rounded-xl shadow-lg border border-lightGreen animate-slide-up">
                <h3 className="text-2xl font-bold text-darkGreen mb-2 flex items-center"><FaHome className="mr-2" /> {visit.propertyName}</h3>
                <p className="text-gray-700 mb-1">Date: {new Date(visit.requestedDate).toLocaleDateString()}</p>
                <p className="text-gray-700 mb-4">Time: {visit.requestedTime}</p>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(visit.status)}`}>
                    {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                  </span>
                  <Link href={`/tenant/visits/${visit.id}`} className="flex items-center text-accent hover:text-darkGreen font-semibold">
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