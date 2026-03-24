import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post("/auth/register", data),
};

// Properties API
export const propertiesAPI = {
  getAll: (params?: Record<string, string>) =>
    api.get("/properties", { params }),
  getById: (id: string) =>
    api.get(`/properties/${id}`),
  create: (data: FormData | Record<string, unknown>) =>
    api.post("/properties", data),
  update: (id: string, data: FormData | Record<string, unknown>) =>
    api.put(`/properties/${id}`, data),
  delete: (id: string) =>
    api.delete(`/properties/${id}`),
  getByLandlord: (landlordId: string) =>
    api.get(`/properties/landlord/${landlordId}`),
  // Rooms
  getRooms: (propertyId: string) =>
    api.get(`/properties/${propertyId}/rooms`),
  getRoomById: (roomId: string) =>
    api.get(`/properties/rooms/${roomId}`),
  addRoom: (propertyId: string, data: Record<string, unknown>) =>
    api.post(`/properties/${propertyId}/rooms`, data),
  updateRoom: (roomId: string, data: Record<string, unknown>) =>
    api.put(`/properties/rooms/${roomId}`, data),
  deleteRoom: (roomId: string) =>
    api.delete(`/properties/rooms/${roomId}`),
};

// Bookings API
export const bookingsAPI = {
  create: (data: Record<string, unknown>) =>
    api.post("/bookings", data),
  getByGuest: () =>
    api.get("/bookings/guest"),
  getById: (id: string) =>
    api.get(`/bookings/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/bookings/${id}/status`, { status }),
  delete: (id: string) =>
    api.delete(`/bookings/${id}`),
};

// Payments API
export const paymentsAPI = {
  record: (data: Record<string, unknown>) =>
    api.post("/payments", data),
  getByLandlord: () =>
    api.get("/payments/landlord"),
  getById: (id: string) =>
    api.get(`/payments/${id}`),
};

// Invoices API
export const invoicesAPI = {
  create: (data: Record<string, unknown>) =>
    api.post("/invoices", data),
  getByLandlord: () =>
    api.get("/invoices/landlord"),
  getById: (id: string) =>
    api.get(`/invoices/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/invoices/${id}/status`, { status }),
};

// Maintenance Tickets API
export const maintenanceAPI = {
  create: (data: Record<string, unknown>) =>
    api.post("/maintenance-tickets", data),
  getByUser: () =>
    api.get("/maintenance-tickets/user"),
  getByRoom: (roomId: string) =>
    api.get(`/maintenance-tickets/room/${roomId}`),
  getById: (id: string) =>
    api.get(`/maintenance-tickets/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/maintenance-tickets/${id}`, data),
};

// Visit Requests API
export const visitsAPI = {
  create: (data: Record<string, unknown>) =>
    api.post("/visits", data),
  getMyVisits: () =>
    api.get("/visits/my-visits"),
  getById: (id: string) =>
    api.get(`/visits/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/visits/${id}/status`, { status }),
};