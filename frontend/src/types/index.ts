/* eslint-disable @typescript-eslint/no-explicit-any */
import { Key, ReactNode } from "react";

export type UserRole = "landlord" | "tenant" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface Property {
  [x: string]: ReactNode;
  id: string | number;
  _id: string;
  title: string;
  description: string;
  address: string;
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
  property: string;
  roomNumber: string;
  type: string;
  price: number;
  description: string;
  amenities: string[];
  isAvailable: boolean;
  images: string[];
}

export interface Booking {
  id: number;
  startDate: string | number | Date;
  endDate: string;
  guestId: ReactNode;
  roomId: ReactNode;
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
  id: Key;
  bookingId: ReactNode;
  paymentMethod: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  receiptNumber: any;
  notes: any;
  paymentDate: string | number | Date;
  _id: string;
  booking: string | Booking;
  amount: number;
  method: string;
  status: "pending" | "completed" | "failed";
  reference: string;
  createdAt: string;
}

export interface Invoice {
  id: number;
  bookingId: ReactNode;
  tenantId: ReactNode;
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
  id: number;
  roomId: ReactNode;
  userId: ReactNode;
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
