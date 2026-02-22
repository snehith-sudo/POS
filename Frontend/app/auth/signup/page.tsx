"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signupService } from "@/app/service/auth-service";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignup();
  };

  async function handleSignup() {

    const toastId = toast.loading("Creating account...");

    try {

      const data = await signupService(username, password, confirmPassword);

      toast.success(data?.message || "Account created", { id: toastId });
      router.push("/");

    } catch (err: any) {
      toast.error(err.message || "Signup failed", { id: toastId });
    }
  }


  return (

    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-slate-900">
          POS System
        </h1>
        <p className="text-center text-gray-600 mb-8">Sign up for an account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="you@example"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            // onClick={handleLogin}
            className="w-full bg-slate-900 hover:bg-slate-950 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition duration-200"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
