import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_KEY =
  process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_KEY || process.env.OPENROUTER_KEY || process.env.OPEN_ROUTER;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let messages = body.messages;
    
    // Backward compatibility for single message
    if (!messages && body.message) {
      messages = [{ role: "user", content: body.message }];
    }

    if (!OPENROUTER_KEY) {
      return NextResponse.json({ 
        error: "OpenRouter API key not configured",
        output: "Configuration Error: The OpenRouter API key is missing. Please add OPENROUTER_KEY to your .env.local file to enable the chatbot."
      }, { status: 500 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: messages,
        max_tokens: 800,
      }),
    });

    const upstreamText = await resp.text();
    if (!resp.ok) {
      console.error("OpenRouter error", resp.status, upstreamText);
      return NextResponse.json({ 
        error: "Upstream OpenRouter error", 
        status: resp.status, 
        body: upstreamText,
        output: `Error from AI provider: ${resp.status} - ${upstreamText}`
      }, { status: 502 });
    }

    try {
      const data = JSON.parse(upstreamText);
      return NextResponse.json(data);
    } catch (e) {
      console.error("Failed to parse OpenRouter JSON", e, upstreamText);
      return NextResponse.json({ 
        error: "Invalid JSON from OpenRouter", 
        body: upstreamText,
        output: "Error: Received invalid response from AI provider."
      }, { status: 502 });
    }
  } catch (err) {
    console.error("Chat handler error", err);
    return NextResponse.json({ 
      error: "Chat request failed", 
      detail: String(err),
      output: `Internal Server Error: ${String(err)}`
    }, { status: 500 });
  }
}
