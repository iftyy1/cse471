import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await query('SELECT id, name, email, role, requested_role, created_at, is_verified FROM users ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json({ error: "ID and role are required" }, { status: 400 });
    }

    // Update role and clear requested_role
    await query(
      'UPDATE users SET role = $1, requested_role = NULL WHERE id = $2',
      [role, id]
    );

    return NextResponse.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await query('DELETE FROM users WHERE id = $1', [userId]);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
