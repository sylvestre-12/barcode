"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Shield,
  Lock,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    role: "staff",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Signup failed");
      return;
    }

    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-blue-50 dark:from-black dark:via-zinc-950 dark:to-zinc-900 flex items-center justify-center px-4 py-6">

      <div className="w-full max-w-3xl">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-black dark:hover:text-white mb-4"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">

          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="text-3xl font-bold">
              CheckIn<span className="text-blue-600">AI</span>
            </h1>

            <h2 className="mt-2 text-xl font-semibold">
              Create your account
            </h2>

            <p className="text-sm text-zinc-500">
              Join your organization securely
            </p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* FORM GRID (IMPORTANT PART) */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Full Name */}
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 text-zinc-400" size={18} />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Full Name"
                    className="w-full rounded-xl border pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 text-zinc-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="email@example.com"
                    className="w-full rounded-xl border pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium">Phone</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-3 text-zinc-400" size={18} />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+250..."
                    className="w-full rounded-xl border pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-sm font-medium">Username</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 text-zinc-400" size={18} />
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    placeholder="john123"
                    className="w-full rounded-xl border pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="text-sm font-medium">Role</label>
                <div className="relative mt-1">
                  <Shield className="absolute left-3 top-3 text-zinc-400" size={18} />
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-xl border pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800"
                  >
                    <option value="staff">Staff</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 text-zinc-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border pl-10 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 text-zinc-400" size={18} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border pl-10 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-zinc-500"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              <input type="checkbox" required className="mt-1" />
              <span>
                I agree to the{" "}
                <Link href="#" className="text-blue-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Button */}
            <button
              disabled={loading}
              className="w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-xl font-semibold hover:scale-[1.01] transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          {/* Bottom Links */}
          <div className="mt-6 text-center space-y-2 text-sm">
            <p className="text-zinc-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 font-medium">
                Sign In
              </Link>
            </p>

            <Link href="/auth/forgot-password" className="text-blue-600">
              Forgot password?
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}