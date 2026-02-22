"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { logoutUser } from "../service/auth-service";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // 👇 Always collapsed by default
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const collapseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update localStorage whenever sidebar collapse state changes for responsive layout
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
    // Dispatch custom event for immediate updates in the same tab
    window.dispatchEvent(new Event("sidebarToggle"));
  }, [isCollapsed]);

  // Listen for mobile toggle events (from Header)
  useEffect(() => {
    const handler = () => setIsMobileOpen((v) => !v);
    window.addEventListener("toggleMobileSidebar", handler);
    return () => window.removeEventListener("toggleMobileSidebar", handler);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const updateUserInfo = () => {
      setUsername(sessionStorage.getItem("username"));
      setRole(sessionStorage.getItem("role"));
    };

    updateUserInfo();
    window.addEventListener("authChanged", updateUserInfo);

    return () => {
      window.removeEventListener("authChanged", updateUserInfo);
    };
  }, []);

  const navItems = [
    { href: "/src/home", icon: "📊", label: "Dashboard" },
    { href: "/src/clients", icon: "👥", label: "Clients" },
    { href: "/src/products", icon: "🛍️", label: "Products" },
    { href: "/src/inventory", icon: "📦", label: "Inventory" },
    { href: "/src/orders", icon: "📦", label: "Orders" },
    { href: "/src/reports", icon: "📈", label: "Reports" },
  ];

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
     ${pathname === path || pathname.startsWith(path + "/")
      ? "bg-slate-800 text-white shadow-lg"
      : "text-gray-600 hover:bg-slate-100"
    }
     ${isCollapsed ? "justify-center" : ""}`;

  async function handleLogout() {
    setIsLoggingOut(true);
    const toastId = toast.loading("Logging out...");

    try {
      await logoutUser();
      sessionStorage.clear();
      toast.success("Logged out successfully", { id: toastId });

      window.dispatchEvent(new Event("authChanged"));
      router.push("/");

    } catch (err: any) {
      toast.error(err.message || "Logout failed", { id: toastId });
    } finally {
      setIsLoggingOut(false);
    }
  }


  return (
    <div>
      {/* Invisible hover strip to open collapsed sidebar on desktop */}
      {isCollapsed && !isMobileOpen && (
        <div
          onMouseEnter={() => {
            if (collapseTimeout.current) clearTimeout(collapseTimeout.current);
            setIsCollapsed(false);
          }}
          onMouseLeave={() => {
            collapseTimeout.current = setTimeout(() => {
              setIsCollapsed(true);
              setShowUserMenu(false);
            }, 150);
          }}
          className="fixed left-0 top-0 h-screen w-2 z-40 hidden md:block"
        />
      )}
      <div
        onClick={() => setIsMobileOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 md:hidden ${isMobileOpen ? "block" : "hidden"}`}
      />

      <div
        onMouseEnter={() => {
          if (collapseTimeout.current) clearTimeout(collapseTimeout.current);
          setIsCollapsed(false);
        }}
        onMouseLeave={() => {
          collapseTimeout.current = setTimeout(() => {
            setIsCollapsed(true);
            setShowUserMenu(false);
          }, 150);
        }}
        className={`fixed left-0 top-0 z-50 h-screen bg-white shadow-lg
        transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        ${isCollapsed ? "md:w-20 w-64" : "md:w-64 w-64"}`}
      >
        <div className="bg-slate-800 text-white h-14 flex items-center justify-center text-xl font-bold">
        </div>

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

        {/* User Section */}
        <div className="relative bg-slate-800 text-white p-2 flex items-center gap-3">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                     text-lg font-bold hover:bg-white/20 transition"
          >
            {username ? username.charAt(0).toUpperCase() : "U"}
          </button>

          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">
                {username || "Guest"}
              </h2>
              <p className="text-slate-400 text-xs truncate">
                {role || "Visitor"}
              </p>
            </div>
          )}

          {/* Logout Menu */}
          {showUserMenu && !isCollapsed && (
            <div className="absolute bottom-full left-4 mb-2 bg-white rounded-lg shadow-xl border z-50">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-3 text-red-600
                         hover:bg-red-50 transition w-full
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚪 {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
