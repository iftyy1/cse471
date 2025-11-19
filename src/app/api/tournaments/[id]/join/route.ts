import { NextRequest, NextResponse } from "next/server";
import { joinTournament } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const body = await request.json().catch(() => ({}));
  const participant = typeof body.participant === "string" ? body.participant.trim() : "";

  if (!participant) {
    return NextResponse.json({ error: "Participant name is required" }, { status: 400 });
  }

  const result = joinTournament(id);

  if (!result.success) {
    if (result.status === "not_found") {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }
    if (result.status === "full") {
      return NextResponse.json({ message: "Tournament is full. Added to waitlist." }, { status: 409 });
    }
  }

  return NextResponse.json({
    message: "You have joined the tournament roster",
    participant,
    tournamentId: id,
  });
}


