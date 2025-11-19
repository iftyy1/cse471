import { NextRequest, NextResponse } from "next/server";
import { chatMessages, getNextChatMessageId } from "@/lib/data";

const MAX_MESSAGE_LENGTH = 500;

export async function GET() {
  const sorted = [...chatMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return NextResponse.json(sorted);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const author = typeof body.author === "string" ? body.author.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!author) {
      return NextResponse.json({ error: "Author is required" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be under ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }

    const message = {
      id: getNextChatMessageId(),
      author,
      content,
      createdAt: new Date().toISOString(),
    };

    chatMessages.push(message);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}


