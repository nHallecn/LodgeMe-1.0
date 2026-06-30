import axios, { AxiosResponse } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

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
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

function unwrap<T = unknown>(request: Promise<AxiosResponse>): Promise<AxiosResponse<T>> {
  return request.then((response) => {
    const body = response.data;
    return {
      ...response,
      data: body?.success && Object.prototype.hasOwnProperty.call(body, "data") ? body.data : body,
    };
  });
}

function unwrapListingList(request: Promise<AxiosResponse>): Promise<AxiosResponse> {
  return unwrap(request).then((response) => ({
    ...response,
    data: (response.data as { listings?: unknown[]; properties?: unknown[] })?.listings
      || (response.data as { listings?: unknown[]; properties?: unknown[] })?.properties
      || response.data
      || [],
  }));
}

function unwrapSingleListing(request: Promise<AxiosResponse>): Promise<AxiosResponse> {
  return unwrap(request).then((response) => ({
    ...response,
    data: (response.data as { listing?: unknown; property?: unknown })?.listing
      || (response.data as { listing?: unknown; property?: unknown })?.property
      || response.data,
  }));
}

export default api;

export const authAPI = {
  requestOtp: (phone: string) => unwrap(api.post("/auth/request-otp", { phone })),
  verifyOtp: (data: {
    phone: string;
    code: string;
    fullName?: string;
    role?: string;
    city?: string;
    preferredLang?: "fr" | "en";
  }) => unwrap(api.post("/auth/verify-otp", data)),
  me: () => unwrap(api.get("/users/me")),
  updateMe: (data: Record<string, unknown>) => unwrap(api.patch("/users/me", data)),
  login: (email: string, password: string) => unwrap(api.post("/auth/login", { email, password })),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    unwrap(api.post("/auth/register", data)),
};

export const listingsAPI = {
  getAll: (params?: Record<string, string>) => unwrap(api.get("/listings", { params })),
  getMine: () => unwrap(api.get("/listings/mine")),
  getById: (id: string) => unwrap(api.get(`/listings/${id}`)),
  create: (data: Record<string, unknown>) => unwrap(api.post("/listings", data)),
  update: (id: string, data: Record<string, unknown>) => unwrap(api.patch(`/listings/${id}`, data)),
  delete: (id: string) => unwrap(api.delete(`/listings/${id}`)),
  replacePhotos: (id: string, photos: unknown[]) => unwrap(api.post(`/listings/${id}/photos`, { photos })),
  createInquiry: (id: string, data: Record<string, unknown>) => unwrap(api.post(`/listings/${id}/inquiries`, data)),
  getInquiries: (id: string) => unwrap(api.get(`/listings/${id}/inquiries`)),
};

export const inquiriesAPI = {
  getMine: () => unwrap(api.get("/inquiries/mine")),
  getByGuest: () => unwrap(api.get("/inquiries/mine")),
  getByLandlord: () => unwrap(api.get("/inquiries/landlord")),
  update: (id: string, data: Record<string, unknown>) => unwrap(api.patch(`/inquiries/${id}`, data)),
  create: (listingId: string, data: Record<string, unknown>) => listingsAPI.createInquiry(listingId, data),
};

export const adminAPI = {
  getStats: () => unwrap(api.get("/admin/stats")),
  getListingQueue: () => unwrap(api.get("/admin/listings/queue")),
  verifyListing: (id: string, status: string, rejectionReason?: string) =>
    unwrap(api.patch(`/admin/listings/${id}/verify`, { status, rejectionReason })),
};

export const propertiesAPI = {
  getAll: (params?: Record<string, string>) => unwrapListingList(api.get("/listings", { params })),
  getById: (id: string) => unwrapSingleListing(api.get(`/listings/${id}`)),
  create: (data: FormData | Record<string, unknown>) => unwrapSingleListing(api.post("/listings", data)),
  update: (id: string, data: FormData | Record<string, unknown>) => unwrapSingleListing(api.patch(`/listings/${id}`, data)),
  delete: (id: string) => api.delete(`/listings/${id}`),
  getByLandlord: (_landlordId?: string) => unwrapListingList(api.get("/listings/mine")),
  getRooms: (propertyId: string) => unwrap(api.get(`/listings/${propertyId}/rooms`)),
  getRoomById: (roomId: string) => unwrap(api.get(`/listings/${roomId}/rooms`)),
  addRoom: (propertyId: string, data: Record<string, unknown>) => unwrap(api.post(`/properties/${propertyId}/rooms`, data)),
  updateRoom: (roomId: string, data: Record<string, unknown>) => unwrap(api.put(`/properties/rooms/${roomId}`, data)),
  deleteRoom: (roomId: string) => api.delete(`/properties/rooms/${roomId}`),
};

const emptyList = () => Promise.resolve({ data: [] } as AxiosResponse);
const emptyItem = () => Promise.resolve({ data: null } as AxiosResponse);

export const bookingsAPI = {
  create: (data: Record<string, unknown>) => unwrap(api.post("/leases", data)),
  getByGuest: emptyList,
  getByLandlord: emptyList,
  getById: emptyItem,
  updateStatus: (_id: string, _status: string) => emptyItem(),
  delete: emptyItem,
};

export const paymentsAPI = {
  record: (data: Record<string, unknown>) => unwrap(api.post("/payments/initiate", data)),
  getByLandlord: emptyList,
  getByGuest: emptyList,
  getById: emptyItem,
};

export const invoicesAPI = {
  create: (_data: Record<string, unknown>) => emptyItem(),
  getByLandlord: emptyList,
  getById: emptyItem,
  updateStatus: (_id: string, _status: string, _paidDate?: string) => emptyItem(),
};

export const maintenanceAPI = {
  create: (_data: Record<string, unknown>) => emptyItem(),
  getByGuest: emptyList,
  getByUser: emptyList,
  getByLandlord: emptyList,
  getByRoom: (_roomId: string) => emptyList(),
  getById: emptyItem,
  update: (_id: string, _data: Record<string, unknown>) => emptyItem(),
};

export const visitsAPI = {
  create: (data: Record<string, unknown>) => inquiriesAPI.create(String(data.propertyId || data.listingId), data),
  getByGuest: () => inquiriesAPI.getMine(),
  getMyVisits: () => inquiriesAPI.getMine(),
  getByLandlord: () => inquiriesAPI.getByLandlord(),
  getById: emptyItem,
  updateStatus: (id: string, status: string) => inquiriesAPI.update(id, { status }),
};
