"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">

        <Link href="/" className="text-2xl font-bold text-primary flex items-center">
          <Image
            src="/logo.png"
            alt="LodgeMe Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          LodgeMe
        </Link>

        <div className="space-x-4 flex items-center">

          <Link href="/properties" className="text-gray-700 hover:text-primary">
            Properties
          </Link>

          {isAuthenticated && user?.role === "landlord" && (
            <Link
              href="/landlord/dashboard"
              className="text-gray-700 hover:text-primary"
            >
              Landlord Dashboard
            </Link>
          )}

          {isAuthenticated && user?.role === "tenant" && (
            <Link
              href="/tenant/dashboard"
              className="text-gray-700 hover:text-primary"
            >
              Tenant Dashboard
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}