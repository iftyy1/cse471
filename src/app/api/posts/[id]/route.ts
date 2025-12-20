import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const postId = parseInt(params.id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Check ownership or admin
    const postCheck = await query('SELECT user_id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (postCheck.rows[0].user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await query('DELETE FROM posts WHERE id = $1', [postId]);
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
