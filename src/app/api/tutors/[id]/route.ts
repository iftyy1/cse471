import { NextRequest, NextResponse } from "next/server";
import { tutorsData } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const tutor = tutorsData.find((item) => item.id === id);

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  }

  return NextResponse.json(tutor);
}


