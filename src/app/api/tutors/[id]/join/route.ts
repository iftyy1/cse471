import { NextRequest, NextResponse } from "next/server";
import { joinTutorSession } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const body = await request.json().catch(() => ({}));
  const student = typeof body.student === "string" ? body.student.trim() : "";

  if (!student) {
    return NextResponse.json({ error: "Student name is required" }, { status: 400 });
  }

  const result = joinTutorSession(id);

  if (!result.success) {
    if (result.status === "not_found") {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }
    if (result.status === "full") {
      return NextResponse.json({ message: "Session is full. Added to waitlist." }, { status: 409 });
    }
  }

  return NextResponse.json({
    message: "You have reserved a seat with this tutor",
    student,
    tutorId: id,
  });
}


