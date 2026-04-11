import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

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

export const authAPI = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post("/auth/register", data),
};

export const propertiesAPI = {
  getAll: (params?: Record<string, string>) => api.get("/properties", { params }),
  getById: (id: string) => api.get(`/properties/${id}`),
  create: (data: Record<string, unknown>) => api.post("/properties", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
  getByLandlord: (landlordId: string) => api.get(`/properties/landlord/${landlordId}`),
  getRooms: (propertyId: string) => api.get(`/properties/${propertyId}/rooms`),
  getRoomById: (roomId: string) => api.get(`/properties/rooms/${roomId}`),
  addRoom: (propertyId: string, data: Record<string, unknown>) =>
    api.post(`/properties/${propertyId}/rooms`, data),
  createRoom: (propertyId: string, data: Record<string, unknown>) =>
    api.post(`/properties/${propertyId}/rooms`, data),
  updateRoom: (roomId: string, data: Record<string, unknown>) =>
    api.put(`/properties/rooms/${roomId}`, data),
  deleteRoom: (roomId: string) => api.delete(`/properties/rooms/${roomId}`),
};

export const bookingsAPI = {
  create: (data: Record<string, unknown>) => api.post("/bookings", data),
  getByGuest: () => api.get("/bookings/guest"),
  getByLandlord: () => api.get("/bookings/landlord"),
  getById: (id: string) => api.get(`/bookings/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/bookings/${id}`),
};

export const paymentsAPI = {
  record: (data: Record<string, unknown>) => api.post("/payments", data),
  getByLandlord: () => api.get("/payments/landlord"),
  getByGuest: () => api.get("/payments/guest"),
  getById: (id: string) => api.get(`/payments/${id}`),
};

export const invoicesAPI = {
  create: (data: Record<string, unknown>) => api.post("/invoices", data),
  getByLandlord: () => api.get("/invoices/landlord"),
  getByGuest: () => api.get("/invoices/guest"),
  getById: (id: string) => api.get(`/invoices/${id}`),
  updateStatus: (id: string, status: string, paidDate?: string) =>
    api.patch(`/invoices/${id}/status`, { status, paidDate }),
};

export const maintenanceAPI = {
  create: (data: Record<string, unknown>) => api.post("/maintenance-tickets", data),
  getByUser: () => api.get("/maintenance-tickets/user"),
  getByLandlord: () => api.get("/maintenance-tickets/landlord"),
  getByRoom: (roomId: string) => api.get(`/maintenance-tickets/room/${roomId}`),
  getById: (id: string) => api.get(`/maintenance-tickets/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.put(`/maintenance-tickets/${id}`, data),
};

export const visitsAPI = {
  create: (data: Record<string, unknown>) => api.post("/visits", data),
  getMyVisits: () => api.get("/visits/my-visits"),
  getByLandlord: () => api.get("/visits/landlord"),
  getById: (id: string) => api.get(`/visits/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/visits/${id}/status`, { status }),
};
