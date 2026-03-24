import { z } from "zod";

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must be less than 50 characters"),
    confirmPassword: z.string(),
    role: z.enum(["landlord", "tenant"], { errorMap: () => ({ message: "Please select a role" }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================================================
// PROPERTY SCHEMAS
// ============================================================================

export const propertyCreateSchema = z.object({
  name: z.string().min(3).max(255),
  city: z.string().min(2).max(100),
  neighborhood: z.string().min(2).max(100),
  // Preprocess: coerce string → number for numeric inputs
  latitude: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  longitude: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  totalRooms: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().min(1, "Must have at least 1 room").max(500)
  ),
  description: z.string().min(10).max(2000),
  // Preprocess: coerce comma string → array
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
  roomNumber: z.string().min(1, "Room number is required").max(50, "Room number must be less than 50 characters"),
  roomType: z.enum(["single", "double", "studio", "apartment"], { errorMap: () => ({ message: "Invalid room type" }) }),
  capacity: z.number().int().min(1, "Capacity must be at least 1").max(20, "Capacity cannot exceed 20"),
  monthlyRent: z.number().min(0, "Monthly rent must be positive").max(999999, "Monthly rent is too high"),
  cautionDeposit: z.number().min(0, "Caution deposit must be positive").optional(),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
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
// PAYMENT SCHEMAS
// ============================================================================

export const paymentCreateSchema = z.object({
  bookingId: z.number().int().positive("Invalid booking"),
  amount: z.number().min(0.01, "Amount must be greater than 0").max(999999, "Amount is too high"),
  paymentDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid payment date"),
  paymentMethod: z.enum(["cash", "mobile_money", "bank_transfer", "other"], {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
  receiptNumber: z.string().max(100, "Receipt number must be less than 100 characters").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

export type PaymentCreateFormData = z.infer<typeof paymentCreateSchema>;

// ============================================================================
// INVOICE SCHEMAS
// ============================================================================

export const invoiceCreateSchema = z
  .object({
    bookingId: z.number().int().positive("Invalid booking"),
    amount: z.number().min(0.01, "Amount must be greater than 0").max(999999, "Amount is too high"),
    dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid due date"),
  })
  .refine((data) => new Date(data.dueDate) > new Date(), {
    message: "Due date must be in the future",
    path: ["dueDate"],
  });

export type InvoiceCreateFormData = z.infer<typeof invoiceCreateSchema>;

// ============================================================================
// MAINTENANCE TICKET SCHEMAS
// ============================================================================

export const maintenanceTicketCreateSchema = z.object({
  roomId: z.number().int().positive("Invalid room"),
  title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must be less than 255 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"], { errorMap: () => ({ message: "Invalid priority" }) }),
});

export type MaintenanceTicketCreateFormData = z.infer<typeof maintenanceTicketCreateSchema>;

export const maintenanceTicketUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"], { errorMap: () => ({ message: "Invalid status" }) }).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"], { errorMap: () => ({ message: "Invalid priority" }) }).optional(),
});

export type MaintenanceTicketUpdateFormData = z.infer<typeof maintenanceTicketUpdateSchema>;

// ============================================================================
// VISIT REQUEST SCHEMAS
// ============================================================================

export const visitRequestCreateSchema = z.object({
  propertyId: z.number().int().positive("Invalid property"),
  requestedDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid requested date"),
  requestedTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

export type VisitRequestCreateFormData = z.infer<typeof visitRequestCreateSchema>;

export const visitRequestUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"], {
    errorMap: () => ({ message: "Invalid status" }),
  }),
});

export type VisitRequestUpdateFormData = z.infer<typeof visitRequestUpdateSchema>;

// ============================================================================
// REVIEW SCHEMAS
// ============================================================================

export const reviewCreateSchema = z.object({
  bookingId: z.number().int().positive("Invalid booking"),
  revieweeId: z.number().int().positive("Invalid reviewee"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),
});

export type ReviewCreateFormData = z.infer<typeof reviewCreateSchema>;

// ============================================================================
// SEARCH & FILTER SCHEMAS
// ============================================================================

export const propertySearchSchema = z.object({
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  roomType: z.string().optional(),
  isAvailable: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type PropertySearchFormData = z.infer<typeof propertySearchSchema>;
