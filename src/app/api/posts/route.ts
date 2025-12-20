import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'post';

  try {
    // Fetch all posts with author info, like count, and comment count
    const result = await query(`
      SELECT 
        p.id,
        p.content,
        p.created_at as "createdAt",
        p.type,
        u.id as "authorId",
        u.name as author,
        COALESCE(like_counts.likes, 0) as likes,
        COALESCE(comment_counts.comments, 0) as comments
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) as likes
        FROM post_likes
        GROUP BY post_id
      ) like_counts ON p.id = like_counts.post_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) as comments
        FROM comments
        GROUP BY post_id
      ) comment_counts ON p.id = comment_counts.post_id
      WHERE p.type = $1
      ORDER BY p.created_at DESC
    `, [type]);

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, type = 'post' } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Insert post into database
    const result = await query(
      `INSERT INTO posts (content, user_id, type) 
       VALUES ($1, $2, $3) 
       RETURNING id, content, created_at as "createdAt", type`,
      [content.trim(), user.id, type]
    );

    const newPost = result.rows[0];

    // Fetch user info for the response
    const userResult = await query(
      'SELECT id, name FROM users WHERE id = $1',
      [user.id]
    );

    return NextResponse.json({
      id: newPost.id,
      content: newPost.content,
      author: userResult.rows[0].name,
      authorId: user.id,
      createdAt: newPost.createdAt,
      type: newPost.type,
      likes: 0,
      comments: 0,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

