import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { transporter } from "@/lib/mailer";

const ADMIN_EMAIL = "120tegeri@gmail.com";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.profile.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // =========================
    // 👑 ADMIN OTP FLOW
    // =========================
    if (user.email === ADMIN_EMAIL) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await prisma.oTP.create({
        data: {
          user_id: user.id,
          code: otp,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      await transporter.sendMail({
        from: `"CheckInAI" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Admin OTP Code",
        text: `Your OTP is: ${otp}`,
      });

      return NextResponse.json({
        requireOtp: true,
        email: user.email,
        role: "admin",
      });
    }

    // =========================
    // STAFF / SUPERVISOR LOGIN (NO OTP)
    // =========================
       // =========================
    // STAFF / SUPERVISOR LOGIN (NO OTP)
    // =========================

    // 🔥 APPROVAL CHECK (IMPORTANT ADDITION)
    if (
      (user.role === "staff" || user.role === "supervisor") &&
      user.approved === false
    ) {
      return NextResponse.json(
        {
          error: "Please wait for admin to approve your account",
        },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    let nextRoute = "/dashboard";

    if (user.role === "staff") nextRoute = "/staff/dashboard";
    if (user.role === "supervisor") nextRoute = "/supervisor/dashboard";
    if (user.role === "admin") nextRoute = "/admin/dashboard";

    return NextResponse.json({
      requireOtp: false,
      token,
      nextRoute,
    });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}