"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateUserInfo = () => {
      const storedUsername = sessionStorage.getItem("username");
      const storedRole = sessionStorage.getItem("role");

      setUsername(storedUsername);
      setRole(storedRole);
    };

    updateUserInfo();

    const handleAuthChanged = () => {
      updateUserInfo();
    };

    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      window.removeEventListener("authChanged", handleAuthChanged);
    };
  }, []);

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
      pathname === path || pathname.startsWith(path + "/")
        ? "bg-slate-700 text-white shadow-lg"
        : "text-gray-600 hover:bg-slate-100"
    } ${isCollapsed ? "justify-center" : ""}`;

  const navItems = [
    { href: "/home", icon: "📊", label: "Dashboard" },
    { href: "/clients", icon: "👥", label: "Clients" },
    { href: "/orders", icon: "📦", label: "Orders" },
    { href: "/products", icon: "🛍️", label: "Products" },
    { href: "/inventory", icon: "📦", label: "Inventory" },
    { href: "/reports", icon: "📈", label: "Reports" },
  ];

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored) {
      setIsCollapsed(JSON.parse(stored));
    }
  }, [isCollapsed]);

  async function handleLogout() {
    alert("Logging out...");
    setIsLoggingOut(true);
    const toastId = toast.loading("Logging out...");

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Logout failed", { id: toastId });
        setIsLoggingOut(false);
        return;
      }

      // Clear sessionStorage on client side
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("lastCheckTime");

      toast.success("Logged out successfully", { id: toastId });

      // Dispatch event to update UI
      window.dispatchEvent(new Event("authChanged"));

      // Redirect to login
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong", { id: toastId });
      setIsLoggingOut(false);
    }
  }

  return (
    <div
      className={`flex flex-col bg-white h-screen shadow-lg fixed left-0 top-0 z-50 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header with Collapse Button */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex-shrink-0 p-2 hover:bg-slate-700 rounded-lg transition text-white"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          ☰
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href)}
            title={isCollapsed ? item.label : ""}
          >
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      {!isCollapsed && (
        <div className="px-4">
          <div className="h-px bg-slate-300"></div>
        </div>
      )}

      {/* User Info at Bottom */}
      <div className="relative bg-slate-900 text-white p-4 flex items-center gap-3 mb-10">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white flex-shrink-0 hover:bg-white/20 transition"
          title="User menu"
        >
          {username ? username.charAt(0).toUpperCase() : "U"}
        </button>
        {!isCollapsed && (
          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate">{username || "Guest"}</h2>
            <p className="text-slate-400 text-xs truncate">{role || "Visitor"}</p>
          </div>
        )}

        {/* Floating Logout Menu */}
        {showUserMenu && (
          <div className="absolute bottom-full left-4 mb-2 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <span>🚪</span>
              <span className="font-medium">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
