"use client";

import { useEffect, useMemo, useState } from "react";
import StudentQR from "@/components/StudentQR";

type Student = {
  id: string;
  studentId: string;
  name: string;
  email: string | null;
  department: string |null;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);

      const res = await fetch("/api/student/create");

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error);
      }

      setStudents(json.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load students.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return students.filter((student) =>
      (
        student.name +
        " " +
        (student.email ?? "") +
        " " +
        student.studentId +
        " " +
        (student.department ?? "")
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [students, search]);

  function printCard(id: string) {
    const card = document.getElementById(id);

    if (!card) return;

    const win = window.open("", "_blank");

    if (!win) return;

    win.document.write(`
      <html>
      <head>
        <title>Student Card</title>

        <style>
        body{
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            font-family:Arial;
            background:white;
        }

        .card{
            width:350px;
        }
        </style>

      </head>

      <body>

      <div class="card">
      ${card.innerHTML}
      </div>

      </body>

      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  return (
    <main className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto p-8">

        <h1 className="text-4xl font-bold mb-2">
          Student Cards
        </h1>

        <p className="text-gray-500 mb-8">
          Search students and print their QR cards.
        </p>

        <input
          placeholder="Search student..."
          className="w-full p-3 border rounded-xl mb-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading && (
          <p>Loading students...</p>
        )}

        {error && (
          <p className="text-red-600">{error}</p>
        )}

        {!loading && filtered.length === 0 && (
          <p>No students found.</p>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filtered.map((student) => (

            <div
              key={student.id}
              id={student.id}
              className="bg-white rounded-2xl shadow-lg p-6"
            >

              <h2 className="text-xl font-bold">
                {student.name}
              </h2>

              <p className="text-gray-500">
                {student.email}
              </p>

              <p className="text-gray-500 mb-4">
                {student.department}
              </p>

              <div className="flex justify-center">
                <StudentQR value={student.studentId} />
              </div>

              <div className="text-center mt-4">

                <p className="font-semibold">
                  {student.studentId}
                </p>

              </div>

              <button
                onClick={() => printCard(student.id)}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3"
              >
                Print Card
              </button>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}