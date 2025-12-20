import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    // Get user profile
    const userResult = await query(
      `SELECT id, name, email, role, bio, avatar_url, is_verified, created_at FROM users WHERE id = $1`,
      [user.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userResult.rows[0];

    // Get post count
    const postsResult = await query(
      `SELECT COUNT(*) as count FROM posts WHERE user_id = $1`,
      [user.id]
    );
    const posts = parseInt(postsResult.rows[0].count) || 0;

    // Get followers count (if you have a followers table)
    // For now, using placeholder
    const followers = 0;

    // Get following count (if you have a following table)
    // For now, using placeholder
    const following = 0;

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      bio: userData.bio || "",
      avatarUrl: userData.avatar_url || "",
      isVerified: userData.is_verified || false,
      posts,
      followers,
      following,
      createdAt: userData.created_at,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const body = await request.json();
    const { name, bio, avatarUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Update user profile
    const result = await query(
      `UPDATE users SET name = $1, bio = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4
       RETURNING id, name, email, role, bio, avatar_url, is_verified, created_at`,
      [name, bio || "", avatarUrl || "", user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = result.rows[0];

    // Get post count
    const postsResult = await query(
      `SELECT COUNT(*) as count FROM posts WHERE user_id = $1`,
      [user.id]
    );
    const posts = parseInt(postsResult.rows[0].count) || 0;

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      bio: userData.bio || "",
      avatarUrl: userData.avatar_url || "",
      isVerified: userData.is_verified || false,
      posts,
      followers: 0,
      following: 0,
      createdAt: userData.created_at,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

