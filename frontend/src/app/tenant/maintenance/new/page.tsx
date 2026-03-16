/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import { FaPlusCircle } from "react-icons/fa";

interface Property {
  id: number;
  name: string;
}

interface Room {
  id: number;
  roomNumber: string;
  propertyId: number;
}

export default function ReportMaintenancePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "tenant")) {
      router.push("/login");
      return;
    }

    const fetchUserPropertiesAndRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real app, you'd fetch properties/rooms associated with the tenant's bookings
        // For now, let's fetch all properties and filter rooms by selected property
        const propertiesResponse = await api.get("/properties"); // Or /properties/user-bookings
        setProperties(propertiesResponse.data);

        // If a property is pre-selected or available, fetch its rooms
        if (propertiesResponse.data.length > 0) {
          setSelectedProperty(propertiesResponse.data[0].id.toString());
          const roomsResponse = await api.get(`/properties/${propertiesResponse.data[0].id}/rooms`);
          setRooms(roomsResponse.data);
          if (roomsResponse.data.length > 0) {
            setSelectedRoom(roomsResponse.data[0].id.toString());
          }
        }

      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch properties or rooms.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "tenant") {
      fetchUserPropertiesAndRooms();
    }
  }, [isAuthenticated, user, authLoading, router]);

  const handlePropertyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propId = e.target.value;
    setSelectedProperty(propId);
    setRooms([]); // Clear rooms when property changes
    setSelectedRoom("");
    if (propId) {
      try {
        const roomsResponse = await api.get(`/properties/${propId}/rooms`);
        setRooms(roomsResponse.data);
        if (roomsResponse.data.length > 0) {
          setSelectedRoom(roomsResponse.data[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to fetch rooms for property", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!selectedProperty || !selectedRoom) {
      setError("Please select a property and a room.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/maintenance-tickets", {
        propertyId: parseInt(selectedProperty),
        roomId: parseInt(selectedRoom),
        issue,
        description,
        reportedBy: user?.id, // Tenant ID
      });
      setSuccess("Maintenance ticket reported successfully!");
      // Clear form
      setSelectedProperty("");
      setSelectedRoom("");
      setIssue("");
      setDescription("");
      setRooms([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to report issue.");
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
          <h1 className="text-3xl font-bold text-darkGreen text-center mb-8">Report New Maintenance Issue</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="property" className="block text-lg font-medium text-darkGreen mb-2">Select Property</label>
              <select
                id="property"
                value={selectedProperty}
                onChange={handlePropertyChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">-- Select a Property --</option>
                {properties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="room" className="block text-lg font-medium text-darkGreen mb-2">Select Room</label>
              <select
                id="room"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                disabled={!selectedProperty || rooms.length === 0}
              >
                <option value="">-- Select a Room --</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="issue" className="block text-lg font-medium text-darkGreen mb-2">Issue Summary</label>
              <input
                type="text"
                id="issue"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Leaky faucet, Broken AC"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-lg font-medium text-darkGreen mb-2">Detailed Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Provide more details about the issue..."
              ></textarea>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-primary text-sm text-center">{success}</p>}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md flex items-center justify-center"
              disabled={loading}
            >
              <FaPlusCircle className="mr-2" /> {loading ? "Reporting..." : "Report Issue"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}