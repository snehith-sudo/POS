"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  async function handleLogin() {
    const toastId = toast.loading("Logging the User...");

    const res = await fetch("/service/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        {
          backendusername: username,
          backendpassword: password
        }),
    });

    let data: any;
    try {
      data = await res.json();
    } catch (err) {
      const text = await res.text();
      toast.error(text || "Login failed (invalid server response)", { id: toastId });
      return;
    }

    if (!res.ok) {
      toast.error(data.message || "Login failed", { id: toastId });
      return;
    }
    console.log("Login successful:", data.username, data.role);

    // store identifiers used by layout and pages
    sessionStorage.setItem("userId", data.userId ?? data.username);
    sessionStorage.setItem("username", data.username);
    sessionStorage.setItem("role", data.role);
    sessionStorage.setItem("lastCheckTime", Date.now().toString());
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("authChanged"));
    }
    toast.success("User Logged in Successfully", { id: toastId });

    onLoginSuccess();
    router.push("/home");

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-slate-900">
          POS System
        </h1>
        <p className="text-center text-gray-600 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            onClick={handleLogin}
            className="w-full bg-slate-900 hover:bg-slate-950 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-slate-700 hover:text-slate-900 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
