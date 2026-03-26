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
  id?: string | number;       // backend returns numeric id; _id is the string alias
  title: string;
  name?: string;              // raw DB field alias
  description: string;
  address: string;
  neighborhood?: string;      // raw DB field alias
  city: string;
  region: string;
  type: string;
  landlord: string | User;
  rooms: Room[];
  images: string[];
  amenities: string[];
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
  roomType?: string;          // raw DB field alias
  capacity?: number;
  price: number;              // normalised from monthlyRent
  monthlyRent?: number;       // raw DB field alias
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
  status: "pending" | "confirmed" | "cancelled" | "completed";
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
  status: "unpaid" | "paid" | "overdue";
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
