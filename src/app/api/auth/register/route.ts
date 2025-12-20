import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/auth";
import { generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check email domain
    if (!email.endsWith('@g.bracu.ac.bd')) {
      return NextResponse.json(
        { error: "Registration is restricted to @g.bracu.ac.bd emails" },
        { status: 403 }
      );
    }

    if (role === 'admin') {
      return NextResponse.json(
        { error: "Admin registration is not allowed" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    let userRole = role || 'student';
    let requestedRole = null;

    if (userRole === 'student_tutor') {
      userRole = 'student';
      requestedRole = 'student_tutor';
    }

    const user = await createUser(name, email, password, userRole, requestedRole);
    const token = generateToken(user);

    return NextResponse.json(
      {
        message: "Registration successful",
        token,
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
