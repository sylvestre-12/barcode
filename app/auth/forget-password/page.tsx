"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function resetPassword() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        newPassword,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Reset failed");
      return;
    }

    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">

        <h1 className="text-xl font-bold mb-4 text-center">
          Reset Password
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Your email"
          className="w-full p-3 border rounded mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* NEW PASSWORD */}
        <input
          type="password"
          placeholder="New password"
          className="w-full p-3 border rounded mb-4"
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={resetPassword}
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>

      </div>
    </div>
  );
}