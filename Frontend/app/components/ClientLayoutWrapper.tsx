"use client";

import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuthCheck } from "../auth/useAuthCheck";
import Footer from "./Footer";

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
    window.addEventListener("sidebarToggle", updateCollapsedState);

    // Poll for changes within the same tab
    const interval = setInterval(updateCollapsedState, 100);

    return () => {
      window.removeEventListener("storage", updateCollapsedState);
      window.removeEventListener("sidebarToggle", updateCollapsedState);
      clearInterval(interval);
    };
  }, []);

  // When the sidebar is fixed, apply a matching left margin on md+ breakpoints
  // so the main content doesn't sit underneath it. We avoid adding padding.
  const mainMarginClass = isAuthenticated
    ? isCollapsed
      ? "md:ml-20"
      : "md:ml-64"
    : "";

  return (
    <>
      {isAuthenticated && <Header />}

      <div className="flex w-full min-h-screen">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 w-full pb-24 pt-14 px-4 sm:px-6 lg:px-8 ${mainMarginClass}`}>
          {children}
        </main>
      </div>

      {isAuthenticated && <Footer />}
    </>
  );
}
