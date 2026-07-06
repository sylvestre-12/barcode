import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { barcode } = await req.json();

    // 1. Find student
    const student = await prisma.student.findUnique({
      where: { studentId: barcode },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // 2. Check if already scanned today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        student_id: student.id,
        created_at: {
          gte: today,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        message: "Already checked in today ⚠",
        student,
      });
    }

    // 3. Create attendance record
    await prisma.attendanceRecord.create({
      data: {
        student_id: student.id,
        barcode,
        check_in: new Date(),
        date: new Date(),
        status: "PRESENT",
      },
    });

    return NextResponse.json({
      message: "Check-in successful ✔",
      student,
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Scan failed" },
      { status: 500 }
    );
  }
}