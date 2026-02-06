"use client";

import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuthCheck } from "../hooks/useAuthCheck";

export default function ClientLayoutWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { isAuthValid, isChecking } = useAuthCheck();

  useEffect(() => {
    const check = () => {
      const userId = sessionStorage.getItem("userId");
      if (isChecking) {
        return; 
      }
      setIsAuthenticated(isAuthValid && !!userId);
    };

    check();

    const handleAuthChanged = () => check();

    window.addEventListener("authChanged", handleAuthChanged);
    window.addEventListener("storage", handleAuthChanged);

    return () => {
      window.removeEventListener("authChanged", handleAuthChanged);
      window.removeEventListener("storage", handleAuthChanged);
    };
  }, [isAuthValid, isChecking]);

  useEffect(() => {
    const updateCollapsedState = () => {
      const stored = localStorage.getItem("sidebarCollapsed");
      if (stored) {
        setIsCollapsed(JSON.parse(stored));
      }
    };

    updateCollapsedState();
    window.addEventListener("storage", updateCollapsedState);

    // Poll for changes within the same tab
    const interval = setInterval(updateCollapsedState, 100);

    return () => {
      window.removeEventListener("storage", updateCollapsedState);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {isAuthenticated && <Header />}

      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <main
          className={`flex-1 transition-all duration-300 ${
            isAuthenticated ? (isCollapsed ? "ml-20 pt-25" : "ml-64 pt-25") : ""
          }`}
        >
          {children}
        </main>
      </div>
    </>
  );
}
