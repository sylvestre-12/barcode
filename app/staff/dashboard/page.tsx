"use client";

import { useEffect, useState } from "react";

type Attendance = {
  id: string;
  check_in: string;
  check_out: string | null;
  date: string;
  status: string;
  student: {
    name: string;
    email: string | null;
    studentId: string;
    department?: string | null;
  };
};

export default function StaffDashboard() {
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/staff/attendance");
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load data");
        return;
      }

      setData(json.data || []);
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Staff Attendance Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          View all check-in and check-out records
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* EMPTY */}
      {!loading && data.length === 0 && !error && (
        <div className="text-center text-gray-500 mt-10">
          No attendance records found
        </div>
      )}

      {/* DATA */}
      <div className="grid gap-4">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition border border-gray-100"
          >

            {/* TOP */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="font-semibold text-gray-800">
                  {item.student.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {item.student.email || "No email"}
                </p>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  item.status === "present"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {item.status}
              </span>
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
              <p>
                <b>Check In:</b>{" "}
                {new Date(item.check_in).toLocaleString()}
              </p>

              <p>
                <b>Check Out:</b>{" "}
                {item.check_out
                  ? new Date(item.check_out).toLocaleString()
                  : "Still inside"}
              </p>

              <p>
                <b>Student ID:</b> {item.student.studentId}
              </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}