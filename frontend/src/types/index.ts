export type UserRole = "landlord" | "tenant" | "agent" | "admin" | "super_admin";

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email?: string;
  role: UserRole;
  phone?: string;
  city?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  trustScore?: number;
  preferredLang?: "fr" | "en";
}

export interface Property {
  _id: string;
  id?: string | number;
  title: string;
  name?: string;
  description: string;
  address: string;
  addressRaw?: string;
  neighborhood?: string;
  neighbourhood?: string;
  city: string;
  region: string;
  type: string;
  propertyType?: string;
  status?: "pending_review" | "available" | "rented" | "reserved" | "hidden" | "rejected";
  landlord: string | User;
  landlordId?: string;
  landlordName?: string;
  landlordPhone?: string;
  agentId?: string;
  rooms: Room[];
  images: string[];
  photos?: { id: string; url: string; thumbnailUrl?: string; isCover?: boolean }[];
  amenities: string[];
  rules?: string[];
  utilities?: string[];
  furnished?: "furnished" | "semi_furnished" | "unfurnished";
  monthlyRent?: number;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  advanceMonths?: number;
  cautionMonths?: number;
  virtualTourUrl?: string;
  totalRooms?: number;
  occupiedRooms?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  _id: string;
  id?: string | number;
  property: string;
  propertyId?: string | number;
  roomNumber: string;
  type: string;
  roomType?: string;
  capacity?: number;
  price: number;
  monthlyRent?: number;
  cautionDeposit?: number;
  description: string;
  amenities: string[];
  isAvailable: boolean;
  images: string[];
}

export interface Inquiry {
  id: string;
  _id?: string;
  propertyId: string;
  listingId?: string;
  tenantId: string;
  tenantName?: string;
  tenantPhone?: string;
  listingTitle?: string;
  message: string;
  desiredMoveIn?: string;
  durationMonths?: number;
  status: "sent" | "read" | "replied" | "viewing_scheduled" | "closed";
  viewingDate?: string;
  landlordReply?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Booking {
  _id: string;
  guest: string | User;
  room: string | Room;
  property: string | Property;
  checkIn: string;
  checkOut: string;
  status: "pending" | "active" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  createdAt: string;
}

export interface Payment {
  _id: string;
  booking: string | Booking;
  amount: number;
  method: string;
  status: "pending" | "completed" | "failed";
  reference: string;
  createdAt: string;
}

export interface Invoice {
  _id: string;
  booking: string | Booking;
  tenant: string | User;
  landlord: string | User;
  amount: number;
  status: "unpaid" | "paid" | "overdue" | "pending" | "cancelled";
  dueDate: string;
  createdAt: string;
}

export interface MaintenanceTicket {
  _id: string;
  room: string | Room;
  user: string | User;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface VisitRequest {
  _id: string;
  guest: string | User;
  property: string | Property;
  room: string | Room;
  preferredDate: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
