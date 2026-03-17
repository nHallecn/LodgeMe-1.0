/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { FaHome, FaMoneyBillWave, FaTools, FaCalendarCheck } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

interface DashboardStats {
  currentBookings: number;
  pendingPayments: number;
  openTickets: number;
  visitRequests: number;
}

export default function TenantDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "tenant")) {
      router.push("/login");
      return;
    }

    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch bookings for the current user
        const bookingsResponse = await api.get(`/bookings/guest`);
        const bookings = bookingsResponse.data;
        const currentBookings = bookings.filter((b: any) => b.status === "active").length;

        // Fetch payments for the current user (assuming payments are linked to bookings)
        // This might require a dedicated endpoint or more complex logic
        const paymentsResponse = await api.get(`/payments/guest`); // Assuming this endpoint exists
        const payments = paymentsResponse.data;
        const pendingPayments = payments.filter((p: any) => p.status === "pending").length; // Assuming a status field

        // Fetch maintenance tickets for the current user
        const ticketsResponse = await api.get(`/maintenance-tickets/user`);
        const tickets = ticketsResponse.data;
        const openTickets = tickets.filter((t: any) => t.status === "open" || t.status === "in_progress").length;

        // Fetch visit requests for the current user
        const visitsResponse = await api.get(`/visits/my-visits`);
        const visits = visitsResponse.data;
        const pendingVisitRequests = visits.filter((v: any) => v.status === "pending").length;

        setStats({
          currentBookings,
          pendingPayments,
          openTickets,
          visitRequests: pendingVisitRequests,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch dashboard stats.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "tenant") {
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
        <h1 className="section-heading">Tenant Dashboard</h1>
        <p className="section-subheading">Manage your rentals and requests with ease.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-lightGreen p-6 rounded-xl shadow-md text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <FaHome className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-darkGreen">{stats?.currentBookings || 0}</h3>
            <p className="text-gray-700">Current Bookings</p>
          </div>
          <div className="bg-lightGreen p-6 rounded-xl shadow-md text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <FaMoneyBillWave className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-darkGreen">{stats?.pendingPayments || 0}</h3>
            <p className="text-gray-700">Pending Payments</p>
          </div>
          <div className="bg-lightGreen p-6 rounded-xl shadow-md text-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <FaTools className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-darkGreen">{stats?.openTickets || 0}</h3>
            <p className="text-gray-700">Open Maintenance Tickets</p>
          </div>
          <div className="bg-lightGreen p-6 rounded-xl shadow-md text-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <FaCalendarCheck className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-darkGreen">{stats?.visitRequests || 0}</h3>
            <p className="text-gray-700">Pending Visit Requests</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <h2 className="text-2xl font-bold text-darkGreen mb-6">Quick Actions</h2>
            <ul className="space-y-4">
              <li>
                <Link href="/tenant/bookings" className="flex items-center bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md">
                  <FaHome className="mr-3" /> View My Bookings
                </Link>
              </li>
              <li>
                <Link href="/tenant/payments" className="flex items-center bg-accent hover:bg-darkGreen text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md">
                  <FaMoneyBillWave className="mr-3" /> View My Payments
                </Link>
              </li>
              <li>
                <Link href="/tenant/maintenance" className="flex items-center bg-accent hover:bg-darkGreen text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md">
                  <FaTools className="mr-3" /> Report Maintenance Issue
                </Link>
              </li>
              <li>
                <Link href="/tenant/visits" className="flex items-center bg-accent hover:bg-darkGreen text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md">
                  <FaCalendarCheck className="mr-3" /> My Visit Requests
                </Link>
              </li>
            </ul>
          </div>

          {/* Recent Activity (Placeholder) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <h2 className="text-2xl font-bold text-darkGreen mb-6">Recent Activity</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="border-b pb-2">Your booking for Apartment 101 is active.</li>
              <li className="border-b pb-2">Payment for August rent is due on 25th.</li>
              <li className="border-b pb-2">Maintenance ticket #005 status updated to &apos;In Progress&apos;.</li>
              <li>New property recommendations available.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}