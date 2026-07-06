"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // =========================
      // ADMIN OTP FLOW
      // =========================
      if (data.requireOtp) {
        router.push(`/auth/otp?email=${email}`);
        return;
      }

      // =========================
      // SAVE TOKEN (IMPORTANT FIX)
      // =========================
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // =========================
      // ROLE REDIRECTION
      // =========================
      router.push(data.nextRoute || "/dashboard");

    } catch (err) {
      setLoading(false);
      setError("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-blue-50 dark:from-black dark:via-zinc-950 dark:to-zinc-900 px-4 py-6">

      <div className="w-full max-w-md">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-black dark:hover:text-white mb-5"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">
              CheckIn<span className="text-blue-600">AI</span>
            </h1>

            <h2 className="mt-3 text-xl font-semibold">
              Welcome back
            </h2>

            <p className="text-sm text-zinc-500">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 text-zinc-400" size={18} />
                <input
                  type="email"
                  className="w-full rounded-xl border pl-10 pr-3 py-2.5 dark:bg-zinc-800"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 text-zinc-400" size={18} />
                <input
                  type="password"
                  className="w-full rounded-xl border pl-10 pr-3 py-2.5 dark:bg-zinc-800"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/auth/forget-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              disabled={loading}
              className="w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-xl font-semibold"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}