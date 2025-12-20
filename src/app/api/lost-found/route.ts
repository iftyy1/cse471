import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    let queryText = `
      SELECT l.*, u.name as user_name, u.avatar_url 
      FROM lost_found_items l
      JOIN users u ON l.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (type) {
      params.push(type);
      conditions.push(`l.type = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`l.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ");
    }

    queryText += " ORDER BY l.created_at DESC";

    const result = await query(queryText, params);

    // Fetch comments for each item
    const items = await Promise.all(result.rows.map(async (item) => {
        const commentsResult = await query(`
            SELECT c.*, u.name as user_name, u.avatar_url
            FROM lost_found_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.item_id = $1
            ORDER BY c.created_at ASC
        `, [item.id]);
        return { ...item, comments: commentsResult.rows };
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching lost and found items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, type, location, date_lost_found, contact_info, image_url } = body;

    if (!title || !description || !type || !location || !date_lost_found || !contact_info) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO lost_found_items 
      (title, description, type, location, date_lost_found, contact_info, image_url, user_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [title, description, type, location, date_lost_found, contact_info, image_url, user.id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating lost and found item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
