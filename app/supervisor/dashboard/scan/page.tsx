"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

type Student = {
  id: string;
  name: string;
  studentId: string;
  department?: string;
};

export default function ScanPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannedRef = useRef(false);

  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText: string) => {
        if (scannedRef.current) return;
        scannedRef.current = true;

        setResult(decodedText);
        setLoading(true);
        setMessage("");
        setStudent(null);

        try {
          const res = await fetch("/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barcode: decodedText }),
          });

          const data = await res.json();

          if (!res.ok) {
            setMessage(data.error || "Scan failed ❌");
            return;
          }

          setMessage(data.message || "Check-in successful ✔");

          // 👇 store student info returned from API
          setStudent(data.student || null);
        } catch (err) {
          setMessage("Server error ❌");
        } finally {
          setLoading(false);

          setTimeout(() => {
            scannedRef.current = false;
          }, 2000);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">

      <h1 className="text-2xl font-bold mb-4">
        📷 QR Attendance Scanner
      </h1>

      {/* CAMERA */}
      <div
        id="reader"
        className="w-full max-w-sm border rounded-xl overflow-hidden shadow-lg bg-white"
      />

      {/* SCANNED CODE */}
      {result && (
        <div className="mt-4 p-3 bg-white rounded w-full max-w-sm text-center shadow">
          <p>
            <b>Scanned:</b> {result}
          </p>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <p className="mt-3 text-blue-600 font-medium">
          Processing scan...
        </p>
      )}

      {/* MESSAGE */}
      {message && (
        <p className="mt-2 text-green-600 font-semibold">
          {message}
        </p>
      )}

      {/* STUDENT CARD RESULT */}
      {student && (
        <div className="mt-4 w-full max-w-sm bg-white p-4 rounded-xl shadow">
          <h2 className="font-bold text-lg">{student.name}</h2>
          <p className="text-gray-600">{student.studentId}</p>
          <p className="text-gray-500">{student.department}</p>
        </div>
      )}
    </div>
  );
}