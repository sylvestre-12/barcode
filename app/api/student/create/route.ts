import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ===============================
// Generate Student ID
// ===============================
function generateStudentId() {
  return "STU-" + Math.floor(100000 + Math.random() * 900000);
}

// ===============================
// GET ALL STUDENTS
// ===============================
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}

// ===============================
// CREATE STUDENT
// ===============================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      className,
    } = body;

    // Validation
    if (!name || !email || !className) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email and class are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Check duplicate email
    const existing = await prisma.student.findUnique({
      where: {
        email,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Student email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // Generate unique student ID
    let studentId = generateStudentId();

    while (
      await prisma.student.findUnique({
        where: {
          studentId,
        },
      })
    ) {
      studentId = generateStudentId();
    }

    const student = await prisma.student.create({
      data: {
        studentId,
        name,
        email,
        department: className,
        qrCode: studentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student created successfully.",
      student,
    });
  } catch (error) {
    console.error("CREATE STUDENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}