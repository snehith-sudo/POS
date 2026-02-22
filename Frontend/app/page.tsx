// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Login from "./auth/login/Login";
import { useAuthCheck } from "./auth/useAuthCheck";
import { useRouter } from "next/navigation";

export default function Page() {
  const { isAuthValid, isChecking } = useAuthCheck();
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isChecking) setChecked(true);
  }, [isChecking]);

  useEffect(() => {
    if (!isChecking && isAuthValid) {
      const userId = sessionStorage.getItem("userId");
      if (userId) {
        router.replace("/src/home");
      }
    }
  }, [isChecking, isAuthValid, router]);

  useEffect(() => {
    const onAuthChanged = () => {

      const userId = sessionStorage.getItem("userId");
      if (userId) router.replace("/src/home");
      else {
        router.replace("/");
      }
    };
    window.addEventListener("authChanged", onAuthChanged);
    return () => window.removeEventListener("authChanged", onAuthChanged);
  }, [router]);

  if (!checked) return null;

  const userId = sessionStorage.getItem("userId");
  if (!isAuthValid || !userId) {
    return <Login onLoginSuccess={() => window.dispatchEvent(new Event("authChanged"))} />;
  }

  return null;
}
