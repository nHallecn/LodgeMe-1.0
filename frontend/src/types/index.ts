export type UserRole = "landlord" | "tenant" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface Property {
  _id: string;
  id?: string | number;
  title: string;
  name?: string;
  description: string;
  address: string;
  neighborhood?: string;
  city: string;
  region: string;
  type: string;
  landlord: string | User;
  rooms: Room[];
  images: string[];
  amenities: string[];
  totalRooms?: number;        // ← added: raw DB field
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

export interface Booking {
  _id: string;
  guest: string | User;
  room: string | Room;
  property: string | Property;
  checkIn: string;
  checkOut: string;
  // "active" added — DB uses active, frontend type was missing it
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
