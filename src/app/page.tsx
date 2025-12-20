"use client";

import { useEffect, useState } from "react";
import LandingPage from "@/components/LandingPage";
import DashboardHome from "@/components/DashboardHome";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for authentication
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      setIsLoading(false);
    };

    checkAuth();
    
    // Listen for auth changes to update state immediately if user logs out/in
    window.addEventListener("authChange", checkAuth);
    return () => window.removeEventListener("authChange", checkAuth);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isLoggedIn ? <DashboardHome /> : <LandingPage />;
}
