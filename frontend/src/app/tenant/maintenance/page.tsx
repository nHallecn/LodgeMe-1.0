/* eslint-disable @typescript-eslint/no-explicit-any */
// Path: lodgeme-project/frontend/src/app/tenant/maintenance/page.tsx
"use client";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { FaTools, FaPlusCircle, FaInfoCircle } from "react-icons/fa";

interface MaintenanceTicket {
  id: number;
  propertyId: number;
  propertyName: string; // Assuming this comes with the ticket details
  roomId: number;
  roomNumber: string; // Assuming this comes with the ticket details
  issue: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  reportedDate: string;
  resolvedDate: string | null;
}

export default function TenantMaintenancePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "tenant")) {
      router.push("/login");
      return;
    }

    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/maintenance-tickets/user`);
        // Enhance ticket data with property/room details if needed
        const enhancedTickets = await Promise.all(response.data.map(async (ticket: any) => {
          const roomResponse = await api.get(`/properties/rooms/${ticket.roomId}`);
          const room = roomResponse.data;
          const propertyResponse = await api.get(`/properties/${room.propertyId}`);
          const property = propertyResponse.data;
          return {
            ...ticket,
            propertyName: property.name,
            roomNumber: room.roomNumber,
          };
        }));
        setTickets(enhancedTickets);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch maintenance tickets.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "tenant") {
      fetchTickets();
    }
  }, [isAuthenticated, user, authLoading, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center text-xl text-gray-600">
          Loading maintenance tickets...
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
        <h1 className="section-heading">My Maintenance Tickets</h1>
        <p className="section-subheading">Report and track issues related to your rental.</p>

        <div className="mb-8 text-right">
          <Link href="/tenant/maintenance/new" className="inline-flex items-center bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md">
            <FaPlusCircle className="mr-2" /> Report New Issue
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-lightGreen p-8 rounded-xl shadow-lg text-center text-xl text-gray-700">
            You have no maintenance tickets yet. <Link href="/tenant/maintenance/new" className="text-primary hover:underline">Report an issue now!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white p-6 rounded-xl shadow-lg border border-lightGreen animate-slide-up">
                <h3 className="text-2xl font-bold text-darkGreen mb-2 flex items-center"><FaTools className="mr-2" /> {ticket.issue}</h3>
                <p className="text-gray-700 mb-1">Property: {ticket.propertyName} - Room {ticket.roomNumber}</p>
                <p className="text-gray-600 mb-4">Reported: {new Date(ticket.reportedDate).toLocaleDateString()}</p>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace("_", " ")}
                  </span>
                  <Link href={`/tenant/maintenance/${ticket.id}`} className="flex items-center text-accent hover:text-darkGreen font-semibold">
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