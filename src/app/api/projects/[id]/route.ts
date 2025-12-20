import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const result = await query(
      `SELECT p.*, u.name as author_name 
       FROM projects p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const id = Number(params.id);

    const check = await query('SELECT user_id FROM projects WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (check.rows[0].user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await query('DELETE FROM projects WHERE id = $1', [id]);
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
