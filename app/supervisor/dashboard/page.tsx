"use client";

import Link from "next/link";

export default function SupervisorDashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">

      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          Supervisor Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor attendance, scan barcodes, and track system activity in real time.
        </p>
      </header>

      {/* STATS CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-sm text-gray-500">Today Scans</h2>
          <p className="text-2xl font-bold text-blue-600">--</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-sm text-gray-500">Active Users</h2>
          <p className="text-2xl font-bold text-green-600">--</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-sm text-gray-500">Anomalies</h2>
          <p className="text-2xl font-bold text-red-600">--</p>
        </div>

      </section>

      {/* ACTION CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* SCAN CARD */}
        <Link
          href="/supervisor/dashboard/scan"
          className="group bg-white p-6 rounded-2xl shadow hover:shadow-lg transition border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              📷 Scan Barcode
            </h3>
            <span className="text-blue-600 group-hover:translate-x-1 transition">
              →
            </span>
          </div>

          <p className="text-gray-500 mt-2 text-sm">
            Use camera to scan staff QR/Barcode for check-in and check-out.
          </p>
        </Link>

        {/* HISTORY CARD */}
        <Link
          href="/supervisor/history"
          className="group bg-white p-6 rounded-2xl shadow hover:shadow-lg transition border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              📊 Attendance History
            </h3>
            <span className="text-green-600 group-hover:translate-x-1 transition">
              →
            </span>
          </div>

          <p className="text-gray-500 mt-2 text-sm">
            View all check-in/check-out logs and activity history.
          </p>
        </Link>
        {/* STUDENT CARD */}
<Link
  href="/students"
  className="group bg-white p-6 rounded-2xl shadow hover:shadow-lg transition border border-gray-100"
>
  <div className="flex items-center justify-between">
    <h3 className="text-xl font-semibold text-gray-800">
      🪪 Print Student Cards
    </h3>
    <span className="text-purple-600 group-hover:translate-x-1 transition">
      →
    </span>
  </div>

  <p className="text-gray-500 mt-2 text-sm">
    Generate QR codes and print student ID cards.
  </p>
</Link>

      </section>

      {/* FOOTER NOTE */}
      <footer className="mt-12 text-center text-sm text-gray-500">
        CheckInAI • Supervisor Control Panel
      </footer>

    </main>
  );
}