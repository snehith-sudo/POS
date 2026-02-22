"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "../auth/AuthGuard";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import { Toaster } from "react-hot-toast";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const skipWrapper = pathname === "/" || pathname.startsWith("/auth");

  return (
    <>
      {skipWrapper ? (
        children
      ) : (
        <AuthGuard>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </AuthGuard>
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            zIndex: 9999,
          },
        }}
      />
    </>
  );
}
