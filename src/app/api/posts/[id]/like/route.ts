import { NextRequest, NextResponse } from "next/server";
import { posts, likes } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);
    const userId = 1; // Replace with actual user ID from session

    const post = posts.find((p) => p.id === postId);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (!likes[postId]) {
      likes[postId] = new Set();
    }

    const hasLiked = likes[postId].has(userId);
    if (hasLiked) {
      likes[postId].delete(userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      likes[postId].add(userId);
      post.likes += 1;
    }

    return NextResponse.json({
      liked: !hasLiked,
      likeCount: post.likes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

