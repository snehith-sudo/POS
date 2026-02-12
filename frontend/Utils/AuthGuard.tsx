"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthCheck } from "./useAuthCheck";

const PUBLIC_PAGES = ["/auth/login", "/auth/signup", "/"];

export default function AuthGuard({children,}: Readonly<{ children: React.ReactNode }>) {

  const router = useRouter();
  const pathname = usePathname();
  const { isAuthValid, isChecking } = useAuthCheck();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    const userId = sessionStorage.getItem("userId");
   
    const isAuth = isAuthValid || !!userId;
    console.log("AuthGuard: pathname=", pathname, "isAuthValid=", isAuthValid, "isChecking=", isChecking, "userId=", userId, "-> isAuth=", isAuth);

    setIsAuthenticated(isAuth);
    setHasChecked(true);

    if (PUBLIC_PAGES.includes(pathname)) {
      setIsLoading(false);
      return;
    }

    if (!isAuth) {
      console.log("AuthGuard: Not authenticated — redirecting to login /");
      router.push("/");
      return;
    }

    setIsLoading(false);
  }, [isAuthValid, isChecking, pathname]); 

  if (isChecking || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  
  if (PUBLIC_PAGES.includes(pathname)) {return <>{children}</>;}

  if (isAuthenticated) {return <>{children}</>;}

  return null;
}
