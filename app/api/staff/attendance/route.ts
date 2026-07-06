import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.attendanceRecord.findMany({
      orderBy: {
        created_at: "desc",
      },
      include: {
        student: true, // ✅ correct relation from schema
      },
    });

    return NextResponse.json({
      data: records,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}