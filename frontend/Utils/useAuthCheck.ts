// hooks/useAuthCheck.ts
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AUTH_CHECK_INTERVAL = 5 * 60 * 1000;

const hasJSESSIONID = () => document.cookie.includes("JSESSIONID");

export function useAuthCheck() {
  const [isAuthValid, setIsAuthValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("useAuthCheck: starting auth check");
      setIsChecking(true);

      const lastCheckTime = sessionStorage.getItem("lastCheckTime");
      const userIdInSession = sessionStorage.getItem("userId");
      const now = Date.now();

      // If last check is recent AND userId already exists in this tab, skip the network call
      if (lastCheckTime && now - Number(lastCheckTime) < AUTH_CHECK_INTERVAL && userIdInSession) {
        setIsAuthValid(true);
        setIsChecking(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        console.log("useAuthCheck: /api/auth/me response status:", res.status);

        if (!res.ok) {
          throw new Error("Session invalid");
        }

        const data = await res.json();
        console.log("useAuthCheck: /api/auth/me returned:", data);

        // Restore useful sessionStorage keys when backend returns user info
        if (data) {
          sessionStorage.setItem("userId", String(data.userId));
          if (data.username) sessionStorage.setItem("username", String(data.username));
          if (data.role) sessionStorage.setItem("role", String(data.role));
        }

        sessionStorage.setItem("lastCheckTime", String(Date.now()));
        setIsAuthValid(true);
      } catch (err) {
        sessionStorage.clear();
        setIsAuthValid(false);
        // Only show error toast if JSESSIONID exists (session was valid before)
        if (hasJSESSIONID()) {
          toast.error("Session expired. Please log in again.");
        }
      } finally {
        setIsChecking(false);
        console.log("useAuthCheck: finished auth check");
      }
    };

    // run once on mount and then on interval
    checkAuth();
    const interval = setInterval(checkAuth, AUTH_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return { isAuthValid, isChecking };

}