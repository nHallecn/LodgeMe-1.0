/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Path: lodgeme-project/frontend/src/app/properties/page.tsx
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PropertyCard from "../../components/PropertyCard";
import api from "../../lib/api";
import { FaSearch, FaMapMarkerAlt, FaDollarSign, FaBed } from "react-icons/fa";

interface Property {
  id: number;
  name: string;
  city: string;
  neighborhood: string;
  description: string;
  images: string[];
  monthlyRent: number;
}

export default function PropertySearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [roomType, setRoomType] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/properties", {
        params: {
          search: searchQuery,
          city,
          neighborhood,
          minRent,
          maxRent,
          roomType,
        },
      });
      setProperties(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch properties.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="section-heading">Find Your Perfect Home</h1>
        <p className="section-subheading">Explore a wide range of properties tailored to your needs.</p>

        {/* Search and Filter Section */}
        <div className="bg-lightGreen p-6 rounded-xl shadow-lg mb-8 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-full lg:col-span-2">
              <label htmlFor="searchQuery" className="sr-only">Search by keyword</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Search by property name, description..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="city" className="sr-only">City</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="City"
                />
              </div>
            </div>

            <div>
              <label htmlFor="neighborhood" className="sr-only">Neighborhood</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Neighborhood"
                />
              </div>
            </div>

            <div>
              <label htmlFor="minRent" className="sr-only">Min Rent</label>
              <div className="relative">
                <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  id="minRent"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Min Rent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="maxRent" className="sr-only">Max Rent</label>
              <div className="relative">
                <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  id="maxRent"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Max Rent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="roomType" className="sr-only">Room Type</label>
              <div className="relative">
                <FaBed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  id="roomType"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Any Room Type</option>
                  <option value="single">Single Room</option>
                  <option value="double">Double Room</option>
                  <option value="studio">Studio</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="col-span-full lg:col-span-1 bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md flex items-center justify-center"
            >
              <FaSearch className="mr-2" /> Search Properties
            </button>
          </form>
        </div>

        {loading && <p className="text-center text-xl text-gray-600">Loading properties...</p>}
        {error && <p className="text-center text-xl text-red-500">Error: {error}</p>}

        {!loading && !error && properties.length === 0 && (
          <p className="text-center text-xl text-gray-600">No properties found matching your criteria.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {properties.map((property) => (
    <PropertyCard
      key={property.id}
      id={property.id}
      imageUrl={property.images[0]}
      title={property.name}
      location={`${property.neighborhood}, ${property.city}`}
      price={property.monthlyRent}
    />
  ))}
      </div>
      </main>

      <Footer />
    </div>
  );
}