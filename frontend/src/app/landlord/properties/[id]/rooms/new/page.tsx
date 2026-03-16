/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Navbar from "../../../../../../components/Navbar";
import Footer from "../../../../../../components/Footer";
import { useAuth } from "../../../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../../../../lib/api";
import { FaPlusCircle } from "react-icons/fa";

interface AddNewRoomPageProps {
  params: { id: string }; // propertyId
}

export default function AddNewRoomPage({ params }: AddNewRoomPageProps) {
  const { id: propertyId } = params;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("single");
  const [capacity, setCapacity] = useState(1);
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [cautionDeposit, setCautionDeposit] = useState(0);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "landlord")) {
      router.push("/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  const handleAddImage = () => {
    if (newImage.trim() !== "" && !images.includes(newImage.trim())) {
      setImages([...images, newImage.trim()]);
      setNewImage("");
    }
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setImages(images.filter(image => image !== imageToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await api.post(`/properties/${propertyId}/rooms`, {
        roomNumber,
        roomType,
        capacity: parseInt(capacity.toString()),
        monthlyRent: parseFloat(monthlyRent.toString()),
        cautionDeposit: parseFloat(cautionDeposit.toString()),
        description,
        images: JSON.stringify(images), // Store as JSON string
        isAvailable: true, // New rooms are available by default
      });
      setSuccess("Room added successfully!");
      // Optionally clear form or redirect
      setRoomNumber("");
      setRoomType("single");
      setCapacity(1);
      setMonthlyRent(0);
      setCautionDeposit(0);
      setDescription("");
      setImages([]);
      setNewImage("");
      router.push(`/landlord/properties/${propertyId}/rooms`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add room.");
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
          <h1 className="text-3xl font-bold text-darkGreen text-center mb-8">Add New Room to Property {propertyId}</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="roomNumber" className="block text-lg font-medium text-darkGreen mb-2">Room Number/Identifier</label>
              <input
                type="text"
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., A1, Room 101"
              />
            </div>

            <div>
              <label htmlFor="roomType" className="block text-lg font-medium text-darkGreen mb-2">Room Type</label>
              <select
                id="roomType"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="single">Single Room</option>
                <option value="double">Double Room</option>
                <option value="studio">Studio</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>

            <div>
              <label htmlFor="capacity" className="block text-lg font-medium text-darkGreen mb-2">Capacity (Number of occupants)</label>
              <input
                type="number"
                id="capacity"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                min="1"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="monthlyRent" className="block text-lg font-medium text-darkGreen mb-2">Monthly Rent (XAF)</label>
              <input
                type="number"
                id="monthlyRent"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(parseFloat(e.target.value))}
                min="0"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="cautionDeposit" className="block text-lg font-medium text-darkGreen mb-2">Caution Deposit (XAF)</label>
              <input
                type="number"
                id="cautionDeposit"
                value={cautionDeposit}
                onChange={(e) => setCautionDeposit(parseFloat(e.target.value))}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-lg font-medium text-darkGreen mb-2">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe this room in detail..."
              ></textarea>
            </div>

            <div>
              <label className="block text-lg font-medium text-darkGreen mb-2">Images (URLs)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add image URL"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="bg-accent hover:bg-darkGreen text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <span key={index} className="bg-primary text-white px-3 py-1 rounded-full flex items-center">
                    {image.substring(0, 20)}...
                    <button type="button" onClick={() => handleRemoveImage(image)} className="ml-2 text-sm font-bold">
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
              <FaPlusCircle className="mr-2" /> {loading ? "Adding Room..." : "Add Room"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}