"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScanPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannedRef = useRef(false);

  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scannerRef.current) return; // prevent double init

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText: string) => {
        // 🔴 prevent spam scanning
        if (scannedRef.current) return;
        scannedRef.current = true;

        setResult(decodedText);
        setLoading(true);
        setMessage("");

        try {
          const res = await fetch("/api/scan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              barcode: decodedText,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setMessage(data.error || "Scan failed ❌");
            return;
          }

          setMessage(data.message || "Success ✔");
        } catch {
          setMessage("Server error ❌");
        } finally {
          setLoading(false);

          // allow next scan after 2 seconds
          setTimeout(() => {
            scannedRef.current = false;
          }, 2000);
        }
      },
      (error) => {
        // ignore scan errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-white p-4">

      <h1 className="text-2xl font-bold mb-4">
        📷 CheckInAI Scanner
      </h1>

      {/* CAMERA */}
      <div
        id="reader"
        className="w-full max-w-sm border rounded-xl overflow-hidden shadow-lg bg-white"
      />

      {/* RESULT */}
      {result && (
        <div className="mt-4 p-3 bg-gray-50 rounded w-full max-w-sm text-center">
          <p className="text-sm text-gray-700">
            <b>Scanned:</b> {result}
          </p>
        </div>
      )}

      {/* STATUS */}
      {loading && (
        <p className="mt-3 text-blue-600 font-medium">
          Processing scan...
        </p>
      )}

      {message && (
        <p className="mt-2 text-green-600 font-semibold">
          {message}
        </p>
      )}
    </div>
  );
}