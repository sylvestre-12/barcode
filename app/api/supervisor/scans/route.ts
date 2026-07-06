import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.attendanceRecord.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
      include: {
        student: true,
      },
    });

    return NextResponse.json(data);

  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load scans" },
      { status: 500 }
    );
  }
}