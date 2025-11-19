import { NextRequest, NextResponse } from "next/server";
import { posts, comments, getNextCommentId } from "@/lib/data";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);
    const postComments = comments[postId] || [];
    return NextResponse.json(postComments);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (!comments[postId]) {
      comments[postId] = [];
    }

    const newComment = {
      id: getNextCommentId(),
      postId,
      content: content.trim(),
      author: "Current User", // Replace with actual user from session
      authorId: 1, // Replace with actual user ID from session
      createdAt: new Date().toISOString(),
    };

    comments[postId].push(newComment);
    post.comments += 1;

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

