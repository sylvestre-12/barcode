import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // =========================
    // FIND USER
    // =========================
    const user = await prisma.profile.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // =========================
    // FIND LATEST OTP (IMPORTANT FIX)
    // =========================
    const record = await prisma.oTP.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" }, // 🔥 important fix
    });

    if (!record) {
      return NextResponse.json(
        { error: "No OTP found" },
        { status: 404 }
      );
    }

    const cleanOtp = otp.toString().trim();

    // =========================
    // VALIDATE OTP
    // =========================
    if (record.code.toString().trim() !== cleanOtp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 401 }
      );
    }

    // =========================
    // VALIDATE EXPIRY
    // =========================
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      return NextResponse.json(
        { error: "OTP expired" },
        { status: 401 }
      );
    }

    // =========================
    // DELETE OTP (ONE TIME USE)
    // =========================
    await prisma.oTP.delete({
      where: { id: record.id },
    });

    // =========================
    // CREATE JWT
    // =========================
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json({
      success: true,
      nextRoute:
        user.role === "admin"
          ? "/admin/dashboard"
          : user.role === "staff"
          ? "/staff/dashboard"
          : user.role === "supervisor"
          ? "/supervisor/dashboard"
          : "/dashboard",
    });

    // =========================
    // SET COOKIE
    // =========================
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res;

  } catch (err) {
    console.error("OTP_VERIFY_ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}