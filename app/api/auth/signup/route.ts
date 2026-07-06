import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "120tegeri@gmail.com";

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      phone,
      username,
      role,
      password,
      confirmPassword,
    } = await req.json();

    // validation
    if (!name || !email || !username || !role || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.profile.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 👑 ADMIN AUTO VERIFY LOGIC
    const isAdmin = email === ADMIN_EMAIL;

    const user = await prisma.profile.create({
      data: {
        name,
        email,
        phone,
        username,
        role: isAdmin ? "admin" : role,
        password: hashedPassword,

        // IMPORTANT FIX HERE
        email_verified: isAdmin ? true : false,

        created_at: new Date(),
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified,
      },
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}