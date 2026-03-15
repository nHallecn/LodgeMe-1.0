// Path: lodgeme-project/frontend/src/app/landlord/properties/[id]/rooms/[roomId]/edit/page.tsx
import { useState, useEffect } from "react";
import Navbar from "../../../../../../../components/Navbar";
import Footer from "../../../../../../../components/Footer";
import { useAuth } from "../../../../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../../../../../lib/api";
import { FaSave } from "react-icons/fa";

interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  capacity: number;
  monthlyRent: number;
  cautionDeposit: number;
  description: string;
  images: string[];
  isAvailable: boolean;
}

interface EditRoomPageProps {
  params: { id: string; roomId: string }; // propertyId, roomId
}

export default function EditRoomPage({ params }: EditRoomPageProps) {
  const { id: propertyId, roomId } = params;
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
  const [isAvailable, setIsAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "landlord")) {
      router.push("/login");
      return;
    }

    const fetchRoom = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/properties/rooms/${roomId}`);
        const roomData: Room = response.data;
        setRoomNumber(roomData.roomNumber);
        setRoomType(roomData.roomType);
        setCapacity(roomData.capacity);
        setMonthlyRent(roomData.monthlyRent);
        setCautionDeposit(roomData.cautionDeposit);
        setDescription(roomData.description);
        setImages(roomData.images || []);
        setIsAvailable(roomData.isAvailable);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch room details.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "landlord" && roomId) {
      fetchRoom();
    }
  }, [isAuthenticated, user, authLoading, router, roomId]);

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
    setSubmitting(true);

    try {
      await api.put(`/properties/rooms/${roomId}`, {
        roomNumber,
        roomType,
        capacity: parseInt(capacity.toString()),
        monthlyRent: parseFloat(monthlyRent.toString()),
        cautionDeposit: parseFloat(cautionDeposit.toString()),
        description,
        images: JSON.stringify(images),
        isAvailable,
      });
      setSuccess("Room updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update room.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center text-xl text-gray-600">
          Loading room...
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
        <div className="bg-lightGreen p-8 rounded-xl shadow-lg w-full max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold text-darkGreen text-center mb-8">Edit Room {roomNumber}</h1>
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="h-5 w-5 text-primary rounded focus:ring-primary border-gray-300"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-lg font-medium text-darkGreen">Is Available</label>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-primary text-sm text-center">{success}</p>}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md flex items-center justify-center"
              disabled={submitting}
            >
              <FaSave className="mr-2" /> {submitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}