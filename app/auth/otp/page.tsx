"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OTPPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ SAFE replacement for useSearchParams
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email"));
  }, []);

  async function verify() {
    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    if (!email) {
      setError("Session expired. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "OTP verification failed");
        return;
      }

      if (data.nextRoute) {
        router.push(data.nextRoute);
      } else {
        router.push("/dashboard");
      }

    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">
          OTP Verification
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 border rounded text-center tracking-widest"
          placeholder="Enter OTP"
        />

        <button
          onClick={verify}
          disabled={loading}
          className="w-full mt-4 bg-black text-white p-3 rounded"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </main>
  );
}