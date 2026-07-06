import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const updated = await prisma.profile.update({
      where: { id: userId },
      data: { approved: true },
    });

    return NextResponse.json({
      success: true,
      user: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to approve user" },
      { status: 500 }
    );
  }
}