/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Path: lodgeme-project/frontend/src/app/properties/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import Image from "next/image";
import Link from "next/link";
import { FaBed, FaBath, FaRulerCombined, FaMoneyBillWave, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaWhatsapp } from "react-icons/fa";

interface Property {
  id: number;
  name: string;
  city: string;
  neighborhood: string;
  description: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  landlordId: number;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
}

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

interface PropertyDetailPageProps {
  params: { id: string }; // propertyId
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id: propertyId } = params;
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [visitError, setVisitError] = useState<string | null>(null);
  const [visitSuccess, setVisitSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const propertyResponse = await api.get(`/properties/${propertyId}`);
        setProperty(propertyResponse.data);

        const roomsResponse = await api.get(`/properties/${propertyId}/rooms`);
        setRooms(roomsResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch property details.");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  const handleRequestVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVisitError(null);
    setVisitSuccess(null);

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      await api.post("/visits", {
        propertyId: parseInt(propertyId),
        guestId: user?.id, // Assuming user.id is available
        requestedDate: visitDate,
        requestedTime: visitTime,
        notes: visitNotes,
      });
      setVisitSuccess("Visit request submitted successfully!");
      setShowVisitModal(false);
      setVisitDate("");
      setVisitTime("");
      setVisitNotes("");
    } catch (err: any) {
      setVisitError(err.response?.data?.message || "Failed to submit visit request.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center text-xl text-gray-600">
          Loading property details...
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

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center text-xl text-gray-600">
          Property not found.
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-lightGreen p-8 rounded-xl shadow-lg animate-fade-in">
          <h1 className="text-4xl font-bold text-darkGreen mb-4">{property.name}</h1>
          <p className="text-gray-700 text-lg mb-6 flex items-center"><FaMapMarkerAlt className="mr-2 text-primary" /> {property.neighborhood}, {property.city}</p>

          {/* Property Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {rooms.length > 0 && rooms[0].images && rooms[0].images.length > 0 ? (
              rooms[0].images.map((img, index) => (
                <div key={index} className="relative w-full h-64 rounded-lg overflow-hidden shadow-md">
                  <Image src={img} alt={`Property image ${index + 1}`} layout="fill" objectFit="cover" />
                </div>
              ))
            ) : (
              <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md bg-gray-200 flex items-center justify-center text-gray-500">
                <p>No images available</p>
              </div>
            )}
          </div>

          {/* Property Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-darkGreen mb-3">Description</h2>
            <p className="text-gray-800 leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-darkGreen mb-3">Amenities</h2>
            {property.amenities && property.amenities.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-gray-800">
                {property.amenities.map((amenity, index) => (
                  <li key={index} className="flex items-center">
                    <FaBed className="mr-2 text-primary" /> {amenity}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No specific amenities listed.</p>
            )}
          </div>

          {/* Available Rooms */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-darkGreen mb-3">Available Rooms</h2>
            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.filter(room => room.isAvailable).map((room) => (
                  <div key={room.id} className="bg-white p-6 rounded-xl shadow-md border border-primary animate-slide-up">
                    <h3 className="text-xl font-bold text-darkGreen mb-2">Room {room.roomNumber} ({room.roomType})</h3>
                    <p className="text-gray-700 mb-1 flex items-center"><FaBed className="mr-2" /> Capacity: {room.capacity}</p>
                    <p className="text-gray-700 mb-1 flex items-center"><FaMoneyBillWave className="mr-2" /> Rent: XAF {room.monthlyRent.toLocaleString()}/month</p>
                    <p className="text-gray-700 mb-4 flex items-center"><FaMoneyBillWave className="mr-2" /> Deposit: XAF {room.cautionDeposit.toLocaleString()}</p>
                    <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                    {room.images && room.images.length > 0 && (
                      <Image src={room.images[0]} alt={`Room ${room.roomNumber}`} width={300} height={200} className="rounded-lg mb-4" />
                    )}
                    {room.isAvailable ? (
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            router.push("/login");
                          } else {
                            // Implement booking logic here
                            alert(`Booking Room ${room.roomNumber} - Property ${property.name}`);
                          }
                        }}
                        className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md"
                      >
                        Book This Room
                      </button>
                    ) : (
                      <span className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded-lg text-center block">Not Available</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No available rooms for this property at the moment.</p>
            )}
          </div>

          {/* Landlord Contact Info */}
          <div className="mb-8 p-6 bg-white rounded-xl shadow-md border border-lightGreen">
            <h2 className="text-2xl font-bold text-darkGreen mb-3">Contact Landlord</h2>
            <p className="text-gray-800 mb-2">Name: {property.landlordName}</p>
            <p className="text-gray-800 mb-2">Email: {property.landlordEmail}</p>
            <p className="text-gray-800 mb-4">Phone: {property.landlordPhone}</p>
            <a
              href={`https://wa.me/${property.landlordPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              <FaWhatsapp className="mr-2" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </main>

      <Footer />

      {/* Visit Request Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md animate-fade-in">
            <h2 className="text-2xl font-bold text-darkGreen mb-6">Request a Visit</h2>
            <form onSubmit={handleRequestVisit} className="space-y-4">
              <div>
                <label htmlFor="visitDate" className="block text-lg font-medium text-darkGreen mb-2">Preferred Date</label>
                <input
                  type="date"
                  id="visitDate"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="visitTime" className="block text-lg font-medium text-darkGreen mb-2">Preferred Time</label>
                <input
                  type="time"
                  id="visitTime"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="visitNotes" className="block text-lg font-medium text-darkGreen mb-2">Notes (Optional)</label>
                <textarea
                  id="visitNotes"
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any specific requests or questions?"
                ></textarea>
              </div>
              {visitError && <p className="text-red-500 text-sm text-center">{visitError}</p>}
              {visitSuccess && <p className="text-primary text-sm text-center">{visitSuccess}</p>}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}