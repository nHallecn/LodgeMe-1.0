import { z } from "zod";

// ============================================================================
// PROPERTY SCHEMAS
// ============================================================================

export const propertyCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(255),
  city: z.string().min(2, "City is required").max(100),
  neighborhood: z.string().min(2, "Neighborhood is required").max(100),
  totalRooms: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().min(1, "Must have at least 1 room").max(500)
  ),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  amenities: z.preprocess(
    (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string") return val.split(",").map((a) => a.trim()).filter(Boolean);
      return [];
    },
    z.array(z.string()).optional()
  ),
});

export type PropertyCreateFormData = z.infer<typeof propertyCreateSchema>;
export const propertyUpdateSchema = propertyCreateSchema;
export type PropertyUpdateFormData = z.infer<typeof propertyUpdateSchema>;

// ============================================================================
// ROOM SCHEMAS
// ============================================================================

export const roomCreateSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required").max(50),
  roomType: z.enum(["single", "double", "studio", "apartment"], {
    errorMap: () => ({ message: "Invalid room type" }),
  }),
  capacity: z.number().int().min(1, "Capacity must be at least 1").max(20),
  monthlyRent: z.number().min(0, "Monthly rent must be positive").max(999999),
  cautionDeposit: z.number().min(0, "Must be positive").optional(),
  description: z.string().max(2000).optional(),
  images: z.array(z.string()).optional(),
});

export type RoomCreateFormData = z.infer<typeof roomCreateSchema>;
export const roomUpdateSchema = roomCreateSchema;
export type RoomUpdateFormData = z.infer<typeof roomUpdateSchema>;

// ============================================================================
// BOOKING SCHEMAS
// ============================================================================

export const bookingCreateSchema = z
  .object({
    roomId: z.number().int().positive("Invalid room"),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid start date"),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid end date"),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type BookingCreateFormData = z.infer<typeof bookingCreateSchema>;

// ============================================================================
// MAINTENANCE TICKET SCHEMAS
// ============================================================================

export const maintenanceTicketSchema = z.object({
  roomId: z.number().int().positive("Room is required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export type MaintenanceTicketFormData = z.infer<typeof maintenanceTicketSchema>;

// ============================================================================
// PROPERTY SEARCH SCHEMA
// ============================================================================

export const propertySearchSchema = z.object({
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  roomType: z.string().optional(),
  isAvailable: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type PropertySearchFormData = z.infer<typeof propertySearchSchema>;
