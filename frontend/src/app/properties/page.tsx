/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Path: lodgeme-project/frontend/src/app/properties/page.tsx
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PropertyCard from "../../components/PropertyCard";
import { FaFilter, FaSearch, FaMapMarkerAlt, FaDollarSign, FaBed } from "react-icons/fa";
import api from "../../lib/api";

interface Property {
  id: number;
  name: string;
  city: string;
  neighborhood: string;
  description: string;
  images: string[];
  monthlyRent: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState({
    city: "",
    neighborhood: "",
    minPrice: "",
    maxPrice: "",
    roomType: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (filters.city) queryParams.append("city", filters.city);
        if (filters.neighborhood) queryParams.append("neighborhood", filters.neighborhood);
        if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
        if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
        if (filters.roomType) queryParams.append("roomType", filters.roomType);

        const response = await api.get(`/properties?${queryParams.toString()}`);
        setProperties(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch properties.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="section-heading">Explore All Properties</h1>
        <p className="section-subheading">Find your ideal rental from our extensive listings.</p>

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Filter Sidebar */}
          <aside className="lg:w-1/4 p-6 bg-lightGreen rounded-xl shadow-lg h-fit lg:sticky lg:top-28 animate-slide-up">
            <h2 className="text-2xl font-bold text-darkGreen mb-6 flex items-center"><FaFilter className="mr-3" />Filters</h2>

            <div className="mb-6">
              <label htmlFor="city" className="block text-darkGreen text-lg font-semibold mb-2">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="e.g., Douala"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="neighborhood" className="block text-darkGreen text-lg font-semibold mb-2">Neighborhood</label>
              <input
                type="text"
                id="neighborhood"
                name="neighborhood"
                value={filters.neighborhood}
                onChange={handleFilterChange}
                placeholder="e.g., Bonaberi"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mb-6">
              <label className="block text-darkGreen text-lg font-semibold mb-2">Price Range (XAF)</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-1/2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-1/2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="roomType" className="block text-darkGreen text-lg font-semibold mb-2">Room Type</label>
              <select
                id="roomType"
                name="roomType"
                value={filters.roomType}
                onChange={handleFilterChange}
                className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="single">Single Room</option>
                <option value="double">Double Room</option>
                <option value="studio">Studio</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>

            <button
              onClick={() => setFilters({ city: "", neighborhood: "", minPrice: "", maxPrice: "", roomType: "" })}
              className="w-full bg-accent hover:bg-darkGreen text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
            >
              Clear Filters
            </button>
          </aside>

          {/* Property Listings */}
          <section className="lg:w-3/4">
            {loading ? (
              <div className="text-center text-xl text-gray-600">Loading properties...</div>
            ) : error ? (
              <div className="text-center text-xl text-red-500">Error: {error}</div>
            ) : properties.length === 0 ? (
              <div className="text-center text-xl text-gray-600">No properties found matching your criteria.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {properties.map((property, index) => (
                  <div key={property.id} className="animate-slide-up" style={{ animationDelay: `${0.1 * index}s` }}>
                    <PropertyCard
  key={property.id}
  id={property.id}
  imageUrl={property.images?.[0] || "/placeholder.jpg"}
  title={property.name}
  location={`${property.neighborhood}, ${property.city}`}
  price={property.monthlyRent}
/>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}