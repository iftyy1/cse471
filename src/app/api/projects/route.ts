import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        p.*,
        u.name as author_name
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const { title, description, tags, link, github, image } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO projects (title, description, tags, link, github, image, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, tags || [], link, github, image, user.id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
