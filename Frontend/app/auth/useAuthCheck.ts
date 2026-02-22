import { useEffect, useState } from "react";
import { subscribe, getState } from "./authStore";

export function useAuthCheck() {
  const initial = getState();
  const [isAuthValid, setIsAuthValid] = useState(initial.isAuthValid ?? false);
  const [isChecking, setIsChecking] = useState(initial.isChecking ?? true);

  useEffect(() => {
    const unsub = subscribe((s) => {
      setIsAuthValid(!!s.isAuthValid);
      setIsChecking(!!s.isChecking);
    });
    return () => unsub();
  }, []);

  return { isAuthValid, isChecking };

}