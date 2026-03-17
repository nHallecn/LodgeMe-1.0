/* eslint-disable @typescript-eslint/no-explicit-any */
// Path: lodgeme-project/frontend/src/app/landlord/properties/page.tsx
"use client";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { FaEdit, FaTrash, FaPlus, FaBed } from "react-icons/fa";

interface Property {
  id: number;
  name: string;
  city: string;
  neighborhood: string;
  totalRooms: number;
  occupiedRooms: number;
}

export default function ManagePropertiesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "landlord")) {
      router.push("/login");
      return;
    }

    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/properties/landlord/${user?.id}`);
        setProperties(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch properties.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "landlord") {
      fetchProperties();
    }
  }, [isAuthenticated, user, authLoading, router]);

  const handleDeleteProperty = async (propertyId: number) => {
    if (!window.confirm("Are you sure you want to delete this property and all its rooms?")) {
      return;
    }
    try {
      await api.delete(`/properties/${propertyId}`);
      setProperties(properties.filter(prop => prop.id !== propertyId));
      alert("Property deleted successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete property.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center text-xl text-gray-600">
          Loading properties...
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
        <h1 className="section-heading">Manage Your Properties</h1>
        <p className="section-subheading">View, edit, and delete your listed properties.</p>

        <div className="mb-8 text-right">
          <Link href="/landlord/properties/new" className="inline-flex items-center bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md">
            <FaPlus className="mr-2" /> Add New Property
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-lightGreen p-8 rounded-xl shadow-lg text-center text-xl text-gray-700">
            You haven&apos;t listed any properties yet. <Link href="/landlord/properties/new" className="text-primary hover:underline">Add your first property!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="bg-white p-6 rounded-xl shadow-lg border border-lightGreen animate-slide-up">
                <h3 className="text-2xl font-bold text-darkGreen mb-2">{property.name}</h3>
                <p className="text-gray-700 mb-1">{property.neighborhood}, {property.city}</p>
                <p className="text-gray-600 mb-4">Rooms: {property.occupiedRooms}/{property.totalRooms} occupied</p>
                <div className="flex justify-between items-center mt-4">
                  <Link href={`/landlord/properties/${property.id}/edit`} className="flex items-center text-accent hover:text-darkGreen font-semibold">
                    <FaEdit className="mr-2" /> Edit Property
                  </Link>
                  <Link href={`/landlord/properties/${property.id}/rooms`} className="flex items-center text-primary hover:text-secondary font-semibold">
                    <FaBed className="mr-2" /> Manage Rooms
                  </Link>
                  <button
                    onClick={() => handleDeleteProperty(property.id)}
                    className="flex items-center text-red-500 hover:text-red-700 font-semibold"
                  >
                    <FaTrash className="mr-2" /> Delete
                  </button>
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