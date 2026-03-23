/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const login = useCallback((newToken: string, userData: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    const dashboardRoutes: Record<UserRole, string> = {
      landlord: "/landlord/dashboard",
      tenant: "/tenant/dashboard",
      admin: "/admin/dashboard",
    };
    navigate(dashboardRoutes[userData.role] || "/");
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: Boolean(token && user) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
