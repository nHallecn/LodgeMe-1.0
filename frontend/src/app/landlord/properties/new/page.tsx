import { useState, useEffect } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import { FaPlusCircle } from "react-icons/fa";

export default function AddNewPropertyPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [totalRooms, setTotalRooms] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "landlord")) {
      router.push("/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  const handleAddAmenity = () => {
    if (newAmenity.trim() !== "" && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (amenityToRemove: string) => {
    setAmenities(amenities.filter(amenity => amenity !== amenityToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await api.post("/properties", {
        landlordId: user?.id, // Backend will use req.user.id, but good to pass for clarity
        name,
        city,
        neighborhood,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description,
        totalRooms: parseInt(totalRooms.toString()),
        amenities: JSON.stringify(amenities), // Store as JSON string
      });
      setSuccess("Property added successfully! You can now add rooms to it.");
      // Optionally clear form or redirect
      setName("");
      setCity("");
      setNeighborhood("");
      setLatitude("");
      setLongitude("");
      setDescription("");
      setTotalRooms(0);
      setAmenities([]);
      setNewAmenity("");
      router.push(`/landlord/properties/${response.data.propertyId}/add-room`); // Redirect to add rooms
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add property.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center text-xl text-gray-600">
          Loading authentication...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-lightGreen p-8 rounded-xl shadow-lg w-full max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold text-darkGreen text-center mb-8">Add New Property</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-darkGreen mb-2">Property Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Green Oasis Minicité"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-lg font-medium text-darkGreen mb-2">City</label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Douala"
                />
              </div>
              <div>
                <label htmlFor="neighborhood" className="block text-lg font-medium text-darkGreen mb-2">Neighborhood</label>
                <input
                  type="text"
                  id="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Bonaberi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="latitude" className="block text-lg font-medium text-darkGreen mb-2">Latitude</label>
                <input
                  type="text"
                  id="latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 4.05"
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-lg font-medium text-darkGreen mb-2">Longitude</label>
                <input
                  type="text"
                  id="longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 9.7"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-lg font-medium text-darkGreen mb-2">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your property in detail..."
              ></textarea>
            </div>

            <div>
              <label htmlFor="totalRooms" className="block text-lg font-medium text-darkGreen mb-2">Total Number of Rooms</label>
              <input
                type="number"
                id="totalRooms"
                value={totalRooms}
                onChange={(e) => setTotalRooms(parseInt(e.target.value))}
                min="0"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-darkGreen mb-2">Amenities</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add an amenity (e.g., Wi-Fi, Parking)"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="bg-accent hover:bg-darkGreen text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity, index) => (
                  <span key={index} className="bg-primary text-white px-3 py-1 rounded-full flex items-center">
                    {amenity}
                    <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="ml-2 text-sm font-bold">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-primary text-sm text-center">{success}</p>}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md flex items-center justify-center"
              disabled={loading}
            >
              <FaPlusCircle className="mr-2" /> {loading ? "Adding Property..." : "Add Property"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}


