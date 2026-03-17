/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { FaPlus, FaBuilding, FaMoneyBillWave, FaTools, FaBed } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  occupiedRooms: number;
  vacantRooms: number;
  pendingPayments: number;
  openTickets: number;
}

export default function LandlordDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "landlord")) {
      router.push("/login");
      return;
    }

    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real application, you'd have dedicated API endpoints for these stats
        // For now, we'll simulate or derive from existing endpoints
        const propertiesResponse = await api.get(`/properties/landlord/${user?.id}`);
        const properties = propertiesResponse.data;

        const totalProperties = properties.length;
        const activeListings = properties.filter((p: any) => p.isActive).length;
        let occupiedRooms = 0;
        let vacantRooms = 0;

        for (const prop of properties) {
          const roomsResponse = await api.get(`/properties/${prop.id}/rooms`);
          const rooms = roomsResponse.data;
          occupiedRooms += rooms.filter((r: any) => !r.isAvailable).length;
          vacantRooms += rooms.filter((r: any) => r.isAvailable).length;
        }

        // Dummy data for payments and tickets for now
        const pendingPayments = 2; // Replace with API call to /payments/landlord and filter status
        const openTickets = 1; // Replace with API call to /maintenance-tickets/landlord and filter status

        setStats({
          totalProperties,
          activeListings,
          occupiedRooms,
          vacantRooms,
          pendingPayments,
          openTickets,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch dashboard stats.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "landlord") {
      fetchDashboardStats();
    }
  }, [isAuthenticated, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center text-xl text-gray-600">
          Loading dashboard...
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
        <h1 className="section-heading">Landlord Dashboard</h1>
        <p className="section-subheading">Manage your properties and tenants efficiently.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-lightGreen p-6 rounded-xl shadow-md text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <FaBuilding className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-darkGreen">{stats?.totalProperties || 0}</h3>
            <p className="text-gray-700">Total Properties</p>
          </div>
          <div className="bg-lightGreen p-6 rounded-xl shadow-md text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <FaBuilding className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-darkGreen">{stats?.activeListings || 0}</h3>
            <p className="text-gray-700">Active Listings</p>
          </div>
          <div className="bg-lightGreen p-6 rounded-xl shadow-md text-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <FaBed className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-darkGreen">{stats?.occupiedRooms || 0}</h3>
            <p className="text-gray-700">Occupied Rooms</p>
          </div>
          <div className="bg-lightGreen p-6 rounded-xl shadow-md text-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <FaBed className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-darkGreen">{stats?.vacantRooms || 0}</h3>
            <p className="text-gray-700">Vacant Rooms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <h2 className="text-2xl font-bold text-darkGreen mb-6">Quick Actions</h2>
            <ul className="space-y-4">
              <li>
                <Link href="/landlord/properties/new" className="flex items-center bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md">
                  <FaPlus className="mr-3" /> Add New Property
                </Link>
              </li>
              <li>
                <Link href="/landlord/properties" className="flex items-center bg-accent hover:bg-darkGreen text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md">
                  <FaBuilding className="mr-3" /> Manage Properties
                </Link>
              </li>
              <li>
                <Link href="/landlord/payments" className="flex items-center bg-accent hover:bg-darkGreen text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md">
                  <FaMoneyBillWave className="mr-3" /> View Payments
                </Link>
              </li>
              <li>
                <Link href="/landlord/maintenance" className="flex items-center bg-accent hover:bg-darkGreen text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md">
                  <FaTools className="mr-3" /> Manage Maintenance
                </Link>
              </li>
            </ul>
          </div>

          {/* Recent Activity (Placeholder) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <h2 className="text-2xl font-bold text-darkGreen mb-6">Recent Activity</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="border-b pb-2">New booking for Apartment 101 in Douala.</li>
              <li className="border-b pb-2">Payment received from Tenant X for July rent.</li>
              <li className="border-b pb-2">Maintenance ticket #005 reported for a leaky faucet.</li>
              <li>Property &quot;Green Oasis Minicité&quot; updated.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}