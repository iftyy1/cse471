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
      `SELECT l.*, u.name as user_name, u.avatar_url 
       FROM lost_found_items l
       JOIN users u ON l.user_id = u.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching item:", error);
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

    const check = await query('SELECT user_id FROM lost_found_items WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (check.rows[0].user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await query('DELETE FROM lost_found_items WHERE id = $1', [id]);
    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
