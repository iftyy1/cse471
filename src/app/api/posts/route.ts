import { NextRequest, NextResponse } from "next/server";
import { posts, getNextPostId } from "@/lib/data";

export async function GET() {
  return NextResponse.json(posts.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const newPost = {
      id: getNextPostId(),
      content: content.trim(),
      author: "Current User", // Replace with actual user from session
      authorId: 1, // Replace with actual user ID from session
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };

    posts.push(newPost);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

