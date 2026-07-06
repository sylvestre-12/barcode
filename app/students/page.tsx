"use client";

import { useEffect, useMemo, useState } from "react";
import StudentQR from "@/components/StudentQR";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Student = {
  id: string;
  studentId: string;
  name: string;
  email: string | null;
  department: string | null;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  // ===============================
  // FIXED API CALL (IMPORTANT)
  // ===============================
  async function loadStudents() {
    try {
      setLoading(true);

      const res = await fetch("/api/student"); // ✅ FIXED HERE

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to load students");
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

  // ===============================
  // REAL PDF DOWNLOAD FUNCTION
  // ===============================
  async function downloadPDF(
    id: string,
    name: string,
    studentId: string
  ) {
    const card = document.getElementById(id);

    if (!card) return;

    const canvas = await html2canvas(card, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [54, 86], // ID CARD SIZE
    });

    pdf.addImage(imgData, "PNG", 0, 0, 86, 54);

    pdf.save(`${name}_${studentId}.pdf`);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">
          Student Cards
        </h1>

        <p className="text-gray-500 mb-8">
          Search students and download official ID cards.
        </p>

        {/* SEARCH */}
        <input
          placeholder="Search student..."
          className="w-full p-3 border rounded-xl mb-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* STATES */}
        {loading && <p>Loading students...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && filtered.length === 0 && (
          <p>No students found.</p>
        )}

        {/* GRID */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filtered.map((student) => (

            <div
              key={student.id}
              id={student.id}
              className="
                w-[340px]
                h-[210px]
                rounded-2xl
                overflow-hidden
                bg-gradient-to-br
                from-blue-700
                to-blue-900
                text-white
                shadow-2xl
                p-4
              "
            >

              {/* HEADER */}
              <div className="border-b border-white/30 pb-2">
                <h1 className="text-lg font-bold">JESCA</h1>
                <p className="text-xs tracking-widest">
                  STUDENT IDENTIFICATION CARD
                </p>
              </div>

              {/* BODY */}
              <div className="flex mt-3 gap-3">

                {/* LEFT */}
                <div className="flex-1">

                  <h2 className="font-bold text-sm">
                    {student.name}
                  </h2>

                  <p className="text-xs">
                    {student.studentId}
                  </p>

                  <p className="text-xs">
                    {student.department}
                  </p>

                </div>

                {/* QR */}
                <div className="bg-white p-1 rounded-lg">
                  <StudentQR value={student.studentId} />
                </div>

              </div>

              {/* BUTTON */}
              <button
                onClick={() =>
                  downloadPDF(
                    student.id,
                    student.name,
                    student.studentId
                  )
                }
                className="
                  mt-4
                  w-full
                  bg-white
                  text-blue-700
                  font-bold
                  py-2
                  rounded-lg
                "
              >
                Download PDF
              </button>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}