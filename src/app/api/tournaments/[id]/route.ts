import { NextRequest, NextResponse } from "next/server";
import { tournamentsData } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const tournament = tournamentsData.find((item) => item.id === id);

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  return NextResponse.json(tournament);
}


